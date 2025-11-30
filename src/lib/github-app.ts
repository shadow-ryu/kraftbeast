import { sign } from 'jsonwebtoken'

/**
 * GitHub App authentication utilities
 * Handles JWT generation and installation token management
 */

interface InstallationToken {
  token: string
  expires_at: string
}

/**
 * Generate a JWT for GitHub App authentication
 * Valid for 10 minutes
 */
export function generateGitHubAppJWT(): string {
  const appId = process.env.GITHUB_APP_ID
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY

  if (!appId || !privateKey) {
    throw new Error('GitHub App credentials not configured')
  }

  // Clean the private key
  let key = privateKey.replace(/\\n/g, '\n')
  
  // Remove surrounding quotes if they exist (common issue with some env injections)
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1)
  }
  if (key.startsWith("'") && key.endsWith("'")) {
    key = key.slice(1, -1)
  }
  
  key = key.trim()

  const now = Math.floor(Date.now() / 1000)
  
  const payload = {
    iat: now - 60, // Issued 60 seconds in the past to account for clock drift
    exp: now + 600, // Expires in 10 minutes
    iss: appId,
  }

  return sign(payload, key, { algorithm: 'RS256' })
}

/**
 * Get an installation access token for a specific installation
 * These tokens expire after 1 hour
 */
export async function getInstallationToken(
  installationId: string
): Promise<string> {
  const jwt = generateGitHubAppJWT()

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get installation token: ${error}`)
  }

  const data: InstallationToken = await response.json()
  return data.token
}

/**
 * Fetch data from GitHub API using installation token
 * Automatically handles token generation
 */
export async function fetchWithInstallationToken(
  installationId: string,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getInstallationToken(installationId)

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
}

/**
 * Get user's GitHub installation
 * Returns installation ID if user has installed the app
 */
export async function getUserInstallation(
  userAccessToken: string
): Promise<{ id: number } | null> {
  const response = await fetch(
    'https://api.github.com/user/installations',
    {
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  
  // Find our app's installation
  const appId = process.env.GITHUB_APP_ID
  const installation = data.installations?.find(
    (inst: { app_id: number }) => inst.app_id === parseInt(appId || '0')
  )

  return installation || null
}

/**
 * List repositories accessible to an installation
 * Fetches all pages automatically
 */
interface GitHubRepo {
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  pushed_at: string
  html_url: string
  language: string | null
  languages_url: string
  private: boolean
  fork: boolean
}

export async function listInstallationRepos(
  installationId: string
): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = []
  let page = 1
  const perPage = 100

  console.log(`Fetching repos for installation ${installationId}...`)

  while (true) {
    console.log(`Fetching page ${page}...`)
    
    const response = await fetchWithInstallationToken(
      installationId,
      `https://api.github.com/installation/repositories?per_page=${perPage}&page=${page}`
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch repos page ${page}:`, errorText)
      throw new Error(`Failed to fetch installation repositories: ${response.status}`)
    }

    const data = await response.json()
    const repos = data.repositories || []
    
    console.log(`Page ${page}: Found ${repos.length} repos`)
    console.log(`Total available: ${data.total_count || 'unknown'}`)
    
    // Log first few repo names for debugging
    if (repos.length > 0) {
      console.log(`Sample repos on page ${page}:`, repos.slice(0, 3).map((r: GitHubRepo) => r.name))
    }
    
    if (repos.length === 0) {
      break // No more repos
    }

    allRepos.push(...repos)

    // Check if there are more pages
    if (repos.length < perPage) {
      console.log(`Last page reached (${repos.length} < ${perPage})`)
      break // Last page
    }

    page++
  }

  console.log(`Total repos fetched: ${allRepos.length}`)
  return allRepos
}
