import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Github, Eye, Twitter, Mail, Briefcase, Clock, GitCommit } from 'lucide-react'
import ContactForm from '@/components/contact-form'
import RepoCard from '@/components/repo-card'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function PortfolioPage({ 
  params 
}: { 
  params: Promise<{ username: string }> 
}) {
  const { username } = await params
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = await (prisma.user.findUnique as any)({
    where: { githubHandle: username },
    include: { 
      repos: { 
        where: { 
          isVisible: true 
        },
        orderBy: { lastPushed: 'desc' } 
      },
      workHistory: {
        orderBy: { order: 'asc' }
      }
    }
  })

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
    <div className="min-h-screen bg-background">
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
                <div className="flex items-center gap-2 text-sm">
                  <Github className="h-4 w-4 text-neutral-600" />
                  <a 
                    href={`https://github.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    github.com/{username}
                  </a>
                </div>
                {user.twitterHandle && (
                  <div className="flex items-center gap-2 text-sm">
                    <Twitter className="h-4 w-4 text-neutral-600" />
                    <a 
                      href={`https://twitter.com/${user.twitterHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      @{user.twitterHandle}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-neutral-600" />
                  <span>{user.visits} visits</span>
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
              <h2 className="text-4xl font-bold mb-4">{user.name || username}</h2>
              {user.bio && (
                <p className="text-lg text-neutral-600">{user.bio}</p>
              )}
            </section>

            {/* Work History Section */}
            {user.workHistory.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">Work History</h2>
                </div>
                <div className="space-y-6">
                  {user.workHistory.map((work: { id: string; title: string; company: string; startDate: string; endDate: string | null; bullets: string[] }) => (
                    <Card key={work.id} className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold">{work.title}</h3>
                          <p className="text-neutral-600">{work.company}</p>
                        </div>
                        <span className="text-sm text-neutral-500">
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
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Projects</h2>
                <p className="text-neutral-600">
                  Automatically synced from GitHub
                </p>
              </div>

              {user.repos.length === 0 ? (
                <Card className="p-12 text-center">
                  <Github className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                  <p className="text-neutral-600">No public projects yet</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {user.repos.map((repo: any) => (
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
            {timeline.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">Activity Timeline</h2>
                </div>
                <Card className="p-6">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Showing commits from {formatDate(timelineFrom)} to {formatDate(timelineTo)}
                  </p>
                  <div className="space-y-4">
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
                          <p className="text-sm text-neutral-600 truncate">
                            {entry.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            )}

            {/* Contact Section */}
            {user.forwardEmail && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Mail className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">Get in Touch</h2>
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
