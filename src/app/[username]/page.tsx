import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, Star, GitCommit, ExternalLink, Eye, Twitter, Mail, Briefcase, Clock } from 'lucide-react'
import ContactForm from '@/components/contact-form'

export default async function PortfolioPage({ 
  params 
}: { 
  params: Promise<{ username: string }> 
}) {
  const { username } = await params
  
  const user = await prisma.user.findUnique({
    where: { githubHandle: username },
    include: { 
      repos: { 
        where: { 
          isPrivate: false,
          isVisible: true 
        },
        orderBy: { lastPushed: 'desc' } 
      },
      workHistory: {
        orderBy: { order: 'asc' }
      },
      timeline: {
        orderBy: { timestamp: 'desc' },
        take: 20
      }
    }
  })

  if (!user) notFound()

  // Increment visit count
  await prisma.user.update({
    where: { id: user.id },
    data: { visits: { increment: 1 } }
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Left Sidebar - Profile */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="p-6">
              <img 
                src={user.avatarUrl || '/placeholder-avatar.png'} 
                alt={user.name || username}
                className="w-24 h-24 rounded-full mx-auto mb-4"
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
                      {user.repos.reduce((sum: number, repo: any) => sum + repo.stars, 0)}
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
                  {user.workHistory.map((work: any) => (
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
                  {user.repos.map((repo: any) => (
                    <Card key={repo.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold">{repo.name}</h3>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {repo.stars}
                        </Badge>
                      </div>
                      
                      <p className="text-neutral-600 mb-4 min-h-[3rem]">
                        {repo.description || 'No description provided'}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {repo.language && (
                          <Badge variant="outline">{repo.language}</Badge>
                        )}
                        <Badge variant="outline" className="flex items-center gap-1">
                          <GitCommit className="h-3 w-3" />
                          {repo.commits} commits
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500">
                          Updated {new Date(repo.lastPushed).toLocaleDateString()}
                        </span>
                        <a 
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* War Timeline Section */}
            {user.timeline.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">Activity Timeline</h2>
                </div>
                <Card className="p-6">
                  <div className="space-y-4">
                    {user.timeline.map((entry: any) => (
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
      <footer className="border-t bg-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-neutral-600">
          <p>
            Powered by <a href="/" className="text-blue-600 hover:underline">KraftBeast</a>
            {' '}- Portfolio that updates itself
          </p>
        </div>
      </footer>
    </div>
  )
}
