import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'

/**
 * Sync repositories using GitHub App installation token
 * Triggers an Inngest background job for async processing
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

    // Trigger Inngest job for background processing
    await inngest.send({
      name: 'repo/sync.requested',
      data: {
        userId: dbUser.id,
        installationId: installationId,
        clerkId: userId
      }
    })

    console.log('[Sync] Background job triggered successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Sync started in background. This may take a few moments.',
      status: 'processing'
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
        error: 'Failed to start sync',
        details: errorMessage,
        hint: 'Check if GitHub App is properly installed and has the correct permissions'
      },
      { status: 500 }
    )
  }
}
