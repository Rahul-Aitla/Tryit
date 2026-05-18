import { Queue } from 'bullmq'
import Redis from 'ioredis'
import * as dotenv from 'dotenv'

dotenv.config()

const redisUrl = process.env.REDIS_URL

if (!redisUrl) {
  console.warn('⚠️ REDIS_URL is not defined in environment variables. Defaulting to localhost:6379')
}

const connection = new Redis(redisUrl || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

export const generationQueue = new Queue('generation-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
})

export { connection }
