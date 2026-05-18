import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { uploadToGCS } from '@/lib/storage'

export async function GET() {
  const results = {
    database: 'Pending',
    gcs: 'Pending',
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      GCS_BUCKET_NAME: !!process.env.GCS_BUCKET_NAME,
      GCS_PROJECT_ID: !!process.env.GCS_PROJECT_ID,
      GCS_CLIENT_EMAIL: !!process.env.GCS_CLIENT_EMAIL,
      GCS_PRIVATE_KEY: !!process.env.GCS_PRIVATE_KEY,
    }
  }

  // 1. Test Database
  try {
    await prisma.$connect()
    results.database = 'Connected successfully'
  } catch (error) {
    results.database = `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  // 2. Test GCS
  try {
    const testBuffer = Buffer.from('test connection')
    const url = await uploadToGCS(testBuffer, 'test-connection.txt', 'text/plain', 'outfits')
    results.gcs = `Upload successful: ${url}`
  } catch (error) {
    results.gcs = `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  return NextResponse.json(results)
}
