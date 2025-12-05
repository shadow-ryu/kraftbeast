import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchWithInstallationToken } from '@/lib/github-app'

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

    const installationId = (repo.user as { githubInstallationId?: string | null })?.githubInstallationId
    const githubToken = repo.user.githubToken

    if (!installationId && !githubToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      )
    }

    // Fetch README from GitHub API
    const readmeUrl = `https://api.github.com/repos/${repo.user.githubHandle}/${repo.name}/readme`
    
    console.log(`Fetching README for ${repo.user.githubHandle}/${repo.name}`)
    console.log(`Using ${installationId ? 'GitHub App' : 'OAuth'} token`)
    
    let response: Response
    if (installationId) {
      // Use GitHub App token
      try {
        response = await fetchWithInstallationToken(installationId, readmeUrl)
      } catch (error) {
        console.error('GitHub App token error:', error)
        return NextResponse.json(
          { 
            error: 'Failed to authenticate with GitHub',
            details: 'GitHub App installation may need to be refreshed. Try reconnecting your GitHub account.',
            debug: error instanceof Error ? error.message : String(error)
          },
          { status: 500 }
        )
      }
    } else {
      // Fallback to OAuth token
      response = await fetch(readmeUrl, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`GitHub API error (${response.status}):`, errorText)
      console.error(`Repo: ${repo.user.githubHandle}/${repo.name}, Private: ${repo.isPrivate}`)
      
      let details = 'Access denied or rate limited'
      if (response.status === 404) {
        details = 'No README file found in repository'
      } else if (response.status === 403) {
        details = 'GitHub App does not have permission to access this repository. Please reinstall the app with proper permissions.'
      } else if (response.status === 401) {
        details = 'Authentication failed. Please reconnect your GitHub account.'
      }
      
      return NextResponse.json(
        { 
          error: 'README not found or not accessible',
          details,
          statusCode: response.status
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Decode base64 content
    let content: string
    if (data.content && data.encoding === 'base64') {
      content = Buffer.from(data.content, 'base64').toString('utf-8')
    } else if (data.content) {
      content = data.content
    } else {
      return NextResponse.json(
        { error: 'README content not available' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Fetch README error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch README' },
      { status: 500 }
    )
  }
}
