import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

/**
 * GitHub App webhook handler
 * Handles push events and installation events
 * Works with both OAuth (legacy) and GitHub App installations
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    const event = request.headers.get('x-github-event')

    // Verify webhook signature
    const secret = process.env.GITHUB_WEBHOOK_SECRET
    if (secret && signature) {
      const isValid = verifySignature(payload, signature, secret)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(payload)

    // Handle GitHub App installation events
    if (event === 'installation' || event === 'installation_repositories') {
      return handleInstallationEvent(event, data)
    }

    // Handle push events
    if (event === 'push') {
      const repoName = data.repository.name
      const repoUrl = data.repository.html_url
      const pushedAt = new Date(data.repository.pushed_at * 1000)
      const stars = data.repository.stargazers_count
      const description = data.repository.description
      const language = data.repository.language
      const isPrivate = data.repository.private
      const isFork = data.repository.fork || false

      // Find user by GitHub handle
      const githubHandle = data.repository.owner.login
      const user = await prisma.user.findUnique({
        where: { githubHandle }
      })

      if (!user) {
        return NextResponse.json({ 
          message: 'User not found, skipping' 
        })
      }

      // Update or create repo
      await prisma.repo.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: repoName
          }
        },
        update: {
          lastPushed: pushedAt,
          stars,
          description,
          language,
          isPrivate,
          isFork,
          commits: { increment: data.commits?.length || 1 }
        },
        create: {
          userId: user.id,
          name: repoName,
          description,
          stars,
          commits: data.commits?.length || 1,
          lastPushed: pushedAt,
          url: repoUrl,
          language,
          isPrivate,
          isFork,
          isVisible: !isPrivate, // Public repos visible by default
        }
      })

      // Add timeline entries for commits
      if (data.commits && data.commits.length > 0) {
        const timelineEntries = data.commits.map((commit: { message: string; timestamp: string }) => ({
          userId: user.id,
          repoName,
          message: commit.message,
          timestamp: new Date(commit.timestamp),
          hidden: false
        }))

        await prisma.timeline.createMany({
          data: timelineEntries,
          skipDuplicates: true
        })
      }

      return NextResponse.json({ 
        success: true,
        message: 'Repo updated'
      })
    }

    // Handle repository events (created, deleted, etc.)
    if (event === 'repository') {
      const action = data.action
      const repoName = data.repository.name
      const githubHandle = data.repository.owner.login

      const user = await prisma.user.findUnique({
        where: { githubHandle }
      })

      if (!user) {
        return NextResponse.json({ message: 'User not found' })
      }

      if (action === 'deleted') {
        await prisma.repo.deleteMany({
          where: {
            userId: user.id,
            name: repoName
          }
        })
      } else if (action === 'created') {
        await prisma.repo.create({
          data: {
            userId: user.id,
            name: repoName,
            description: data.repository.description,
            stars: data.repository.stargazers_count,
            commits: 0,
            lastPushed: new Date(data.repository.created_at),
            url: data.repository.html_url,
            language: data.repository.language,
            isPrivate: data.repository.private,
            isFork: data.repository.fork || false,
            isVisible: !data.repository.private, // Public repos visible by default
          }
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ message: 'Event not handled' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle GitHub App installation events
 */
async function handleInstallationEvent(event: string, data: { action?: string; installation?: { id?: number; account?: { login?: string } } }) {
  const action = data.action
  const installation = data.installation
  const installationId = installation?.id?.toString()

  if (!installationId) {
    return NextResponse.json({ message: 'No installation ID' })
  }

  // Get the account that installed the app
  const accountLogin = installation?.account?.login

  if (event === 'installation') {
    if (action === 'created') {
      // App was installed - find user by GitHub handle and update
      if (!accountLogin) {
        return NextResponse.json({ message: 'No account login' })
      }
      
      const user = await prisma.user.findUnique({
        where: { githubHandle: accountLogin }
      })

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubInstallationId: installationId,
            githubAppConnected: true,
          }
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Installation created' 
      })
    } else if (action === 'deleted') {
      // App was uninstalled - mark user as disconnected
      const user = await prisma.user.findFirst({
        where: { githubInstallationId: installationId }
      })

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubInstallationId: null,
            githubAppConnected: false,
          }
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Installation deleted' 
      })
    }
  }

  if (event === 'installation_repositories') {
    // Repositories were added or removed from the installation
    // You can trigger a sync here if needed
    return NextResponse.json({ 
      success: true, 
      message: 'Installation repositories updated' 
    })
  }

  return NextResponse.json({ message: 'Installation event not handled' })
}
