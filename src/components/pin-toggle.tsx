'use client'

import { useState } from 'react'
import { Pin } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PinToggleProps {
  repoId: string
  isPinned: boolean
}

export function PinToggle({ repoId, isPinned: initialPinned }: PinToggleProps) {
  const router = useRouter()
  const [isPinned, setIsPinned] = useState(initialPinned)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/repos/${repoId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      })

      if (response.ok) {
        setIsPinned(!isPinned)
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-colors ${
        isPinned
          ? 'text-yellow-600 hover:text-yellow-700 bg-yellow-50'
          : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
      }`}
      title={isPinned ? 'Unpin from highlights' : 'Pin to highlights'}
    >
      <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
    </button>
  )
}
