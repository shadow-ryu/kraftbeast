
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { githubHandle: username }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const timeline = await prisma.timeline.findMany({
      where: { 
        userId: user.id,
        hidden: false
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    })

    return NextResponse.json(timeline)
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
