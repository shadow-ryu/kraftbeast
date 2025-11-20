import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { listInstallationRepos, fetchWithInstallationToken } from '@/lib/github-app'

/**
 * Sync repositories using GitHub App installation token
 * This replaces the OAuth-based sync
 */
export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      console.error('[Sync] Unauthorized: No userId')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[Sync] Starting sync for clerkId: ${userId}`)

    // Get user from database using clerkId
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!dbUser) {
      console.error('[Sync] User not found in database for clerkId:', userId)
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const installationId = (dbUser as { githubInstallationId?: string | null })?.githubInstallationId

    if (!installationId) {
      console.error('[Sync] No GitHub App installation ID for user:', dbUser.email)
      return NextResponse.json(
        { error: 'GitHub App not installed. Please install the GitHub App first.' },
        { status: 400 }
      )
    }

    console.log(`[Sync] Installation ID: ${installationId}`)

    // Fetch repos from GitHub API using installation token
    console.log(`[Sync] Fetching repos for installation ${installationId}...`)
    const repos = await listInstallationRepos(installationId)
    console.log(`[Sync] Found ${repos.length} repositories to sync`)

    if (repos.length === 0) {
      console.log('[Sync] No repositories found')
      return NextResponse.json({ 
        success: true, 
        synced: 0,
        errors: 0,
        total: 0,
        message: 'No repositories found to sync'
      })
    }

    let syncedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Sync repos
    for (const repo of repos) {
      try {
        console.log(`[Sync] Processing repo: ${repo.name}`)
      // Fetch languages for this repo
      let languages = null
      if (repo.languages_url) {
        try {
          const langResponse = await fetchWithInstallationToken(
            installationId,
            repo.languages_url
          )
          if (langResponse.ok) {
            languages = await langResponse.json()
          }
        } catch (err) {
          console.error(`[Sync] Failed to fetch languages for ${repo.name}:`, err)
        }
      }

      // Fetch commit count for this repo
      let commits = 0
      try {
        const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`
        const commitsResponse = await fetchWithInstallationToken(
          installationId,
          commitsUrl
        )
        
        if (commitsResponse.ok) {
          // GitHub returns Link header with pagination info
          const linkHeader = commitsResponse.headers.get('Link')
          if (linkHeader) {
            // Extract last page number from Link header
            const match = linkHeader.match(/page=(\d+)>; rel="last"/)
            if (match) {
              commits = parseInt(match[1], 10)
            } else {
              // If no "last" link, there's only one page
              const data = await commitsResponse.json()
              commits = data.length
            }
          } else {
            // No Link header means fewer than per_page commits
            const data = await commitsResponse.json()
            commits = data.length
          }
        }
      } catch (err) {
        console.error(`[Sync] Failed to fetch commits for ${repo.name}:`, err)
      }

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
            commits: commits,
            lastPushed: new Date(repo.pushed_at),
            url: repo.html_url,
            language: repo.language,
            languages: languages,
            isPrivate: repo.private,
            isFork: repo.fork || false,
          },
          create: {
            userId: dbUser.id,
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            commits: commits,
            lastPushed: new Date(repo.pushed_at),
            url: repo.html_url,
            language: repo.language,
            languages: languages,
            isPrivate: repo.private,
            isVisible: !repo.private, // Public repos visible by default, private hidden
            isFork: repo.fork || false,
          }
        })
        
        syncedCount++
        console.log(`[Sync] ✓ Synced ${repo.name} (${syncedCount}/${repos.length})`)
      } catch (err) {
        errorCount++
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`${repo.name}: ${errorMsg}`)
        console.error(`[Sync] ✗ Failed to sync ${repo.name}:`, err)
      }
    }

    console.log(`[Sync] Complete: ${syncedCount} synced, ${errorCount} errors`)

    // Update last synced timestamp
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { lastSyncedAt: new Date() }
    })

    // Log sync activity
    await prisma.syncLog.create({
      data: {
        userId: dbUser.id,
        status: errorCount === 0 ? 'success' : errorCount < repos.length ? 'partial' : 'error',
        reposSynced: syncedCount,
        errors: errorCount,
        message: `Synced ${syncedCount} of ${repos.length} repositories`
      }
    })

    return NextResponse.json({ 
      success: true, 
      synced: syncedCount,
      errors: errorCount,
      total: repos.length,
      errorDetails: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('[Sync] Fatal error:', {
      message: errorMessage,
      stack: errorStack,
      error
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to sync repositories',
        details: errorMessage,
        hint: 'Check if GitHub App is properly installed and has the correct permissions'
      },
      { status: 500 }
    )
  }
}
