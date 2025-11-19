import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Github, ExternalLink, Star } from 'lucide-react'
import { VisibilityToggle } from '@/components/visibility-toggle'
import SyncButton from '@/components/sync-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { GitHubAppMigrationBanner } from '@/components/github-app-migration-banner'
import { GitHubConnectButton } from '@/components/github-connect-button'
import { SyncStatus } from '@/components/sync-status'
import { PinToggle } from '@/components/pin-toggle'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  
  // Get or create user in database
  let dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { 
      repos: { 
        orderBy: [
          { isPinned: 'desc' },
          { pinnedOrder: 'asc' },
          { lastPushed: 'desc' }
        ]
      } 
    }
  })

  if (!dbUser && user?.emailAddresses[0]?.emailAddress) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
        avatarUrl: user.imageUrl,
      },
      include: { repos: true }
    })
  }

  const portfolioUrl = dbUser?.githubHandle 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/${dbUser.githubHandle}`
    : null

  return (
    <div className="min-h-screen bg-background" style={{ '--accent-color': (dbUser as { accentColor?: string })?.accentColor || '#3b82f6' } as React.CSSProperties}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">KraftBeast</span>
          </Link>
          <div className="flex items-center gap-4">
            {portfolioUrl && dbUser?.githubHandle && (
              <Link href={`/${dbUser.githubHandle}`} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Portfolio
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <Image 
              src={user?.imageUrl || '/placeholder-avatar.png'} 
              alt={user?.firstName || 'User'} 
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* User Info */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-neutral-600">
              Welcome back, {user?.firstName || 'Developer'}!
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/analytics">
              <Button variant="outline">Analytics</Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline">Edit Profile</Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline">Settings</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold">{dbUser?.repos.length || 0}</div>
            <div className="text-neutral-600">Repositories</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{dbUser?.visits || 0}</div>
            <div className="text-neutral-600">Portfolio Visits</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">
              {dbUser?.repos.reduce((sum: number, repo: { stars: number }) => sum + repo.stars, 0) || 0}
            </div>
            <div className="text-neutral-600">Total Stars</div>
          </Card>
        </div>

        {/* Migration Banner - Show if user has OAuth but not GitHub App */}
        <GitHubAppMigrationBanner 
          hasOAuthToken={!!dbUser?.githubToken && !(dbUser as { githubAppConnected?: boolean })?.githubAppConnected}
          hasGitHubApp={!!(dbUser as { githubAppConnected?: boolean })?.githubAppConnected}
        />

        {/* GitHub Connection */}
        {!dbUser?.githubConnected && !(dbUser as { githubAppConnected?: boolean })?.githubAppConnected ? (
          <Card className="p-8 mb-6 text-center border-2 border-dashed">
            <Github className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your GitHub</h2>
            <p className="text-neutral-600 mb-6">
              Install our GitHub App to automatically sync your repositories and build your portfolio.
              <br />
              <span className="text-sm text-green-600 font-medium">✓ Read-only access • No write permissions</span>
            </p>
            <GitHubConnectButton />
          </Card>
        ) : (
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <Github className="h-5 w-5" />
              <span className="font-medium">
                GitHub Connected: @{dbUser?.githubHandle}
                {(dbUser as { githubAppConnected?: boolean })?.githubAppConnected && (
                  <Badge variant="default" className="ml-2 text-xs">
                    App ✓
                  </Badge>
                )}
              </span>
            </div>
            <SyncStatus lastSyncedAt={(dbUser as { lastSyncedAt?: Date | null })?.lastSyncedAt || null} />
            <SyncButton />
          </div>
        )}

        {/* Repos List */}
        {dbUser?.githubConnected && (
          <div>
            {/* Pinned Repos Section */}
            {dbUser?.repos.some((r: { isPinned?: boolean }) => r.isPinned) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">📌 Pinned Projects</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dbUser?.repos
                    .filter((repo: { isPinned?: boolean }) => repo.isPinned)
                    .map((repo: { id: string; name: string; description: string | null; stars: number; commits: number; language: string | null; isPrivate: boolean; isVisible: boolean; isFork?: boolean; isPinned?: boolean; url: string }) => (
                      <Card key={repo.id} className="p-4 hover:shadow-md transition-shadow relative border-2 border-yellow-200 bg-yellow-50/30">
                        <div className="absolute top-2 right-2">
                          <PinToggle repoId={repo.id} isPinned={repo.isPinned || false} />
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 flex-wrap pr-8">
                            <h3 className="font-semibold">{repo.name}</h3>
                            {repo.isPrivate && (
                              <Badge variant="outline" className="text-xs">👾 Private</Badge>
                            )}
                            {repo.isFork && (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">🍴 Forked</Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {repo.stars}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                          {repo.description || 'No description'}
                        </p>
                        <div className="flex justify-between items-center text-xs text-neutral-500 mb-3">
                          <span>{repo.language || 'Unknown'}</span>
                          <span>{repo.commits} commits</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <a 
                            href={repo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View on GitHub
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <VisibilityToggle 
                            repoId={repo.id} 
                            isVisible={repo.isVisible}
                          />
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold mb-4">All Repositories</h2>
            {dbUser?.repos.length === 0 ? (
              <Card className="p-8 text-center">
                <Github className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                <p className="text-neutral-600 mb-4">
                  No repositories synced yet. Click &quot;Sync Repos&quot; to get started.
                </p>
              </Card>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbUser?.repos
                .filter((repo: { isPinned?: boolean }) => !repo.isPinned)
                .map((repo: { id: string; name: string; description: string | null; stars: number; commits: number; language: string | null; isPrivate: boolean; isVisible: boolean; isFork?: boolean; isPinned?: boolean; url: string }) => (
                <Card key={repo.id} className="p-4 hover:shadow-md transition-shadow relative">
                  <div className="absolute top-2 right-2">
                    <PinToggle repoId={repo.id} isPinned={repo.isPinned || false} />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-wrap pr-8">
                      <h3 className="font-semibold">{repo.name}</h3>
                      {repo.isPrivate && (
                        <Badge variant="outline" className="text-xs">👾 Private</Badge>
                      )}
                      {repo.isFork && (
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">🍴 Forked</Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {repo.stars}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {repo.description || 'No description'}
                  </p>
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-3">
                    <span>{repo.language || 'Unknown'}</span>
                    <span>{repo.commits} commits</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <a 
                      href={repo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View on GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <VisibilityToggle 
                      repoId={repo.id} 
                      isVisible={repo.isVisible}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  )
}
