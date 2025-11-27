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
      select: { subdomain: true }
    })

    return NextResponse.json({ subdomain: user?.subdomain || null })
  } catch (error) {
    console.error('Error fetching subdomain:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subdomain } = body

    // Validate subdomain format
    if (subdomain) {
      // Must be lowercase alphanumeric with hyphens, 3-63 characters
      const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/
      if (!subdomainRegex.test(subdomain)) {
        return NextResponse.json(
          { error: 'Invalid subdomain format. Use lowercase letters, numbers, and hyphens only (3-63 characters).' },
          { status: 400 }
        )
      }

      // Check for reserved subdomains
      const reserved = ['www', 'api', 'app', 'admin', 'dashboard', 'mail', 'ftp', 'localhost', 'staging', 'dev', 'test']
      if (reserved.includes(subdomain.toLowerCase())) {
        return NextResponse.json(
          { error: 'This subdomain is reserved and cannot be used.' },
          { status: 400 }
        )
      }

      // Check if subdomain is already taken
      const existing = await prisma.user.findUnique({
        where: { subdomain },
        select: { id: true, clerkId: true }
      })

      if (existing && existing.clerkId !== userId) {
        return NextResponse.json(
          { error: 'This subdomain is already taken.' },
          { status: 409 }
        )
      }
    }

    // Update subdomain
    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: { subdomain: subdomain || null }
    })

    return NextResponse.json({ 
      success: true, 
      subdomain: user.subdomain,
      url: user.subdomain ? `https://${user.subdomain}.kraftbeast.com` : null
    })
  } catch (error) {
    console.error('Error updating subdomain:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
