'use client'

import { useState, useEffect } from 'react'
import { X, FileText, FolderTree, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

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

export default function RepoModal({ isOpen, onClose, repo, defaultTab = 'readme,files,description' }: RepoModalProps) {
  // Parse enabled tabs from defaultTab (comma-separated string)
  const enabledTabs = defaultTab.split(',').filter(t => t)
  const firstTab = enabledTabs[0] || 'readme'
  
  const [activeTab, setActiveTab] = useState(firstTab)
  const [readmeContent, setReadmeContent] = useState<string | null>(null)
  const [fileStructure, setFileStructure] = useState<FileNode[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setActiveTab(firstTab)
      // Reset content when modal opens
      setReadmeContent(null)
      setFileStructure(null)
      setError(null)
    }
  }, [isOpen, firstTab])

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
        const errorData = await response.json()
        setError(errorData.details || errorData.error || 'README not accessible')
      }
    } catch (err) {
      console.error('README fetch error:', err)
      setError('Failed to fetch README. Please try again.')
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
        if (data.tree && data.tree.length === 0) {
          setError('Repository is empty')
        } else {
          setFileStructure(data.tree)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.details || errorData.error || 'File structure not accessible')
      }
    } catch (err) {
      console.error('Files fetch error:', err)
      setError('Failed to fetch file structure. Please try again.')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70" onClick={onClose}>
      <div 
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b dark:border-neutral-800 p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold dark:text-white">{repo.name}</h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <span>👾</span>
                Private
              </Badge>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">{repo.description || 'No description'}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-neutral-800">
          <div className="flex gap-1 px-6">
            {enabledTabs.includes('readme') && (
              <button
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'readme'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab('readme')}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                README
              </button>
            )}
            {enabledTabs.includes('files') && (
              <button
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'files'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab('files')}
              >
                <FolderTree className="h-4 w-4 inline mr-2" />
                Files
              </button>
            )}
            {enabledTabs.includes('description') && (
              <button
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                onClick={() => setActiveTab('description')}
              >
                <Info className="h-4 w-4 inline mr-2" />
                Description
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'readme' && (
            <div>
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white mx-auto mb-4"></div>
                    <p className="text-neutral-600 dark:text-neutral-400">Loading README...</p>
                  </div>
                </div>
              )}
              {error && !loading && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">{error}</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {error.includes('permission') || error.includes('403') ? (
                        <>
                          The GitHub App needs access to this repository. 
                          <a 
                            href="https://github.com/settings/installations" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline font-medium ml-1"
                          >
                            Configure app permissions →
                          </a>
                        </>
                      ) : (
                        'This repository may not have a README file, or it may not be accessible at this time.'
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchReadme}
                    >
                      Try Again
                    </Button>
                    {enabledTabs.includes('description') && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('description')}
                      >
                        View Description
                      </Button>
                    )}
                    {(error.includes('permission') || error.includes('403')) && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => window.open('https://github.com/settings/installations', '_blank')}
                      >
                        Fix Permissions
                      </Button>
                    )}
                  </div>
                  <details className="mt-4 text-xs">
                    <summary className="cursor-pointer text-yellow-700 dark:text-yellow-300 hover:underline">
                      Debug Info
                    </summary>
                    <div className="mt-2 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded text-left font-mono">
                      <p>Repo: {repo.name}</p>
                      <p>Private: {repo.isPrivate ? 'Yes' : 'No'}</p>
                      <p>Error: {error}</p>
                    </div>
                  </details>
                </div>
              )}
              {readmeContent && !loading && (
                <article className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  >
                    {readmeContent}
                  </ReactMarkdown>
                </article>
              )}
              {!loading && !error && !readmeContent && (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click a tab to view repository content</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white mx-auto mb-4"></div>
                    <p className="text-neutral-600 dark:text-neutral-400">Loading file structure...</p>
                  </div>
                </div>
              )}
              {error && !loading && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">{error}</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {error.includes('permission') || error.includes('403') ? (
                        <>
                          The GitHub App needs access to this repository. 
                          <a 
                            href="https://github.com/settings/installations" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline font-medium ml-1"
                          >
                            Configure app permissions →
                          </a>
                        </>
                      ) : (
                        'Unable to load the file structure at this time.'
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchFileStructure}
                    >
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('description')}
                    >
                      View Description
                    </Button>
                    {(error.includes('permission') || error.includes('403')) && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => window.open('https://github.com/settings/installations', '_blank')}
                      >
                        Fix Permissions
                      </Button>
                    )}
                  </div>
                  <details className="mt-4 text-xs">
                    <summary className="cursor-pointer text-yellow-700 dark:text-yellow-300 hover:underline">
                      Debug Info
                    </summary>
                    <div className="mt-2 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded text-left font-mono">
                      <p>Repo: {repo.name}</p>
                      <p>Private: {repo.isPrivate ? 'Yes' : 'No'}</p>
                      <p>Error: {error}</p>
                    </div>
                  </details>
                </div>
              )}
              {fileStructure && !loading && <FileTree tree={fileStructure} />}
              {!loading && !error && !fileStructure && (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click a tab to view repository content</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Description</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{repo.description || 'No description provided'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Languages</h3>
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
                <h3 className="font-semibold mb-2 dark:text-white">Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Stars</p>
                    <p className="text-2xl font-bold dark:text-white">{repo.stars}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Commits</p>
                    <p className="text-2xl font-bold dark:text-white">{repo.commits}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 dark:text-white">Last Updated</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
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
            className={`flex items-center gap-2 py-1 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded cursor-pointer`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => isFolder && toggleExpand(item.path)}
          >
            {isFolder ? (
              <span>{isExpanded ? '📂' : '📁'}</span>
            ) : (
              <span>📄</span>
            )}
            <span className="text-sm dark:text-neutral-300">{item.path.split('/').pop()}</span>
          </div>
          {isFolder && isExpanded && item.children && (
            <div>{renderTree(item.children, level + 1)}</div>
          )}
        </div>
      )
    })
  }

  return <div className="font-mono text-sm dark:text-neutral-300">{renderTree(tree)}</div>
}
