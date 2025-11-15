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
      const response = await fetch('/api/github/sync', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to sync repositories')
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Failed to sync repositories')
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
