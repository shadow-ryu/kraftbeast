'use client'

import { useState, useEffect } from 'react'
import { X, FileText, FolderTree, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RepoModalProps {
  isOpen: boolean
  onClose: () => void
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
  }
  githubHandle: string
  defaultTab?: string
}

interface FileNode {
  path: string
  name: string
  type: string
  children?: FileNode[]
}

export default function RepoModal({ isOpen, onClose, repo, defaultTab = 'readme' }: RepoModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [readmeContent, setReadmeContent] = useState<string | null>(null)
  const [fileStructure, setFileStructure] = useState<FileNode[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab)
    }
  }, [isOpen, defaultTab])

  useEffect(() => {
    if (isOpen && activeTab === 'readme' && !readmeContent) {
      fetchReadme()
    }
    if (isOpen && activeTab === 'files' && !fileStructure) {
      fetchFileStructure()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab])

  const fetchReadme = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/repos/${repo.id}/readme`)
      if (response.ok) {
        const data = await response.json()
        setReadmeContent(data.content)
      } else {
        setError('README not accessible')
      }
    } catch {
      setError('Failed to fetch README')
    } finally {
      setLoading(false)
    }
  }

  const fetchFileStructure = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/repos/${repo.id}/files`)
      if (response.ok) {
        const data = await response.json()
        setFileStructure(data.tree)
      } else {
        setError('File structure not accessible')
      }
    } catch {
      setError('Failed to fetch file structure')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const languagesList = repo.languages 
    ? Object.keys(repo.languages).filter(lang => lang !== 'total')
    : repo.language 
    ? [repo.language] 
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{repo.name}</h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <span>👾</span>
                Private
              </Badge>
            </div>
            <p className="text-neutral-600">{repo.description || 'No description'}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-1 px-6">
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'readme'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
              onClick={() => setActiveTab('readme')}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              README
            </button>
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'files'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
              onClick={() => setActiveTab('files')}
            >
              <FolderTree className="h-4 w-4 inline mr-2" />
              Files
            </button>
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'description'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
              onClick={() => setActiveTab('description')}
            >
              <Info className="h-4 w-4 inline mr-2" />
              Description
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'readme' && (
            <div>
              {loading && <p className="text-neutral-600">Loading README...</p>}
              {error && <p className="text-red-600">{error}</p>}
              {readmeContent && (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap bg-neutral-50 p-4 rounded">
                    {readmeContent}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              {loading && <p className="text-neutral-600">Loading file structure...</p>}
              {error && <p className="text-red-600">{error}</p>}
              {fileStructure && <FileTree tree={fileStructure} />}
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-neutral-600">{repo.description || 'No description provided'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {languagesList.length > 0 ? (
                    languagesList.map((lang) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))
                  ) : (
                    <Badge variant="outline">Unknown</Badge>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600">Stars</p>
                    <p className="text-2xl font-bold">{repo.stars}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Commits</p>
                    <p className="text-2xl font-bold">{repo.commits}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Last Updated</h3>
                <p className="text-neutral-600">
                  {new Date(repo.lastPushed).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FileTree({ tree }: { tree: FileNode[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpanded(newExpanded)
  }

  const renderTree = (items: FileNode[], level = 0) => {
    return items.map((item) => {
      const isExpanded = expanded.has(item.path)
      const isFolder = item.type === 'tree'

      return (
        <div key={item.path}>
          <div
            className={`flex items-center gap-2 py-1 px-2 hover:bg-neutral-50 rounded cursor-pointer`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => isFolder && toggleExpand(item.path)}
          >
            {isFolder ? (
              <span>{isExpanded ? '📂' : '📁'}</span>
            ) : (
              <span>📄</span>
            )}
            <span className="text-sm">{item.path.split('/').pop()}</span>
          </div>
          {isFolder && isExpanded && item.children && (
            <div>{renderTree(item.children, level + 1)}</div>
          )}
        </div>
      )
    })
  }

  return <div className="font-mono text-sm">{renderTree(tree)}</div>
}
