import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { repoId } = await params

    // Get repo from database
    const repo = await prisma.repo.findUnique({
      where: { id: repoId },
      include: { user: true }
    })

    if (!repo) {
      return NextResponse.json({ error: 'Repo not found' }, { status: 404 })
    }

    if (!repo.user.githubToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      )
    }

    // Fetch README from GitHub API
    const readmeUrl = `https://api.github.com/repos/${repo.user.githubHandle}/${repo.name}/readme`
    const response = await fetch(readmeUrl, {
      headers: {
        'Authorization': `Bearer ${repo.user.githubToken}`,
        'Accept': 'application/vnd.github.v3.raw',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'README not found or not accessible' },
        { status: 404 }
      )
    }

    const content = await response.text()
    
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Fetch README error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch README' },
      { status: 500 }
    )
  }
}
