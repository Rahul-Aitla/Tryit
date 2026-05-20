import { Worker } from 'bullmq'
import { connection } from '@/lib/queue'
import prisma from '@/lib/prismaWorker'  // ← uses DIRECT_URL to bypass pgbouncer
import { generateOutfitImage } from '@/server/ai/nanoBanana'

export const setupWorker = () => {
  const worker = new Worker(
    'generation-queue',
    async (job) => {
      const { jobId, outfitId, prompt, outputsRequested, referenceSelections } = job.data

      console.log(`[Worker] Processing Job ${jobId} for Outfit ${outfitId} (${outputsRequested} outputs)`)

      // 1. Update status to 'Processing'
      await prisma.generationJob.update({
        where: { id: jobId },
        data: { status: 'Processing', progress: 10 }
      })

      // 2. Fetch outfit + references
      const outfit = await prisma.outfit.findUnique({
        where: { id: outfitId },
        include: {
          project: {
            include: { references: true }
          }
        }
      })

      if (!outfit) throw new Error('Outfit not found in database')

      await prisma.generationJob.update({
        where: { id: jobId },
        data: { progress: 20 }
      })

      const references = {
        lighting:  outfit.project.references.find(r => r.referenceType === 'lighting')?.imageUrl,
        pose:      outfit.project.references.find(r => r.referenceType === 'pose')?.imageUrl,
        background:outfit.project.references.find(r => r.referenceType === 'background')?.imageUrl,
        modelType: outfit.project.references.find(r => r.referenceType === 'model')?.imageUrl,
        camera:    outfit.project.references.find(r => r.referenceType === 'camera')?.imageUrl,
        vibe:      outfit.project.references.find(r => r.referenceType === 'vibe')?.imageUrl,
      }

      await prisma.generationJob.update({
        where: { id: jobId },
        data: { progress: 30 }
      })

      // 3. Call Nano Banana (Gemini) AI
      const results = await generateOutfitImage({
        outfitImageUrl: outfit.imageUrl,
        creativeDirection: prompt,
        outputsRequested,
        references,
        referenceSelections: referenceSelections || {}
      })

      if (!results || results.length === 0) {
        throw new Error('AI generation returned no images')
      }

      await prisma.generationJob.update({
        where: { id: jobId },
        data: { progress: 80 }
      })

      console.log(`[Worker] AI returned ${results.length} images. Saving to DB...`)

      // 4. Save each generated image individually (no transaction — pgbouncer safe)
      let savedCount = 0
      for (const res of results) {
        try {
          await prisma.generatedImage.create({
            data: {
              jobId: jobId,
              imageUrl: res.url
            }
          })
          savedCount++
          
          // Increment progress slightly for each image saved
          const progressStep = Math.floor(15 / results.length)
          await prisma.generationJob.update({
            where: { id: jobId },
            data: { progress: 80 + (savedCount * progressStep) }
          })

          console.log(`[Worker] Saved image ${savedCount}/${results.length}: ${res.url.slice(-40)}`)
        } catch (saveErr) {
          console.error(`[Worker] Failed to save image ${savedCount + 1}:`, saveErr)
        }
      }

      if (savedCount === 0) {
        throw new Error(`All ${results.length} images failed to save to database`)
      }

      // 5. Mark job Completed only AFTER images are confirmed saved
      await prisma.generationJob.update({
        where: { id: jobId },
        data: { status: 'Completed', progress: 100 }
      })

      await prisma.outfit.update({
        where: { id: outfitId },
        data: { uploadStatus: 'Done' }
      })

      console.log(`[Worker] ✅ Job ${jobId} Completed — ${savedCount}/${results.length} images saved`)
      return { savedCount, total: results.length }
    },
    { connection, concurrency: 2 }
  )

  worker.on('completed', (job, result) => {
    console.log(`[Worker] 🎉 Job ${job.id} done — ${result?.savedCount} images in gallery`)
  })

  worker.on('failed', async (job, err) => {
    console.error(`[Worker] ❌ Job ${job?.id} failed: ${err.message}`)
    
    if (!job) return
    const { jobId, outfitId } = job.data
    
    try {
      await prisma.generationJob.update({
        where: { id: jobId },
        data: {
          status: 'Failed',
          failedReason: err.message.slice(0, 500) // truncate to fit column
        }
      })
      await prisma.outfit.update({
        where: { id: outfitId },
        data: { uploadStatus: 'Error' }
      })
    } catch (dbErr) {
      console.error('[Worker] Could not update failed status in DB:', dbErr)
    }
  })

  return worker
}
