import { NextResponse } from 'next/server'

/**
 * Trigger GitHub Actions workflow when a new generation job is queued
 * This ensures jobs start processing immediately instead of waiting up to 10 minutes
 */
export async function POST() {
  try {
    const token = process.env.GH_WORKER_TOKEN
    const owner = 'Rahul-Aitla'
    const repo = 'Tryit'
    
    if (!token) {
      console.warn('⚠️  GH_WORKER_TOKEN not set - worker will run on schedule only')
      return NextResponse.json({ 
        message: 'Worker triggered by schedule (no GitHub token for on-demand)',
        scheduled: true 
      })
    }

    // Trigger workflow_dispatch for AI Generation Worker
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+raw+json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'start-worker',
          client_payload: {
            timestamp: new Date().toISOString()
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error(`GitHub API error (${response.status}):`, error)
      return NextResponse.json(
        { message: 'Failed to trigger worker', error },
        { status: response.status }
      )
    }

    console.log('✅ GitHub Actions worker triggered on-demand')
    return NextResponse.json({ 
      message: 'Worker triggered successfully',
      onDemand: true 
    })
  } catch (error) {
    console.error('Error triggering worker:', error)
    return NextResponse.json(
      { message: 'Failed to trigger worker', error: String(error) },
      { status: 500 }
    )
  }
}
