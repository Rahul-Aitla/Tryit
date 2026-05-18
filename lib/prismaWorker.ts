/**
 * prismaWorker.ts — Direct DB connection for the background worker.
 *
 * The worker performs long-running AI generation jobs (minutes per image).
 * Using the pgbouncer pooled URL (DATABASE_URL) for writes causes
 * "Transaction API error: Unable to start a transaction in the given time"
 * because pgbouncer holds connections for short-lived queries, not long jobs.
 *
 * Solution: use DIRECT_URL (bypasses pgbouncer) for the worker's Prisma client.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL must be defined for the worker')
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,                   // small pool — only the worker uses this
  idleTimeoutMillis: 60000, // keep connections alive during long AI jobs
  connectionTimeoutMillis: 10000,
})

const adapter = new PrismaPg(pool)
const prismaWorker = new PrismaClient({ adapter })

export default prismaWorker
