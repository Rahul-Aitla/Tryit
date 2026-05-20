import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generationQueue } from '@/lib/queue'

export async function GET() {
  try {
    await prisma.$connect()
    const jobs = await prisma.generationJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        outfit: true
      }
    })
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Fetch jobs error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { outfitId, prompt, outputsRequested, referenceSelections } = await request.json()
    
    // 1. Create a job record in the database
    const jobRecord = await prisma.generationJob.create({
      data: {
        outfitId,
        prompt,
        outputsRequested: outputsRequested || 1,
        status: 'Queued',
      }
    })
    
    // 2. Add to BullMQ for processing
    await generationQueue.add('process-outfit', {
      jobId: jobRecord.id,
      outfitId,
      prompt,
      outputsRequested: outputsRequested || 1,
      referenceSelections: referenceSelections || {},
    })
    
    // 3. Update outfit status
    await prisma.outfit.update({
      where: { id: outfitId },
      data: { uploadStatus: 'Processing' }
    })
    
    // 4. Trigger GitHub Actions worker immediately (no-wait trigger)
    // This ensures jobs start processing ASAP instead of waiting for schedule
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/worker/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {
        // Silent fail - worker will run on schedule anyway
        console.log('ℹ️  On-demand worker trigger skipped (will run on schedule)')
      })
    } catch (e) {
      console.log('ℹ️  Could not trigger on-demand worker')
    }
    
    return NextResponse.json({ 
      message: 'Generation job queued', 
      jobId: jobRecord.id,
      processingStartsIn: 'immediately (via on-demand trigger) or within 3 minutes (scheduled)'
    })
  } catch (error) {
    console.error('Queue Error:', error)
    return NextResponse.json({ error: 'Failed to queue generation job' }, { status: 500 })
  }
}
