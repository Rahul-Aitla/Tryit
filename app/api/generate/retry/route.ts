import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generationQueue } from '@/lib/queue'

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json()
    
    // 1. Fetch existing job
    const existingJob = await prisma.generationJob.findUnique({
      where: { id: jobId }
    })
    
    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    
    // 2. Update job status and retry count
    const updatedJob = await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: 'Queued',
        retryCount: { increment: 1 },
        failedReason: null
      }
    })
    
    // 3. Re-add to BullMQ
    await generationQueue.add('process-outfit', {
      jobId: updatedJob.id,
      outfitId: updatedJob.outfitId,
      prompt: updatedJob.prompt,
      outputsRequested: updatedJob.outputsRequested
    })
    
    return NextResponse.json({ message: 'Job re-queued successfully' })
  } catch (error) {
    console.error('Retry error:', error)
    return NextResponse.json({ error: 'Failed to retry job' }, { status: 500 })
  }
}
