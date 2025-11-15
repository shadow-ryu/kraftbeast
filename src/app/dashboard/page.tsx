import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Github, RefreshCw, ExternalLink, Star } from 'lucide-react'
import { VisibilityToggle } from '@/components/visibility-toggle'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  
  // Get or create user in database
  let dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { repos: { orderBy: { lastPushed: 'desc' } } }
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
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b bg-white">
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
            <img 
              src={user?.imageUrl} 
              alt={user?.firstName || 'User'} 
              className="h-8 w-8 rounded-full"
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
          <Link href="/dashboard/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
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
              {dbUser?.repos.reduce((sum: number, repo: any) => sum + repo.stars, 0) || 0}
            </div>
            <div className="text-neutral-600">Total Stars</div>
          </Card>
        </div>

        {/* GitHub Connection */}
        {!dbUser?.githubConnected ? (
          <Card className="p-8 mb-6 text-center border-2 border-dashed">
            <Github className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your GitHub</h2>
            <p className="text-neutral-600 mb-6">
              Connect your GitHub account to automatically sync your repositories and build your portfolio.
            </p>
            <a href="/api/auth/github/connect">
              <Button size="lg">
                <Github className="h-5 w-5 mr-2" />
                Connect GitHub Account
              </Button>
            </a>
          </Card>
        ) : (
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <Github className="h-5 w-5" />
              <span className="font-medium">GitHub Connected: @{dbUser.githubHandle}</span>
            </div>
            <form action="/api/github/sync" method="POST">
              <Button type="submit" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Repos
              </Button>
            </form>
          </div>
        )}

        {/* Repos List */}
        {dbUser?.githubConnected && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Repositories</h2>
            {dbUser?.repos.length === 0 ? (
              <Card className="p-8 text-center">
                <Github className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                <p className="text-neutral-600 mb-4">
                  No repositories synced yet. Click &quot;Sync Repos&quot; to get started.
                </p>
              </Card>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbUser?.repos.map((repo: any) => (
                <Card key={repo.id} className="p-4 hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{repo.name}</h3>
                      {repo.isPrivate && (
                        <Badge variant="outline" className="text-xs">Private</Badge>
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
