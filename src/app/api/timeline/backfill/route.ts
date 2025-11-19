import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchWithInstallationToken } from '@/lib/github-app'

/**
 * Backfill timeline with recent commits from all repositories
 * This is useful for populating the timeline when first setting up
 */
export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { repos: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const installationId = (user as { githubInstallationId?: string | null })?.githubInstallationId

    if (!installationId) {
      return NextResponse.json(
        { error: 'GitHub App not installed' },
        { status: 400 }
      )
    }

    let totalCommits = 0
    const errors: string[] = []

    // Fetch recent commits for each repo
    for (const repo of user.repos) {
      try {
        const commitsUrl = `https://api.github.com/repos/${user.githubHandle}/${repo.name}/commits?per_page=30`
        const response = await fetchWithInstallationToken(installationId, commitsUrl)

        if (!response.ok) {
          errors.push(`${repo.name}: ${response.status}`)
          continue
        }

        const commits = await response.json()

        // Create timeline entries for each commit
        for (const commit of commits) {
          try {
            await prisma.timeline.create({
              data: {
                userId: user.id,
                repoName: repo.name,
                message: commit.commit.message.split('\n')[0], // First line only
                timestamp: new Date(commit.commit.author.date),
                hidden: false
              }
            })
            totalCommits++
          } catch (err) {
            // Skip duplicates or errors
            console.error(`Error creating timeline entry:`, err)
          }
        }
      } catch (err) {
        errors.push(`${repo.name}: ${err}`)
        console.error(`Error fetching commits for ${repo.name}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      totalCommits,
      repos: user.repos.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Timeline backfill error:', error)
    return NextResponse.json(
      { error: 'Failed to backfill timeline' },
      { status: 500 }
    )
  }
}
