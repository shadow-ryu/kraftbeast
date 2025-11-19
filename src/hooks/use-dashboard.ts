import { useQuery } from '@tanstack/react-query'

interface DashboardData {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
    githubHandle: string | null
    githubConnected: boolean
    githubAppConnected: boolean
    lastSyncedAt: Date | null
    visits: number
  }
  repos: Array<{
    id: string
    name: string
    description: string | null
    stars: number
    commits: number
    language: string | null
    isPrivate: boolean
    isVisible: boolean
    isFork: boolean
    isPinned: boolean
    url: string
  }>
  stats: {
    totalRepos: number
    totalStars: number
    totalVisits: number
  }
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      return response.json()
    },
  })
}
