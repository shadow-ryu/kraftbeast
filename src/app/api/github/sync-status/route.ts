import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')

    if (!since) {
      return NextResponse.json({ error: 'Missing since parameter' }, { status: 400 })
    }

    const sinceDate = new Date(since)

    // Find the latest sync log for this user created after the 'since' date
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const latestLog = await prisma.syncLog.findFirst({
      where: {
        userId: dbUser.id,
        createdAt: {
          gt: sinceDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (latestLog) {
      return NextResponse.json({
        status: 'completed',
        result: latestLog.status, // 'success', 'partial', 'error'
        message: latestLog.message,
        details: {
          synced: latestLog.reposSynced,
          errors: latestLog.errors
        }
      })
    }

    // If no log found yet, it's still processing (or hasn't started, or failed silently)
    // We assume processing for now.
    return NextResponse.json({
      status: 'processing'
    })

  } catch (error) {
    console.error('Error checking sync status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
