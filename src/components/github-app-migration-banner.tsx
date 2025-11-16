'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Shield, Lock, Zap, X } from 'lucide-react'

interface GitHubAppMigrationBannerProps {
  hasOAuthToken: boolean
  hasGitHubApp: boolean
}

export function GitHubAppMigrationBanner({ 
  hasOAuthToken, 
  hasGitHubApp 
}: GitHubAppMigrationBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  // Only show if user has OAuth but not GitHub App
  if (!hasOAuthToken || hasGitHubApp || dismissed) {
    return null
  }

  return (
    <Card className="p-6 mb-6 border-2 border-blue-500/20 bg-blue-50 dark:bg-blue-950/20 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-blue-900 dark:text-blue-100">
            🔒 Security Upgrade Available!
          </h3>
          
          <p className="text-neutral-700 dark:text-neutral-300 mb-4">
            We&apos;ve upgraded to GitHub App for better security and privacy. 
            The new integration only requests <strong>READ access</strong> to your repositories.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-start gap-2">
              <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                  Read-Only Access
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  No write permissions
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                  Better Security
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Installation tokens
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                  Auto Webhooks
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  All repos covered
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => window.location.href = '/api/auth/github/app/install'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Upgrade to GitHub App
            </Button>
            <Button 
              variant="outline"
              onClick={() => setDismissed(true)}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
