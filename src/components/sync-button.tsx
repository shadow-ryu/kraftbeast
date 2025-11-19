'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setSyncing(true)
    try {
      // Try GitHub App sync first
      let response = await fetch('/api/github/sync-app', {
        method: 'POST',
      })
      
      // Fallback to OAuth sync if App sync fails
      if (!response.ok && response.status === 400) {
        response = await fetch('/api/github/sync', {
          method: 'POST',
        })
      }
      
      if (response.ok) {
        const data = await response.json()
        console.log('Sync result:', data)
        router.refresh()
        if (data.synced !== undefined) {
          alert(`Successfully synced ${data.synced} repositories!`)
        }
      } else {
        const errorData = await response.json()
        console.error('Sync error:', errorData)
        alert(errorData.error || 'Failed to sync repositories')
      }
    } catch (error) {
      console.error('Sync exception:', error)
      alert('Failed to sync repositories. Check console for details.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button 
      onClick={handleSync} 
      size="lg"
      disabled={syncing}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Syncing...' : 'Sync Repos'}
    </Button>
  )
}
