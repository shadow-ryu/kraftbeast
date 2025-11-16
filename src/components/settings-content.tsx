'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Github, Twitter, ExternalLink, CheckCircle2, XCircle, Linkedin } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Repo {
  id: string
  name: string
  isPrivate: boolean
  isVisible: boolean
  description: string | null
  stars: number
}

interface SettingsContentProps {
  user: {
    githubHandle: string | null
    githubConnected: boolean
    githubAppConnected?: boolean
    twitterHandle: string | null
    forwardEmail: string | null
    defaultRepoView: string
    timelineRangeFrom: Date | null
    timelineRangeTo: Date | null
  }
  repos: Repo[]
}

export default function SettingsContent({ user, repos }: SettingsContentProps) {
  const router = useRouter()
  const [twitterHandle, setTwitterHandle] = useState(user.twitterHandle || '')
  const [forwardEmail, setForwardEmail] = useState(user.forwardEmail || '')
  const [defaultRepoView, setDefaultRepoView] = useState(user.defaultRepoView || 'readme')
  const [timelinePreset, setTimelinePreset] = useState<string>('90days')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Initialize timeline range from user settings
  useState(() => {
    if (user.timelineRangeFrom && user.timelineRangeTo) {
      setTimelinePreset('custom')
      setCustomFrom(new Date(user.timelineRangeFrom).toISOString().split('T')[0])
      setCustomTo(new Date(user.timelineRangeTo).toISOString().split('T')[0])
    }
  })

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    
    try {
      // Calculate timeline range based on preset
      let timelineRangeFrom = null
      let timelineRangeTo = null

      if (timelinePreset === 'custom' && customFrom && customTo) {
        timelineRangeFrom = new Date(customFrom).toISOString()
        timelineRangeTo = new Date(customTo).toISOString()
      } else if (timelinePreset !== 'custom') {
        const now = new Date()
        const days = timelinePreset === '7days' ? 7 : timelinePreset === '30days' ? 30 : 90
        timelineRangeFrom = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
        timelineRangeTo = now.toISOString()
      }

      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          twitterHandle, 
          forwardEmail, 
          defaultRepoView,
          timelineRangeFrom,
          timelineRangeTo
        }),
      })

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
        router.refresh()
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save settings' })
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleVisibility = async (repoId: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/repos/${repoId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const publicRepos = repos.filter(r => !r.isPrivate)
  const privateRepos = repos.filter(r => r.isPrivate)

  return (
    <div className="space-y-8">
      {/* Repository Visibility Section */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Repository Visibility</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Control which repositories appear on your public portfolio. Hidden repos won&apos;t be visible to visitors.
          </p>

          {repos.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Github className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
              <p>No repositories synced yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Public Repos */}
              {publicRepos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    Public Repositories
                    <Badge variant="secondary">{publicRepos.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {publicRepos.map((repo) => (
                      <div 
                        key={repo.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{repo.name}</span>
                            <Badge variant="outline" className="text-xs">Public</Badge>
                          </div>
                          <p className="text-sm text-neutral-600 line-clamp-1">
                            {repo.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-neutral-500">{repo.stars} ⭐</span>
                          <Switch
                            checked={repo.isVisible}
                            onCheckedChange={() => handleToggleVisibility(repo.id, repo.isVisible)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Private Repos */}
              {privateRepos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    Private Repositories
                    <Badge variant="secondary">{privateRepos.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {privateRepos.map((repo) => (
                      <div 
                        key={repo.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{repo.name}</span>
                            <Badge variant="outline" className="text-xs">Private</Badge>
                          </div>
                          <p className="text-sm text-neutral-600 line-clamp-1">
                            {repo.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-neutral-500">{repo.stars} ⭐</span>
                          <Switch
                            checked={repo.isVisible}
                            onCheckedChange={() => handleToggleVisibility(repo.id, repo.isVisible)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </section>

      {/* Integrations Section */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Integrations</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Connect your accounts to enhance your portfolio
          </p>

          <div className="space-y-4">
            {/* GitHub */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Github className="h-6 w-6" />
                <div>
                  <div className="font-medium">GitHub</div>
                  <div className="text-sm text-neutral-600">
                    {user.githubConnected && user.githubHandle 
                      ? `Connected as @${user.githubHandle}`
                      : 'Not connected'
                    }
                  </div>
                  {user.githubAppConnected && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      ✓ GitHub App (Read-only)
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user.githubConnected || user.githubAppConnected ? (
                  <>
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                    {!user.githubAppConnected && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => window.location.href = '/api/auth/github/app/install'}
                      >
                        Upgrade to App
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/api/auth/github/app/install'}
                    >
                      Reconnect
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Connected
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => window.location.href = '/api/auth/github/app/install'}
                    >
                      Install App
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* LinkedIn */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Linkedin className="h-6 w-6" />
                <div>
                  <div className="font-medium">LinkedIn</div>
                  <div className="text-sm text-neutral-600">
                    Coming soon - Verify your professional profile
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
                <Button size="sm" disabled>
                  Connect
                </Button>
              </div>
            </div>

            {/* Twitter */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Twitter className="h-6 w-6" />
                <div>
                  <div className="font-medium">Twitter / X</div>
                  <div className="text-sm text-neutral-600">
                    Add your Twitter handle to your portfolio
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {twitterHandle ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Added
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Not Added
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Contact & Social Section */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Contact & Social</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="twitter">Twitter Handle</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">@</span>
                  <Input
                    id="twitter"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="username"
                    className="pl-7"
                  />
                </div>
                {twitterHandle && (
                  <a 
                    href={`https://twitter.com/${twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="forwardEmail">Forward Email</Label>
              <p className="text-sm text-neutral-600 mb-2">
                Contact form messages will be forwarded to this email
              </p>
              <Input
                id="forwardEmail"
                type="email"
                value={forwardEmail}
                onChange={(e) => setForwardEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="defaultRepoView">Default Private Repo View</Label>
              <p className="text-sm text-neutral-600 mb-2">
                Choose which tab opens first when viewing private repositories
              </p>
              <select
                id="defaultRepoView"
                value={defaultRepoView}
                onChange={(e) => setDefaultRepoView(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="readme">README</option>
                <option value="files">Files</option>
                <option value="description">Description</option>
              </select>
            </div>

            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>

            {saveMessage && (
              <p className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage.text}
              </p>
            )}
          </div>
        </Card>
      </section>

      {/* Timeline Range Section */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Timeline Range</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Control which commits appear on your portfolio timeline
          </p>

          <div className="space-y-4">
            <div>
              <Label>Time Period</Label>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timelinePreset"
                    value="7days"
                    checked={timelinePreset === '7days'}
                    onChange={(e) => setTimelinePreset(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Last 7 Days</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timelinePreset"
                    value="30days"
                    checked={timelinePreset === '30days'}
                    onChange={(e) => setTimelinePreset(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Last 30 Days</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timelinePreset"
                    value="90days"
                    checked={timelinePreset === '90days'}
                    onChange={(e) => setTimelinePreset(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Last 90 Days (Default)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timelinePreset"
                    value="custom"
                    checked={timelinePreset === 'custom'}
                    onChange={(e) => setTimelinePreset(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Custom Range</span>
                </label>
              </div>
            </div>

            {timelinePreset === 'custom' && (
              <div className="space-y-3 pl-6 border-l-2 border-neutral-200">
                <div>
                  <Label htmlFor="customFrom">From Date</Label>
                  <Input
                    id="customFrom"
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customTo">To Date</Label>
                  <Input
                    id="customTo"
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Saving...' : 'Save Timeline Range'}
            </Button>

            {saveMessage && (
              <p className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage.text}
              </p>
            )}
          </div>
        </Card>
      </section>

      {/* Danger Zone */}
      <section>
        <Card className="p-6 border-red-200">
          <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Disconnect your GitHub account and clear all synced data. This action cannot be undone.
          </p>
          <Button variant="destructive" disabled>
            Disconnect GitHub & Clear Data
          </Button>
          <p className="text-xs text-neutral-500 mt-2">
            Coming soon
          </p>
        </Card>
      </section>
    </div>
  )
}
