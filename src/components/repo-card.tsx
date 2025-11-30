'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, GitCommit, ExternalLink } from 'lucide-react'
import RepoModal from './repo-modal'

interface RepoCardProps {
  repo: {
    id: string
    name: string
    description: string | null
    stars: number
    commits: number
    lastPushed: Date
    url: string
    language: string | null
    languages: Record<string, number> | null
    isPrivate: boolean
    isFork?: boolean
  }
  githubHandle: string
  defaultTab?: string
}

export default function RepoCard({ repo, githubHandle, defaultTab = 'readme' }: RepoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = async () => {
    // Track view
    try {
      await fetch(`/api/repos/${repo.id}/view`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to track view:', error)
    }

    if (repo.isPrivate) {
      setIsModalOpen(true)
    } else {
      window.open(repo.url, '_blank')
    }
  }

  const languagesList = repo.languages 
    ? Object.keys(repo.languages).filter(lang => lang !== 'total')
    : repo.language 
    ? [repo.language] 
    : []

  return (
    <>
      <Card 
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2 sm:gap-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg lg:text-xl font-semibold break-all">{repo.name}</h3>
            {repo.isPrivate && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs whitespace-nowrap">
                <span>👾</span>
                Private
              </Badge>
            )}
            {repo.isFork && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border-gray-300 whitespace-nowrap">
                <span>🍴</span>
                Forked
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap self-start">
            <Star className="h-3 w-3 fill-current" />
            {repo.stars}
          </Badge>
        </div>
        
        <p className="text-neutral-600 mb-4 min-h-[3rem]">
          {repo.description || 'No description provided'}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {languagesList.length > 0 ? (
            languagesList.map((lang) => (
              <Badge key={lang} variant="outline">{lang}</Badge>
            ))
          ) : (
            <Badge variant="outline">Unknown</Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            <GitCommit className="h-3 w-3" />
            {repo.commits} commits
          </Badge>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-500">
            Updated {new Date(repo.lastPushed).toLocaleDateString()}
          </span>
          {!repo.isPrivate && (
            <span className="text-blue-600 hover:underline flex items-center gap-1">
              View
              <ExternalLink className="h-3 w-3" />
            </span>
          )}
          {repo.isPrivate && (
            <span className="text-blue-600 flex items-center gap-1">
              View Details
            </span>
          )}
        </div>
      </Card>

      {repo.isPrivate && (
        <RepoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          repo={repo}
          githubHandle={githubHandle}
          defaultTab={defaultTab}
        />
      )}
    </>
  )
}
