'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Star, Activity, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface AnalyticsData {
  portfolioVisits: number
  totalRepoViews: number
  topRepos: Array<{
    id: string
    name: string
    views: number
    stars: number
  }>
  syncLogs: Array<{
    id: string
    status: string
    reposSynced: number
    errors: number
    message: string | null
    createdAt: string
  }>
  lastSyncedAt: string | null
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const analytics = await response.json()
        setData(analytics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-neutral-600">Loading analytics...</p>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="p-6">
        <p className="text-neutral-600">Failed to load analytics</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Portfolio Visits</h3>
          </div>
          <p className="text-3xl font-bold">{data.portfolioVisits}</p>
          <p className="text-sm text-neutral-600 mt-1">Total profile views</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Project Views</h3>
          </div>
          <p className="text-3xl font-bold">{data.totalRepoViews}</p>
          <p className="text-sm text-neutral-600 mt-1">Total repo interactions</p>
        </Card>
      </div>

      {/* Top Repos */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-600" />
          Top 5 Projects
        </h3>
        {data.topRepos.length === 0 ? (
          <p className="text-neutral-600 text-sm">No project views yet</p>
        ) : (
          <div className="space-y-3">
            {data.topRepos.map((repo, index) => (
              <div key={repo.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-neutral-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{repo.name}</p>
                    <p className="text-sm text-neutral-600">{repo.stars} stars</p>
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {repo.views} views
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Sync Activity Log */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Recent Sync Activity
        </h3>
        {data.syncLogs.length === 0 ? (
          <p className="text-neutral-600 text-sm">No sync activity yet</p>
        ) : (
          <div className="space-y-2">
            {data.syncLogs.map((log) => {
              const Icon = 
                log.status === 'success' ? CheckCircle2 :
                log.status === 'partial' ? AlertCircle :
                XCircle
              
              const colorClass = 
                log.status === 'success' ? 'text-green-600' :
                log.status === 'partial' ? 'text-yellow-600' :
                'text-red-600'

              return (
                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Icon className={`h-5 w-5 ${colorClass} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-600">
                      <span>{log.reposSynced} synced</span>
                      {log.errors > 0 && <span className="text-red-600">{log.errors} errors</span>}
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={log.status === 'success' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {log.status}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
