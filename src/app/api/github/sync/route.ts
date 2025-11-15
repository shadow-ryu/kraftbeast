import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress
    
    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    // Get user from database with GitHub token
    const dbUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!dbUser?.githubToken) {
      return NextResponse.json(
        { error: 'GitHub not connected. Please connect your GitHub account.' },
        { status: 400 }
      )
    }

    const githubToken = dbUser.githubToken

    // Fetch repos from GitHub API
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub repos')
    }

    const repos = await response.json()

    // User already fetched above with token check

    // Sync repos
    for (const repo of repos) {
      await prisma.repo.upsert({
        where: {
          userId_name: {
            userId: dbUser.id,
            name: repo.name
          }
        },
        update: {
          description: repo.description,
          stars: repo.stargazers_count,
          lastPushed: new Date(repo.pushed_at),
          url: repo.html_url,
          language: repo.language,
          isPrivate: repo.private,
        },
        create: {
          userId: dbUser.id,
          name: repo.name,
          description: repo.description,
          stars: repo.stargazers_count,
          commits: 0, // Will be updated by webhooks
          lastPushed: new Date(repo.pushed_at),
          url: repo.html_url,
          language: repo.language,
          isPrivate: repo.private,
          isVisible: !repo.private, // Public repos visible by default, private hidden
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      synced: repos.length 
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync repositories' },
      { status: 500 }
    )
  }
}
