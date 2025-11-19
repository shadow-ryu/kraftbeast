import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        repos: {
          orderBy: { views: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            views: true,
            stars: true,
          }
        },
        syncLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const totalRepoViews = await prisma.repo.aggregate({
      where: { userId: user.id },
      _sum: { views: true }
    })

    return NextResponse.json({
      portfolioVisits: user.visits,
      totalRepoViews: totalRepoViews._sum.views || 0,
      topRepos: user.repos,
      syncLogs: user.syncLogs,
      lastSyncedAt: user.lastSyncedAt,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
