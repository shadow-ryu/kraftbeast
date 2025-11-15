'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface VisibilityToggleProps {
  repoId: string
  isVisible: boolean
}

export function VisibilityToggle({ repoId, isVisible: initialIsVisible }: VisibilityToggleProps) {
  const [isVisible, setIsVisible] = useState(initialIsVisible)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleVisibility = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/repos/${repoId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible: !isVisible }),
      })

      if (response.ok) {
        setIsVisible(!isVisible)
        router.refresh()
      } else {
        console.error('Failed to toggle visibility')
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleVisibility}
      disabled={isLoading}
      className="h-8 px-2"
      title={isVisible ? 'Hide from portfolio' : 'Show on portfolio'}
    >
      {isVisible ? (
        <Eye className="h-4 w-4 text-green-600" />
      ) : (
        <EyeOff className="h-4 w-4 text-neutral-400" />
      )}
    </Button>
  )
}
