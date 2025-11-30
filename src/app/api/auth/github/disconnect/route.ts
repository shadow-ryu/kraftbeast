import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Disconnect GitHub from user
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        githubHandle: null,
        githubToken: null,
        githubConnected: false,
        githubInstallationId: null,
        githubAppConnected: false,
        lastSyncedAt: null,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect GitHub' },
      { status: 500 }
    )
  }
}
