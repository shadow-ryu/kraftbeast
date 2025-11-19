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

    // Fetch file tree from GitHub API
    const treeUrl = `https://api.github.com/repos/${repo.user.githubHandle}/${repo.name}/git/trees/HEAD?recursive=1`
    
    console.log(`Fetching files for ${repo.user.githubHandle}/${repo.name}`)
    console.log(`Using ${installationId ? 'GitHub App' : 'OAuth'} token`)
    
    let response: Response
    if (installationId) {
      // Use GitHub App token
      try {
        response = await fetchWithInstallationToken(installationId, treeUrl)
      } catch (error) {
        console.error('GitHub App token error:', error)
        return NextResponse.json(
          { 
            error: 'Failed to authenticate with GitHub',
            details: 'GitHub App installation may need to be refreshed. Try reconnecting your GitHub account.'
          },
          { status: 500 }
        )
      }
    } else {
      // Fallback to OAuth token
      response = await fetch(treeUrl, {
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
        details = 'Repository may be empty, branch not found, or GitHub App needs repository access'
      } else if (response.status === 403) {
        details = 'GitHub App does not have permission to access this repository. Please reinstall the app with proper permissions.'
      } else if (response.status === 401) {
        details = 'Authentication failed. Please reconnect your GitHub account.'
      }
      
      return NextResponse.json(
        { 
          error: 'File structure not accessible',
          details,
          statusCode: response.status
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Check if tree exists and has items
    if (!data.tree || data.tree.length === 0) {
      return NextResponse.json(
        { 
          error: 'Repository is empty',
          tree: []
        },
        { status: 200 }
      )
    }
    
    // Build a tree structure from flat list
    const tree = buildTree(data.tree)
    
    return NextResponse.json({ tree })
  } catch (error) {
    console.error('Fetch files error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file structure' },
      { status: 500 }
    )
  }
}

interface TreeItem {
  path: string
  type: string
}

interface TreeNode {
  path: string
  name: string
  type: string
  children?: TreeNode[]
}

function buildTree(items: TreeItem[]) {
  const root: TreeNode[] = []
  const map = new Map<string, TreeNode>()

  // Sort items so folders come first
  items.sort((a, b) => {
    if (a.type === 'tree' && b.type !== 'tree') return -1
    if (a.type !== 'tree' && b.type === 'tree') return 1
    return a.path.localeCompare(b.path)
  })

  // Create nodes
  items.forEach(item => {
    const parts = item.path.split('/')
    const name = parts[parts.length - 1]
    
    const node = {
      path: item.path,
      name,
      type: item.type,
      children: item.type === 'tree' ? [] : undefined
    }
    
    map.set(item.path, node)
    
    if (parts.length === 1) {
      root.push(node)
    } else {
      const parentPath = parts.slice(0, -1).join('/')
      const parent = map.get(parentPath)
      if (parent && parent.children) {
        parent.children.push(node)
      }
    }
  })

  return root
}
