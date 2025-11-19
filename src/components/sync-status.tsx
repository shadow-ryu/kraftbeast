'use client'

import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SyncStatusProps {
  lastSyncedAt: Date | null
  className?: string
}

export function SyncStatus({ lastSyncedAt, className = '' }: SyncStatusProps) {
  if (!lastSyncedAt) {
    return (
      <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
        <AlertCircle className="h-3 w-3" />
        Never synced
      </Badge>
    )
  }

  const now = new Date()
  const diffMs = now.getTime() - new Date(lastSyncedAt).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  let timeAgo = ''
  let status: 'success' | 'warning' | 'error' = 'success'

  if (diffMins < 1) {
    timeAgo = 'Just now'
    status = 'success'
  } else if (diffMins < 60) {
    timeAgo = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    status = 'success'
  } else if (diffHours < 24) {
    timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    status = diffHours > 6 ? 'warning' : 'success'
  } else {
    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    status = diffDays > 7 ? 'error' : 'warning'
  }

  const Icon = status === 'success' ? CheckCircle2 : status === 'warning' ? Clock : AlertCircle
  const colorClass = 
    status === 'success' ? 'text-green-600 bg-green-50' :
    status === 'warning' ? 'text-yellow-600 bg-yellow-50' :
    'text-red-600 bg-red-50'

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${colorClass} ${className}`}>
      <Icon className="h-3 w-3" />
      Last synced {timeAgo}
    </Badge>
  )
}
