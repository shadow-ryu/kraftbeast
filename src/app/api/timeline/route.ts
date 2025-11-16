
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { githubHandle: username }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Default to last 90 days if no range specified
    const now = new Date()
    const defaultFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    
    const from = fromParam ? new Date(fromParam) : defaultFrom
    const to = toParam ? new Date(toParam) : now

    const timeline = await prisma.timeline.findMany({
      where: { 
        userId: user.id,
        hidden: false,
        timestamp: {
          gte: from,
          lte: to
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    })

    return NextResponse.json({ timeline, from, to })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
