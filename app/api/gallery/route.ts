import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$connect()
    const generatedImages = await prisma.generatedImage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          include: {
            outfit: true,
          },
        },
      },
    })

    // Filter out orphaned records
    const validImages = generatedImages.filter(img => img.job && img.job.outfit)

    const transformedItems = validImages.map(img => ({
      id: img.id,
      title: img.job.outfit.sku || img.job.outfit.category || 'Generated Outfit',
      category: img.job.outfit.category || 'Collection',
      original: img.job.outfit.imageUrl,
      generated: img.imageUrl,
      // Grouping fields
      outfitId: img.job.outfit.id,
      outfitName: img.job.outfit.sku || img.job.outfit.category || 'Outfit',
      jobId: img.jobId,
      createdAt: img.createdAt,
    }))

    return NextResponse.json(transformedItems)
  } catch (error) {
    console.error('Gallery Fetch Error:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery items' }, { status: 500 })
  }
}
