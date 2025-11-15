export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  pushed_at: string
  created_at: string
  updated_at: string
  private: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

export interface GitHubWebhookPayload {
  ref: string
  repository: {
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    stargazers_count: number
    language: string | null
    pushed_at: number
    private: boolean
    owner: {
      login: string
      avatar_url: string
    }
  }
  commits: Array<{
    id: string
    message: string
    timestamp: string
    author: {
      name: string
      email: string
    }
  }>
  pusher: {
    name: string
    email: string
  }
}

export interface ClerkWebhookPayload {
  type: 'user.created' | 'user.updated' | 'user.deleted'
  data: {
    id: string
    email_addresses: Array<{
      email_address: string
      id: string
    }>
    first_name: string | null
    last_name: string | null
    image_url: string
    username: string | null
    external_accounts: Array<{
      provider: string
      provider_user_id: string
    }>
  }
}
