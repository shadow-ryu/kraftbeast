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
        repos: true,
        workHistory: true,
        timeline: true,
        syncLogs: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove sensitive data
    const exportData = {
      ...user,
      githubToken: undefined,
      clerkId: undefined,
    }

    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="kraftbeast-data-${Date.now()}.json"`,
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
