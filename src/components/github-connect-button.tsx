'use client'

import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export function GitHubConnectButton() {
  return (
    <Button 
      size="lg"
      onClick={() => window.location.href = '/api/auth/github/app/install'}
    >
      <Github className="h-5 w-5 mr-2" />
      Install GitHub App
    </Button>
  )
}
