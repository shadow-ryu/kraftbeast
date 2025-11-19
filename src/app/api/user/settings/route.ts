import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { twitterHandle, forwardEmail, defaultRepoView, timelineRangeFrom, timelineRangeTo, accentColor } = body

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        ...(twitterHandle !== undefined && { twitterHandle: twitterHandle || null }),
        ...(forwardEmail !== undefined && { forwardEmail: forwardEmail || null }),
        ...(defaultRepoView !== undefined && { defaultRepoView }),
        ...(timelineRangeFrom !== undefined && { timelineRangeFrom: timelineRangeFrom ? new Date(timelineRangeFrom) : null }),
        ...(timelineRangeTo !== undefined && { timelineRangeTo: timelineRangeTo ? new Date(timelineRangeTo) : null }),
        ...(accentColor !== undefined && { accentColor })
      }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
