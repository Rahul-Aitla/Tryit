import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { uploadToGCS } from '@/lib/storage'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const projectId = formData.get('projectId') as string
    const files = formData.getAll('files') as File[]
    const category = formData.get('category') as string || 'General'

    if (!projectId || files.length === 0) {
      return NextResponse.json({ error: 'Missing projectId or files' }, { status: 400 })
    }

    const uploadResults = []

    for (const file of files) {
      // 1. Get buffer for GCS
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // 2. Upload to GCS in an organized folder
      const gcsUrl = await uploadToGCS(buffer, file.name, file.type, 'outfits')

      // 3. Save to Database
      const outfit = await prisma.outfit.create({
        data: {
          projectId,
          imageUrl: gcsUrl,
          category,
          uploadStatus: 'Uploaded',
        }
      })
      
      uploadResults.push(outfit)
    }
    
    return NextResponse.json({
      message: `Successfully uploaded ${uploadResults.length} outfits`,
      data: uploadResults
    })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload outfit', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
