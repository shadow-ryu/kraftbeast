import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        repos: {
          orderBy: [
            { isPinned: 'desc' },
            { pinnedOrder: 'asc' },
            { lastPushed: 'desc' }
          ]
        }
      }
    })

    if (!dbUser) {
      const user = await currentUser()
      const email = user?.emailAddresses[0]?.emailAddress
      
      if (!email) {
        return NextResponse.json({ error: 'No email found' }, { status: 400 })
      }

      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
          avatarUrl: user.imageUrl,
        },
        include: { repos: true }
      })
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        avatarUrl: dbUser.avatarUrl,
        githubHandle: dbUser.githubHandle,
        githubConnected: dbUser.githubConnected,
        githubAppConnected: (dbUser as { githubAppConnected?: boolean })?.githubAppConnected || false,
        lastSyncedAt: (dbUser as { lastSyncedAt?: Date | null })?.lastSyncedAt,
        visits: dbUser.visits,
      },
      repos: dbUser.repos,
      stats: {
        totalRepos: dbUser.repos.length,
        totalStars: dbUser.repos.reduce((sum, repo) => sum + repo.stars, 0),
        totalVisits: dbUser.visits,
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
