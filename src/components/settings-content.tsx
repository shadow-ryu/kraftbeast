'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Github, Twitter, ExternalLink, CheckCircle2, XCircle, Linkedin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ResendKeyManager from '@/components/resend-key-manager'
import { ScrollArea } from './ui/scroll-area'
import { applyAccent } from '@/lib/theme'
import WorkHistoryManager from '@/components/work-history-manager'

interface Repo {
  id: string
  name: string
  isPrivate: boolean
  isVisible: boolean
  description: string | null
  stars: number
}

interface WorkHistoryItem {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string | null
  bullets: string[]
}

interface SettingsContentProps {
  user: {
    githubHandle: string | null
    githubConnected: boolean
    githubAppConnected?: boolean
    twitterHandle: string | null
    forwardEmail: string | null
    defaultRepoView: string
    timelineRangeFrom: string | null
    timelineRangeTo: string | null
    accentColor?: string
  }
  repos: Repo[]
  workHistory: WorkHistoryItem[]
}

export default function SettingsContent({ user, repos, workHistory }: SettingsContentProps) {
  const router = useRouter()
  const [twitterHandle, setTwitterHandle] = useState(user.twitterHandle || '')
  const [forwardEmail, setForwardEmail] = useState(user.forwardEmail || '')
  const [defaultRepoView, setDefaultRepoView] = useState(user.defaultRepoView || 'readme,files,description')
  const [accentColor, setAccentColor] = useState(user.accentColor || '#3b82f6')
  const [subdomain, setSubdomain] = useState('')
  const [subdomainSaving, setSubdomainSaving] = useState(false)
  const [subdomainMessage, setSubdomainMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [timelinePreset, setTimelinePreset] = useState<string>('90days')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Apply accent color on mount
  useEffect(() => {
    applyAccent(accentColor)
  }, [])

  // Initialize timeline range from user settings
  React.useEffect(() => {
    if (user.timelineRangeFrom && user.timelineRangeTo) {
      setTimelinePreset('custom')
      setCustomFrom(new Date(user.timelineRangeFrom).toISOString().split('T')[0])
      setCustomTo(new Date(user.timelineRangeTo).toISOString().split('T')[0])
    }
  }, [user.timelineRangeFrom, user.timelineRangeTo])

  // Debounced save for accent color
  const saveAccentColor = useCallback(async (color: string) => {
    try {
      const response = await fetch('/api/settings/appearance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accentColor: color }),
      })

      if (response.ok) {
        console.log('Accent color saved:', color)
      } else {
        console.error('Failed to save accent color')
      }
    } catch (error) {
      console.error('Error saving accent color:', error)
    }
  }, [])

  // Handle accent color change with instant UI update and debounced save
  const handleAccentColorChange = useCallback((color: string) => {
    setAccentColor(color)
    applyAccent(color)

    // Debounce the API call
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      saveAccentColor(color)
    }, 300)
  }, [saveAccentColor])

  // Fetch current subdomain
  useEffect(() => {
    const fetchSubdomain = async () => {
      try {
        const response = await fetch('/api/settings/subdomain')
        if (response.ok) {
          const data = await response.json()
          setSubdomain(data.subdomain || '')
        }
      } catch (error) {
        console.error('Error fetching subdomain:', error)
      }
    }
    fetchSubdomain()
  }, [])

  // Handle subdomain save
  const handleSaveSubdomain = async () => {
    setSubdomainSaving(true)
    setSubdomainMessage(null)

    try {
      const response = await fetch('/api/settings/subdomain', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: subdomain.trim() || null })
      })

      const data = await response.json()

      if (response.ok) {
        setSubdomainMessage({ 
          type: 'success', 
          text: subdomain ? `Subdomain saved! Your portfolio is now at ${data.url}` : 'Subdomain removed'
        })
        router.refresh()
      } else {
        setSubdomainMessage({ type: 'error', text: data.error || 'Failed to save subdomain' })
      }
    } catch (error) {
      setSubdomainMessage({ type: 'error', text: 'Failed to save subdomain' })
    } finally {
      setSubdomainSaving(false)
    }
  }

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
          timelineRangeTo,
          accentColor
        }),
      })

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
        router.refresh()
      } else {
        const errorData = await response.json()
        console.error('Settings save error:', errorData)
        setSaveMessage({ type: 'error', text: errorData.error || 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Settings save exception:', error)
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
                  <ScrollArea className="h-[300px] ">
                    {publicRepos.map((repo) => (
                      <div 
                        key={repo.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 my-1"
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
                  </ScrollArea>
                </div>
              )}

              {/* Private Repos */}
              {privateRepos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    Private Repositories
                    <Badge variant="secondary">{privateRepos.length}</Badge>
                  </h3>
                  <ScrollArea className="h-[300px]">
                    {privateRepos.map((repo) => (
                      <div 
                        key={repo.id}
                        className="flex items-center my-1 justify-between p-3 border rounded-lg hover:bg-neutral-50"
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
                  </ScrollArea>
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

      {/* Appearance Section */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Appearance</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Customize the look of your portfolio
          </p>

          <div className="space-y-4">
            <div>
              <Label>Accent Color</Label>
              <p className="text-sm text-neutral-600 mb-3">
                Choose a color that represents your brand
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { name: 'Blue', value: '#3b82f6' },
                  { name: 'Purple', value: '#a855f7' },
                  { name: 'Pink', value: '#ec4899' },
                  { name: 'Red', value: '#ef4444' },
                  { name: 'Orange', value: '#f97316' },
                  { name: 'Yellow', value: '#eab308' },
                  { name: 'Green', value: '#22c55e' },
                  { name: 'Teal', value: '#14b8a6' },
                  { name: 'Cyan', value: '#06b6d4' },
                  { name: 'Indigo', value: '#6366f1' },
                ].map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleAccentColorChange(color.value)}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      accentColor === color.value
                        ? 'border-neutral-900 scale-110'
                        : 'border-neutral-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  className="h-10 w-20 rounded-lg border border-neutral-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Saving...' : 'Save Appearance'}
            </Button>

            {saveMessage && (
              <p className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage.text}
              </p>
            )}
          </div>
        </Card>
      </section>

      {/* Custom Subdomain Section */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Custom Subdomain</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Set a custom subdomain for your portfolio (e.g., john.kraftbeast.com)
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="your-name"
                    className="pr-32"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                    .kraftbeast.com
                  </span>
                </div>
                <Button 
                  onClick={handleSaveSubdomain} 
                  disabled={subdomainSaving}
                >
                  {subdomainSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Use lowercase letters, numbers, and hyphens only (3-63 characters)
              </p>
            </div>

            {subdomainMessage && (
              <p className={`text-sm ${subdomainMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {subdomainMessage.text}
              </p>
            )}

            {subdomain && (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-sm font-medium mb-1">Your Portfolio URL:</p>
                <a 
                  href={`https://${subdomain}.kraftbeast.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  https://{subdomain}.kraftbeast.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Contact Form Section */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Contact Form</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Enable visitors to contact you through your portfolio. Requires your own Resend API key.
          </p>

          <ResendKeyManager />
        </Card>
      </section>

      {/* Work History Section */}
      <section>
        <WorkHistoryManager workHistory={workHistory} />
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
              <Label>Private Repo View Options</Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Choose which tabs to show when viewing private repositories
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={defaultRepoView.includes('readme')}
                    onChange={(e) => {
                      const views = defaultRepoView.split(',').filter(v => v)
                      if (e.target.checked) {
                        setDefaultRepoView([...views, 'readme'].join(','))
                      } else {
                        setDefaultRepoView(views.filter(v => v !== 'readme').join(','))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">📄 README</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Show repository documentation</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={defaultRepoView.includes('files')}
                    onChange={(e) => {
                      const views = defaultRepoView.split(',').filter(v => v)
                      if (e.target.checked) {
                        setDefaultRepoView([...views, 'files'].join(','))
                      } else {
                        setDefaultRepoView(views.filter(v => v !== 'files').join(','))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">📁 Files</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Browse file structure</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={defaultRepoView.includes('description')}
                    onChange={(e) => {
                      const views = defaultRepoView.split(',').filter(v => v)
                      if (e.target.checked) {
                        setDefaultRepoView([...views, 'description'].join(','))
                      } else {
                        setDefaultRepoView(views.filter(v => v !== 'description').join(','))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">ℹ️ Description</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Show project information and stats</div>
                  </div>
                </label>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                Selected tabs will be available when viewing private repositories
              </p>
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
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
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

            <div className="flex gap-2">
              <Button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Timeline Range'}
              </Button>
              <Button 
                onClick={async () => {
                  setIsSaving(true)
                  try {
                    const response = await fetch('/api/timeline/backfill', { method: 'POST' })
                    if (response.ok) {
                      const data = await response.json()
                      setSaveMessage({ 
                        type: 'success', 
                        text: `Populated timeline with ${data.totalCommits} commits from ${data.repos} repositories!` 
                      })
                      router.refresh()
                    } else {
                      setSaveMessage({ type: 'error', text: 'Failed to populate timeline' })
                    }
                  } catch {
                    setSaveMessage({ type: 'error', text: 'An error occurred' })
                  } finally {
                    setIsSaving(false)
                  }
                }}
                disabled={isSaving}
                variant="outline"
                className="flex-1"
              >
                {isSaving ? 'Loading...' : 'Populate Timeline'}
              </Button>
            </div>

            {saveMessage && (
              <p className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage.text}
              </p>
            )}
            
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              💡 Tip: Click &quot;Populate Timeline&quot; to fetch recent commits from your repositories
            </p>
          </div>
        </Card>
      </section>

      {/* Privacy & Data Section */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Privacy & Data</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Manage your data and privacy settings
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Export Your Data</h3>
              <p className="text-sm text-neutral-600 mb-3">
                Download all your KraftBeast data including profile, repositories, work history, and timeline.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/api/user/export'}
              >
                Download Data (JSON)
              </Button>
            </div>
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
