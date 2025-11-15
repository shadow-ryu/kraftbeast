import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

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

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=${tokenData.error}`, request.url)
      )
    }

    const accessToken = tokenData.access_token

    // Fetch GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    const githubUser = await userResponse.json()

    // Get current Clerk user
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses[0]?.emailAddress

    if (!email) {
      return NextResponse.redirect(
        new URL('/dashboard?error=no_email', request.url)
      )
    }

    // Update user with GitHub info
    await prisma.user.upsert({
      where: { email },
      update: {
        githubHandle: githubUser.login,
        githubToken: accessToken,
        githubConnected: true,
        avatarUrl: githubUser.avatar_url,
      },
      create: {
        clerkId: userId,
        email,
        name: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
          : githubUser.name || githubUser.login,
        githubHandle: githubUser.login,
        githubToken: accessToken,
        githubConnected: true,
        avatarUrl: githubUser.avatar_url || clerkUser.imageUrl,
      },
    })

    return NextResponse.redirect(
      new URL('/dashboard?github_connected=true', request.url)
    )
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=oauth_failed', request.url)
    )
  }
}
