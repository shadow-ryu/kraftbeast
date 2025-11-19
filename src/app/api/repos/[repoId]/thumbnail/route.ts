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
    const { thumbnail } = await request.json()

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update repo thumbnail
    const repo = await prisma.repo.update({
      where: {
        id: repoId,
        userId: user.id,
      },
      data: {
        thumbnail,
      },
    })

    return NextResponse.json({ success: true, repo })
  } catch (error) {
    console.error('Update thumbnail error:', error)
    return NextResponse.json(
      { error: 'Failed to update thumbnail' },
      { status: 500 }
    )
  }
}
