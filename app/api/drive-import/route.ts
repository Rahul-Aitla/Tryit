import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { uploadToGCS } from '@/lib/storage'

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'
const DRIVE_READONLY_SCOPE = 'https://www.googleapis.com/auth/drive.readonly'

// ─── Service-Account JWT auth ────────────────────────────────────────────────

/**
 * Mint a short-lived Google OAuth2 Bearer token from the GCS service account
 * credentials already stored in env vars. Works for any Google API enabled in
 * the project — no separate API key needed.
 */
async function getServiceAccountToken(): Promise<string> {
  const privateKey = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const clientEmail = process.env.GCS_CLIENT_EMAIL

  if (!privateKey || !clientEmail) {
    throw new Error('GCS_PRIVATE_KEY or GCS_CLIENT_EMAIL env vars are missing')
  }

  const now = Math.floor(Date.now() / 1000)

  // Build the JWT header + payload as base64url
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: DRIVE_READONLY_SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url')

  // Sign with the service account private key (RS256)
  const signingInput = `${header}.${payload}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(signingInput)
  const signature = signer.sign(privateKey, 'base64url')

  const jwt = `${signingInput}.${signature}`

  // Exchange JWT for a Google access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error(`Failed to obtain service account access token: ${err}`)
  }

  const { access_token } = await tokenRes.json()
  return access_token as string
}

// ─── Drive URL parsing ────────────────────────────────────────────────────────

/**
 * Extract a Google Drive file/folder ID from various URL formats:
 *   https://drive.google.com/drive/folders/<id>
 *   https://drive.google.com/drive/u/0/folders/<id>
 *   https://drive.google.com/file/d/<id>/view
 *   https://drive.google.com/open?id=<id>
 *   https://drive.google.com/uc?id=<id>
 */
function parseDriveId(url: string): { id: string; type: 'folder' | 'file' } | null {
  try {
    const u = new URL(url)

    const folderMatch = u.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/)
    if (folderMatch) return { id: folderMatch[1], type: 'folder' }

    const fileMatch = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileMatch) return { id: fileMatch[1], type: 'file' }

    const idParam = u.searchParams.get('id')
    if (idParam) return { id: idParam, type: 'file' }

    return null
  } catch {
    return null
  }
}

// ─── Drive API helpers ────────────────────────────────────────────────────────

async function listFolderImages(folderId: string, token: string) {
  const query = encodeURIComponent(
    `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`
  )
  const fields = encodeURIComponent('files(id,name,mimeType,size)')
  const url = `${DRIVE_API_BASE}/files?q=${query}&fields=${fields}&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Drive folder listing failed (${res.status}): ${err}`)
  }

  const data = await res.json()
  return (data.files ?? []) as Array<{ id: string; name: string; mimeType: string; size?: string }>
}

async function getFileMeta(fileId: string, token: string) {
  const fields = encodeURIComponent('id,name,mimeType,size')
  const url = `${DRIVE_API_BASE}/files/${fileId}?fields=${fields}&supportsAllDrives=true`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`Drive file metadata failed (${res.status}): ${await res.text()}`)
  return res.json() as Promise<{ id: string; name: string; mimeType: string; size?: string }>
}

async function downloadFile(fileId: string, token: string): Promise<Buffer> {
  const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media&supportsAllDrives=true`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error(`Drive file download failed (${res.status}): ${await res.text()}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { driveUrl, projectId } = await request.json()

    if (!driveUrl || !projectId) {
      return NextResponse.json({ error: 'Missing driveUrl or projectId' }, { status: 400 })
    }

    const parsed = parseDriveId(driveUrl)
    if (!parsed) {
      return NextResponse.json(
        { error: 'Could not parse a valid Google Drive ID from the URL. Please use a standard Drive share link.' },
        { status: 400 }
      )
    }

    // Get a service account Bearer token (no restricted API key needed)
    const token = await getServiceAccountToken()

    // Build the list of image files to process
    let filesToProcess: Array<{ id: string; name: string; mimeType: string }> = []

    if (parsed.type === 'folder') {
      filesToProcess = await listFolderImages(parsed.id, token)
      if (filesToProcess.length === 0) {
        return NextResponse.json(
          {
            error:
              'No image files found in this folder. ' +
              'Make sure the folder contains images and is shared as "Anyone with the link can view".',
          },
          { status: 404 }
        )
      }
    } else {
      const meta = await getFileMeta(parsed.id, token)
      if (!meta.mimeType?.startsWith('image/')) {
        return NextResponse.json({ error: 'The linked file is not an image.' }, { status: 400 })
      }
      filesToProcess = [meta]
    }

    // Cap at 20 images per import to keep response times reasonable
    const limited = filesToProcess.slice(0, 20)
    const uploadResults = []

    for (const driveFile of limited) {
      try {
        const buffer = await downloadFile(driveFile.id, token)
        const gcsUrl = await uploadToGCS(buffer, driveFile.name, driveFile.mimeType, 'outfits')

        const outfit = await prisma.outfit.create({
          data: {
            projectId,
            imageUrl: gcsUrl,
            category: 'Drive Import',
            uploadStatus: 'Uploaded',
          },
        })

        uploadResults.push(outfit)
      } catch (fileErr) {
        console.error(`[DriveImport] Skipped file "${driveFile.name}":`, fileErr)
      }
    }

    if (uploadResults.length === 0) {
      return NextResponse.json(
        {
          error:
            'All files failed to download. Make sure the Drive folder/file is set to ' +
            '"Anyone with the link can view".',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Successfully imported ${uploadResults.length} image(s) from Google Drive`,
      data: uploadResults,
      totalFound: filesToProcess.length,
      imported: uploadResults.length,
    })
  } catch (error) {
    console.error('[DriveImport] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to import from Google Drive',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
