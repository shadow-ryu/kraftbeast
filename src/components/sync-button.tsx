'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState<string>('')
  const router = useRouter()

  const pollStatus = async (startTime: number) => {
    try {
      const response = await fetch(`/api/github/sync-status?since=${new Date(startTime).toISOString()}`)
      if (response.ok) {
        const data = await response.json()
        
        if (data.status === 'completed') {
          setSyncing(false)
          setStatus('')
          router.refresh()
          
          if (data.result === 'success') {
            alert(`Successfully synced ${data.details.synced} repositories!`)
          } else if (data.result === 'partial') {
            alert(`Synced ${data.details.synced} repositories with ${data.details.errors} errors.`)
          } else {
            alert('Sync failed. Please try again.')
          }
          return
        }
      }
    } catch (error) {
      console.error('Polling error:', error)
    }

    // Continue polling if not completed
    setTimeout(() => pollStatus(startTime), 2000)
  }

  const handleSync = async () => {
    setSyncing(true)
    setStatus('Starting...')
    const startTime = Date.now()

    try {
      // Try GitHub App sync (Inngest)
      const response = await fetch('/api/github/sync-app', {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.status === 'processing') {
          setStatus('Syncing in background...')
          // Start polling
          pollStatus(startTime)
        } else {
          // Immediate completion (fallback or error)
          setSyncing(false)
          router.refresh()
          alert(data.message || 'Sync completed')
        }
      } else {
        const errorData = await response.json()
        setSyncing(false)
        alert(errorData.error || 'Failed to start sync')
      }
    } catch (error) {
      console.error('Sync exception:', error)
      setSyncing(false)
      alert('Failed to sync repositories. Check console for details.')
    }
  }

  return (
    <Button 
      onClick={handleSync} 
      size="lg"
      disabled={syncing}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? (status || 'Syncing...') : 'Sync Repos'}
    </Button>
  )
}
