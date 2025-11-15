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

    // Fetch file tree from GitHub API
    const treeUrl = `https://api.github.com/repos/${repo.user.githubHandle}/${repo.name}/git/trees/HEAD?recursive=1`
    const response = await fetch(treeUrl, {
      headers: {
        'Authorization': `Bearer ${repo.user.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'File structure not accessible' },
        { status: 404 }
      )
    }

    const data = await response.json()
    
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
