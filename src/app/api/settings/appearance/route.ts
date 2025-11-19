import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { accentColor } = await req.json()

    if (!accentColor) {
      return NextResponse.json({ error: 'Accent color is required' }, { status: 400 })
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: { accentColor }
    })

    return NextResponse.json({ accentColor })
  } catch (error) {
    console.error('Error updating appearance:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { accentColor: true }
    })

    return NextResponse.json({ accentColor: user?.accentColor })
  } catch (error) {
    console.error('Error fetching appearance:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
