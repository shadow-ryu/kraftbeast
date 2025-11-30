import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserInstallation } from '@/lib/github-app'

/**
 * Handle GitHub App installation callback
 * This replaces the OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const installationId = searchParams.get('installation_id')
    const setupAction = searchParams.get('setup_action')

    console.log('GitHub Callback Params:', { 
      code: !!code, 
      error, 
      installationId, 
      setupAction 
    })

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=${error}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?error=no_code', request.url)
      )
    }

    // Exchange code for user access token (to get user info)
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_APP_CLIENT_ID,
        client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log('Token Exchange:', { success: !tokenData.error, error: tokenData.error })

    if (tokenData.error) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=${tokenData.error}`, request.url)
      )
    }

    const userAccessToken = tokenData.access_token

    // Fetch GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })

    const githubUser = await userResponse.json()
    console.log('GitHub User:', githubUser.login)

    // Get installation ID for this user
    let finalInstallationId = installationId

    if (!finalInstallationId) {
      console.log('No installation_id in params, fetching from API...')
      // Try to find the installation
      const installation = await getUserInstallation(userAccessToken)
      console.log('Fetched Installation:', installation)
      if (installation) {
        finalInstallationId = installation.id.toString()
      }
    }

    if (!finalInstallationId) {
      console.error('Failed to find installation ID')
      return NextResponse.redirect(
        new URL('/dashboard?error=no_installation', request.url)
      )
    }

    // Get current Clerk user
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses[0]?.emailAddress

    if (!email) {
      return NextResponse.redirect(
        new URL('/dashboard?error=no_email', request.url)
      )
    }

    // Update user with GitHub App info
    await prisma.user.upsert({
      where: { email },
      update: {
        githubHandle: githubUser.login,
        githubInstallationId: finalInstallationId,
        githubAppConnected: true,
        avatarUrl: githubUser.avatar_url,
        // Keep legacy fields for backward compatibility during migration
        githubConnected: true,
      },
      create: {
        clerkId: userId,
        email,
        name: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
          : githubUser.name || githubUser.login,
        githubHandle: githubUser.login,
        githubInstallationId: finalInstallationId,
        githubAppConnected: true,
        avatarUrl: githubUser.avatar_url || clerkUser.imageUrl,
        githubConnected: true,
      },
    })

    const message = setupAction === 'install' 
      ? 'github_app_installed=true' 
      : 'github_app_connected=true'

    return NextResponse.redirect(
      new URL(`/dashboard?${message}`, request.url)
    )
  } catch (error) {
    console.error('GitHub App callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=app_install_failed', request.url)
    )
  }
}
