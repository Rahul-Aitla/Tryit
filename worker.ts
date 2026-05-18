import * as dotenv from 'dotenv'
dotenv.config()

import { setupWorker } from './server/workers/generationWorker'
import { connection } from './lib/queue'

console.log('🚀 Starting AI Generation Worker...')

async function checkConnections() {
  try {
    console.log('📡 Checking Redis connection...')
    await connection.ping()
    console.log('✅ Redis is reachable')
    
    setupWorker()
    console.log('✅ Worker is listening for jobs on "generation-queue"')
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  }
}

checkConnections()
