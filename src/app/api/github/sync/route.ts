import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { listInstallationRepos, fetchWithInstallationToken } from '@/lib/github-app'

/**
 * Unified sync route that works with both GitHub App and OAuth (legacy)
 * Prioritizes GitHub App if available
 */
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

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email }
    })

    // Check if user has GitHub App installed (preferred)
    if (dbUser?.githubInstallationId) {
      return syncWithGitHubApp(dbUser)
    }

    // Fall back to OAuth token (legacy)
    if (!dbUser?.githubToken) {
      return NextResponse.json(
        { error: 'GitHub not connected. Please install the GitHub App or connect your GitHub account.' },
        { status: 400 }
      )
    }

    return syncWithOAuth(dbUser)
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync repositories' },
      { status: 500 }
    )
  }
}

/**
 * Sync using GitHub App installation token (preferred)
 */
async function syncWithGitHubApp(dbUser: any) {
  const installationId = dbUser.githubInstallationId

  // Fetch repos from GitHub API using installation token
  const repos = await listInstallationRepos(installationId)

  // Sync repos
  for (const repo of repos) {
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
        console.error(`Failed to fetch languages for ${repo.name}:`, err)
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
        isVisible: !repo.private,
        isFork: repo.fork || false,
      }
    })
  }

  return NextResponse.json({ 
    success: true, 
    synced: repos.length,
    method: 'github_app'
  })
}

/**
 * Sync using OAuth token (legacy)
 */
async function syncWithOAuth(dbUser: any) {
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
      // Fetch languages for this repo
      let languages = null
      if (repo.languages_url) {
        try {
          const langResponse = await fetch(repo.languages_url, {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          })
          if (langResponse.ok) {
            languages = await langResponse.json()
          }
        } catch (err) {
          console.error(`Failed to fetch languages for ${repo.name}:`, err)
        }
      }

      // Fetch commit count for this repo
      let commits = 0
      try {
        // Use the commits API with per_page=1 to get total count from headers
        const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`
        const commitsResponse = await fetch(commitsUrl, {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        })
        
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
        console.error(`Failed to fetch commits for ${repo.name}:`, err)
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
    }

  return NextResponse.json({ 
    success: true, 
    synced: repos.length,
    method: 'oauth_legacy'
  })
}
