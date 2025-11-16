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

  // Replace escaped newlines with actual newlines
  const key = privateKey.replace(/\\n/g, '\n')

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
 */
export async function listInstallationRepos(
  installationId: string,
  page = 1,
  perPage = 100
): Promise<any[]> {
  const response = await fetchWithInstallationToken(
    installationId,
    `https://api.github.com/installation/repositories?per_page=${perPage}&page=${page}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch installation repositories')
  }

  const data = await response.json()
  return data.repositories || []
}
