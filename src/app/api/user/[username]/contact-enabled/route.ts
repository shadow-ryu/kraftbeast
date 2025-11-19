import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const user = await prisma.user.findUnique({
      where: { githubHandle: username },
      select: {
        resendApiKey: true,
        forwardEmail: true
      }
    })

    if (!user) {
      return NextResponse.json({ enabled: false })
    }

    // Contact form is enabled if user has both Resend key and forward email
    const enabled = !!(user.resendApiKey && user.forwardEmail)

    return NextResponse.json({ enabled })
  } catch (error) {
    console.error('Error checking contact enabled:', error)
    return NextResponse.json({ enabled: false })
  }
}
