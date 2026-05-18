import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$connect()
    
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { outfits: true }
        }
      }
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Fetch projects error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch projects',
      details: error instanceof Error ? error.message : 'Database connection failed'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await prisma.$connect()
    const { projectName, userId } = await request.json()
    
    const targetUserId = userId || 'default-user-id'

    // Ensure user exists before creating project (Foreign Key requirement)
    await prisma.user.upsert({
      where: { id: targetUserId },
      update: {},
      create: {
        id: targetUserId,
        name: 'Default User',
        email: 'default@example.com'
      }
    })
    
    const project = await prisma.project.create({
      data: {
        projectName,
        userId: targetUserId,
        status: 'Active',
      }
    })
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
