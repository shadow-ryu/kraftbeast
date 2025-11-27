import { inngest } from '@/lib/inngest'
import { prisma } from '@/lib/prisma'
import { listInstallationRepos, fetchWithInstallationToken } from '@/lib/github-app'

/**
 * Background job to sync GitHub repositories for a user
 * Triggered by the sync API endpoint
 */
export const syncReposJob = inngest.createFunction(
  { 
    id: 'sync-repos',
    name: 'Sync GitHub Repositories'
  },
  { event: 'repo/sync.requested' },
  async ({ event, step }) => {
    const { userId, installationId } = event.data

    // Step 1: Fetch repos from GitHub
    const repos = await step.run('fetch-repos', async () => {
      console.log(`[Inngest] Fetching repos for installation ${installationId}...`)
      const repoList = await listInstallationRepos(installationId)
      console.log(`[Inngest] Found ${repoList.length} repositories`)
      return repoList
    })

    if (repos.length === 0) {
      return { success: true, synced: 0, message: 'No repositories found' }
    }

    let syncedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Step 2: Sync each repo
    for (const repo of repos) {
      try {
        await step.run(`sync-${repo.name}`, async () => {
          console.log(`[Inngest] Syncing repo: ${repo.name}`)

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
              console.error(`[Inngest] Failed to fetch languages for ${repo.name}:`, err)
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
            console.error(`[Inngest] Failed to fetch commits for ${repo.name}:`, err)
          }

          // Upsert repo in database
          await prisma.repo.upsert({
            where: {
              userId_name: {
                userId: userId,
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
              userId: userId,
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

          syncedCount++
          console.log(`[Inngest] ✓ Synced ${repo.name} (${syncedCount}/${repos.length})`)
        })
      } catch (err) {
        errorCount++
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`${repo.name}: ${errorMsg}`)
        console.error(`[Inngest] ✗ Failed to sync ${repo.name}:`, err)
      }
    }

    // Step 3: Update user's last synced timestamp
    await step.run('update-sync-timestamp', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { lastSyncedAt: new Date() }
      })
    })

    // Step 4: Log sync activity
    await step.run('log-sync-activity', async () => {
      await prisma.syncLog.create({
        data: {
          userId: userId,
          status: errorCount === 0 ? 'success' : errorCount < repos.length ? 'partial' : 'error',
          reposSynced: syncedCount,
          errors: errorCount,
          message: `Synced ${syncedCount} of ${repos.length} repositories`
        }
      })
    })

    console.log(`[Inngest] Sync complete: ${syncedCount} synced, ${errorCount} errors`)

    return {
      success: true,
      synced: syncedCount,
      errors: errorCount,
      total: repos.length,
      errorDetails: errors.length > 0 ? errors : undefined
    }
  }
)
