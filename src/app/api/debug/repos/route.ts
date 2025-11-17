import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Debug endpoint to check repos in database
 * Remove this in production
 */
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
          orderBy: { lastPushed: 'desc' },
          select: {
            id: true,
            name: true,
            isPrivate: true,
            isVisible: true,
            stars: true,
            commits: true,
            lastPushed: true,
          }
        } 
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      totalRepos: user.repos.length,
      repos: user.repos,
      githubHandle: user.githubHandle,
      githubInstallationId: (user as { githubInstallationId?: string | null }).githubInstallationId,
      githubAppConnected: (user as { githubAppConnected?: boolean }).githubAppConnected,
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debug info' },
      { status: 500 }
    )
  }
}
