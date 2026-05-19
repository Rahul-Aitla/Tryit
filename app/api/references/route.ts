import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { uploadToGCS } from '@/lib/storage'

const VALID_TYPES = ['model', 'pose', 'lighting', 'background', 'camera', 'vibe'] as const
type ReferenceType = typeof VALID_TYPES[number]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

    const references = await prisma.reference.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(references)
  } catch (error) {
    console.error('Fetch references error:', error)
    return NextResponse.json({ error: 'Failed to fetch references' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const projectId = formData.get('projectId') as string
    const referenceType = formData.get('referenceType') as ReferenceType
    const file = formData.get('file') as File

    if (!projectId || !referenceType || !file) {
      return NextResponse.json({ error: 'Missing projectId, referenceType, or file' }, { status: 400 })
    }

    if (!VALID_TYPES.includes(referenceType)) {
      return NextResponse.json({ error: `Invalid referenceType. Must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const gcsUrl = await uploadToGCS(buffer, file.name, file.type, 'references')

    const reference = await prisma.reference.create({
      data: {
        projectId,
        referenceType,
        imageUrl: gcsUrl,
      },
    })

    return NextResponse.json(reference)
  } catch (error) {
    console.error('Upload reference error:', error)
    return NextResponse.json({
      error: 'Failed to upload reference',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await prisma.reference.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete reference error:', error)
    return NextResponse.json({ error: 'Failed to delete reference' }, { status: 500 })
  }
}
