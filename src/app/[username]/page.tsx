import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Github, Eye, Twitter, Mail, Briefcase, Clock, GitCommit, Linkedin } from 'lucide-react'
import ContactForm from '@/components/contact-form'
import RepoCard from '@/components/repo-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { ScrollArea } from '@/components/ui/scroll-area'

export default async function PortfolioPage({ 
  params 
}: { 
  params: Promise<{ username: string }> 
}) {
  const { username } = await params
  
  // Try to find user by subdomain first, then fall back to githubHandle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let user: any = await (prisma.user.findUnique as any)({
    where: { subdomain: username },
    include: { 
      repos: { 
        where: { 
          isVisible: true 
        },
        orderBy: [
          { isPinned: 'desc' },
          { pinnedOrder: 'asc' },
          { lastPushed: 'desc' }
        ]
      },
      workHistory: {
        orderBy: { order: 'asc' }
      }
    }
  })

  // If not found by subdomain, try githubHandle (backward compatibility)
  if (!user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user = await (prisma.user.findUnique as any)({
      where: { githubHandle: username },
      include: { 
        repos: { 
          where: { 
            isVisible: true 
          },
          orderBy: [
            { isPinned: 'desc' },
            { pinnedOrder: 'asc' },
            { lastPushed: 'desc' }
          ]
        },
        workHistory: {
          orderBy: { order: 'asc' }
        }
      }
    })
  }

  if (!user) notFound()

  // Calculate timeline range
  const now = new Date()
  const defaultFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const timelineFrom = user.timelineRangeFrom || defaultFrom
  const timelineTo = user.timelineRangeTo || now

  // Fetch timeline with date range
  const timeline = await prisma.timeline.findMany({
    where: {
      userId: user.id,
      hidden: false,
      timestamp: {
        gte: timelineFrom,
        lte: timelineTo
      }
    },
    orderBy: { timestamp: 'desc' },
    take: 100
  })

  // Increment visit count
  await prisma.user.update({
    where: { id: user.id },
    data: { visits: { increment: 1 } }
  })

  // Format date range for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background" style={{ '--accent-color': user.accentColor || '#3b82f6' } as React.CSSProperties}>
      <div className="container mx-auto px-4 py-8">
        {/* Theme Toggle - Top Right */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Left Sidebar - Profile */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="p-6">
              <Image 
                src={user.avatarUrl || '/placeholder-avatar.png'} 
                alt={user.name || username}
                width={96}
                height={96}
                className="rounded-full mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold text-center mb-1">
                {user.name || username}
              </h1>
              <p className="text-neutral-600 text-center mb-4">
                @{username}
              </p>
              
              {/* Social Links */}
              <div className="space-y-3 mb-6">
                <a 
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                >
                  <Github className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="text-neutral-900 dark:text-neutral-100">@{username}</span>
                </a>
                {user.twitterHandle && (
                  <a 
                    href={`https://twitter.com/${user.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                  >
                    <Twitter className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    <span className="text-neutral-900 dark:text-neutral-100">@{user.twitterHandle}</span>
                  </a>
                )}
                {user.linkedinUrl && (
                  <a 
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                  >
                    <Linkedin className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    <span className="text-neutral-900 dark:text-neutral-100">LinkedIn</span>
                  </a>
                )}
                <div className="flex items-center gap-3 text-sm p-2">
                  <Eye className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">{user.visits} visits</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{user.repos.length}</div>
                    <div className="text-xs text-neutral-600">Projects</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {user.repos.reduce((sum: number, repo: { stars: number }) => sum + repo.stars, 0)}
                    </div>
                    <div className="text-xs text-neutral-600">Stars</div>
                  </div>
                </div>
              </div>
            </Card>

          </div>

          {/* Right Content */}
          <div className="space-y-12">
            {/* Hero Section */}
            <section>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-accent">{user.name || username}</h2>
              {user.bio && (
                <p className="text-base lg:text-lg text-neutral-600">{user.bio}</p>
              )}
            </section>

            {/* Work History Section */}
            {user.workHistory.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 lg:mb-6">
                  <Briefcase className="h-5 w-5 lg:h-6 lg:w-6 text-accent" />
                  <h2 className="text-xl lg:text-2xl font-bold text-accent">Work History</h2>
                </div>
                <div className="space-y-6">
                  {user.workHistory.map((work: { id: string; title: string; company: string; startDate: string; endDate: string | null; bullets: string[] }) => (
                    <Card key={work.id} className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-1 sm:gap-0">
                        <div>
                          <h3 className="text-lg lg:text-xl font-semibold">{work.title}</h3>
                          <p className="text-neutral-600">{work.company}</p>
                        </div>
                        <span className="text-sm text-neutral-500 whitespace-nowrap">
                          {work.startDate} - {work.endDate || 'Present'}
                        </span>
                      </div>
                      {work.bullets.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-neutral-600">
                          {work.bullets.map((bullet: string, idx: number) => (
                            <li key={idx}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Section */}
            <section>
              {/* Pinned Projects */}
              {user.repos.some((r: { isPinned?: boolean }) => r.isPinned) && (
                <div className="mb-12">
                  <div className="mb-6">
                    <h2 className="text-xl lg:text-2xl font-bold mb-2 text-accent">📌 Pinned Projects</h2>
                    <p className="text-neutral-600 text-sm lg:text-base">
                      Highlighted work
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {user.repos
                      .filter((repo: { isPinned?: boolean }) => repo.isPinned)
                      .map((repo: { id: string; name: string; description: string | null; stars: number; commits: number; lastPushed: Date; url: string; language: string | null; languages: unknown; isPrivate: boolean; isFork?: boolean }) => (
                        <RepoCard 
                          key={repo.id} 
                          repo={{
                            ...repo,
                            languages: repo.languages as Record<string, number> | null
                          }} 
                          githubHandle={username}
                          defaultTab={(user as { defaultRepoView?: string }).defaultRepoView || 'readme'}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* All Projects */}
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold mb-2 text-accent">All Projects</h2>
                <p className="text-neutral-600 text-sm lg:text-base">
                  Automatically synced from GitHub
                </p>
              </div>

              {user.repos.filter((r: { isPinned?: boolean }) => !r.isPinned).length === 0 ? (
                <Card className="p-12 text-center">
                  <Github className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                  <p className="text-neutral-600">
                    {user.repos.length > 0 ? 'All projects are pinned' : 'No public projects yet'}
                  </p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {user.repos
                    .filter((repo: { isPinned?: boolean }) => !repo.isPinned)
                    .map((repo: { id: string; name: string; description: string | null; stars: number; commits: number; lastPushed: Date; url: string; language: string | null; languages: unknown; isPrivate: boolean; isFork?: boolean }) => (
                    <RepoCard 
                      key={repo.id} 
                      repo={{
                        ...repo,
                        languages: repo.languages as Record<string, number> | null
                      }} 
                      githubHandle={username}
                      defaultTab={(user as { defaultRepoView?: string }).defaultRepoView || 'readme'}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Activity Timeline Section */}
            <section>
              <div className="flex items-center gap-2 mb-4 lg:mb-6">
                <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-accent" />
                <h2 className="text-xl lg:text-2xl font-bold text-accent">Activity Timeline</h2>
              </div>
              {timeline.length > 0 ? (
                <Card className="p-6">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Showing commits from {formatDate(timelineFrom)} to {formatDate(timelineTo)}
                  </p>
                  <ScrollArea className="h-[300px] space-y-4">
                    {timeline.map((entry: { id: string; repoName: string; message: string; timestamp: Date }) => (
                      <div key={entry.id} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                        <div className="flex-shrink-0">
                          <GitCommit className="h-5 w-5 text-neutral-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{entry.repoName}</span>
                            <span className="text-xs text-neutral-500">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                            {entry.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
                  <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
                    No Recent Activity
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Timeline will populate automatically when you push code to GitHub.
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500">
                    Date range: {formatDate(timelineFrom)} to {formatDate(timelineTo)}
                  </p>
                </Card>
              )}
            </section>

            {/* Contact Section */}
            {user.forwardEmail && user.resendApiKey && (
              <section>
                <div className="flex items-center gap-2 mb-4 lg:mb-6">
                  <Mail className="h-5 w-5 lg:h-6 lg:w-6 text-accent" />
                  <h2 className="text-xl lg:text-2xl font-bold text-accent">Get in Touch</h2>
                </div>
                <ContactForm username={username} />
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">KraftBeast</Link>
            {' '}- Portfolio that updates itself
          </p>
        </div>
      </footer>
    </div>
  )
}
