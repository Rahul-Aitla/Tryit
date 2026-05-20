import * as dotenv from 'dotenv'
dotenv.config()

import { setupWorker } from './server/workers/generationWorker'
import { connection } from './lib/queue'

console.log('🚀 Starting AI Generation Worker...')

let worker: any = null
let isShuttingDown = false

async function checkConnections() {
  try {
    console.log('📡 Checking Redis connection...')
    await connection.ping()
    console.log('✅ Redis is reachable')
    
    worker = setupWorker()
    console.log('✅ Worker is listening for jobs on "generation-queue"')
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  }
}

// Graceful shutdown handler
async function shutdown(signal: string) {
  if (isShuttingDown) return
  isShuttingDown = true
  
  console.log(`\n⏹️  Received ${signal}, shutting down gracefully...`)
  
  try {
    if (worker) {
      console.log('Closing worker...')
      await worker.close()
      console.log('✅ Worker closed')
    }
    
    console.log('Disconnecting from Redis...')
    await connection.quit()
    console.log('✅ Redis disconnected')
    
    console.log('✅ Graceful shutdown complete')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during shutdown:', error)
    process.exit(1)
  }
}

// Register signal handlers
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

checkConnections()
