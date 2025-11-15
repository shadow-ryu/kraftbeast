import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, company, startDate, endDate, bullets } = body

    const workHistory = await prisma.workHistory.create({
      data: {
        userId: user.id,
        title,
        company,
        startDate,
        endDate,
        bullets: bullets || []
      }
    })

    return NextResponse.json(workHistory)
  } catch (error) {
    console.error('Error creating work history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const workHistory = await prisma.workHistory.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(workHistory)
  } catch (error) {
    console.error('Error fetching work history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
