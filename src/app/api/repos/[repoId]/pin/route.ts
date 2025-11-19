import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { repoId } = await params
    const { isPinned } = await request.json()

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If pinning, get the next order number
    let pinnedOrder = null
    if (isPinned) {
      const maxOrder = await prisma.repo.findFirst({
        where: { userId: user.id, isPinned: true },
        orderBy: { pinnedOrder: 'desc' },
        select: { pinnedOrder: true }
      })
      pinnedOrder = (maxOrder?.pinnedOrder || 0) + 1
    }

    // Update repo pin status
    const repo = await prisma.repo.update({
      where: {
        id: repoId,
        userId: user.id,
      },
      data: {
        isPinned,
        pinnedOrder: isPinned ? pinnedOrder : null,
      },
    })

    return NextResponse.json({ success: true, repo })
  } catch (error) {
    console.error('Toggle pin error:', error)
    return NextResponse.json(
      { error: 'Failed to update pin status' },
      { status: 500 }
    )
  }
}
