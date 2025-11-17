import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { listInstallationRepos, fetchWithInstallationToken } from '@/lib/github-app'

/**
 * Cron job to sync repositories for all users with GitHub App installed
 * Runs every 6 hours via Vercel Cron
 */
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting scheduled repo sync for all users...')

    // Get all users with GitHub App installed
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        githubHandle: true
      }
    })

    // Filter users with GitHub App installation (TypeScript workaround)
    const users = allUsers.filter(user => {
      const u = user as { githubInstallationId?: string | null }
      return u.githubInstallationId != null
    })

    console.log(`Found ${users.length} users with GitHub App installed`)

    let totalSynced = 0
    let totalErrors = 0
    const results = []

    for (const user of users) {
      const installationId = (user as { githubInstallationId?: string | null }).githubInstallationId
      
      if (!installationId) continue

      try {
        console.log(`Syncing repos for user ${user.email}...`)

        // Fetch repos from GitHub API
        const repos = await listInstallationRepos(installationId)
        console.log(`Found ${repos.length} repos for ${user.email}`)

        let userSynced = 0
        let userErrors = 0

        // Sync each repo
        for (const repo of repos) {
          try {
            // Fetch languages
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
                console.error(`Failed to fetch languages for ${repo.name}:`, err)
              }
            }

            // Fetch commit count
            let commits = 0
            try {
              const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`
              const commitsResponse = await fetchWithInstallationToken(
                installationId,
                commitsUrl
              )
              
              if (commitsResponse.ok) {
                const linkHeader = commitsResponse.headers.get('Link')
                if (linkHeader) {
                  const match = linkHeader.match(/page=(\d+)>; rel="last"/)
                  if (match) {
                    commits = parseInt(match[1], 10)
                  } else {
                    const data = await commitsResponse.json()
                    commits = data.length
                  }
                } else {
                  const data = await commitsResponse.json()
                  commits = data.length
                }
              }
            } catch (err) {
              console.error(`Failed to fetch commits for ${repo.name}:`, err)
            }

            // Upsert repo
            await prisma.repo.upsert({
              where: {
                userId_name: {
                  userId: user.id,
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
                userId: user.id,
                name: repo.name,
                description: repo.description,
                stars: repo.stargazers_count,
                commits: commits,
                lastPushed: new Date(repo.pushed_at),
                url: repo.html_url,
                language: repo.language,
                languages: languages,
                isPrivate: repo.private,
                isVisible: !repo.private,
                isFork: repo.fork || false,
              }
            })

            userSynced++
          } catch (err) {
            userErrors++
            console.error(`Failed to sync ${repo.name} for ${user.email}:`, err)
          }
        }

        totalSynced += userSynced
        totalErrors += userErrors

        results.push({
          user: user.email,
          synced: userSynced,
          errors: userErrors,
          total: repos.length
        })

        console.log(`✓ Synced ${userSynced} repos for ${user.email}`)
      } catch (err) {
        console.error(`Failed to sync repos for ${user.email}:`, err)
        results.push({
          user: user.email,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    console.log(`Cron sync complete: ${totalSynced} repos synced, ${totalErrors} errors`)

    return NextResponse.json({
      success: true,
      users: users.length,
      totalSynced,
      totalErrors,
      results
    })
  } catch (error) {
    console.error('Cron sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync repositories' },
      { status: 500 }
    )
  }
}
