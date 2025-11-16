import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Redirect user to GitHub App installation page
 * This replaces the OAuth authorization flow
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const appClientId = process.env.GITHUB_APP_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/app/callback`
  
  // GitHub App installation URL
  const githubAppUrl = new URL(`https://github.com/apps/${process.env.GITHUB_APP_NAME || 'kraftbeast'}/installations/new`)
  
  // Alternative: Use the OAuth-like flow for GitHub Apps
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
  githubAuthUrl.searchParams.set('client_id', appClientId!)
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri)
  githubAuthUrl.searchParams.set('state', userId)

  return NextResponse.redirect(githubAuthUrl.toString())
}
