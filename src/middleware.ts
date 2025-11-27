import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) =>{
  const url = req.nextUrl
  const hostname = req.headers.get('host') || ''
  
  // Get the subdomain (e.g., "john" from "john.kraftbeast.com")
  const subdomain = getSubdomain(hostname)
  
  // If there's a subdomain and it's not www or api, rewrite to /[username]
  if (subdomain && subdomain !== 'www' && subdomain !== 'api' && !hostname.includes('localhost')) {
    // Don't rewrite if already on a portfolio or API route
    if (!url.pathname.startsWith('/api') && 
        !url.pathname.startsWith('/_next') && 
        !url.pathname.startsWith('/dashboard') &&
        !url.pathname.startsWith('/sign-in') &&
        !url.pathname.startsWith('/sign-up')) {
      
      // Rewrite subdomain.kraftbeast.com to kraftbeast.com/subdomain
      url.pathname = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  }
  
  // Protect dashboard routes
  if (isProtectedRoute(req)) await auth.protect()
})

function getSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0]
  
  // Split by dots
  const parts = host.split('.')
  
  // For localhost or IP addresses, no subdomain
  if (parts.length < 3 || host.includes('localhost') || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null
  }
  
  // Return the first part as subdomain
  // e.g., "john.kraftbeast.com" -> "john"
  // e.g., "john.kraftbeast.vercel.app" -> "john"
  return parts[0]
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
