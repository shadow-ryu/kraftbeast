# GitHub OAuth App Setup Guide

## Overview

KraftBeast uses a **separate GitHub OAuth App** (not Clerk's GitHub integration) to give you full control over GitHub API access and avoid Clerk's developer plan limitations.

## Why Separate OAuth?

- ✅ **No Clerk limitations** - Works on free Clerk plan
- ✅ **Full GitHub API access** - Direct token management
- ✅ **Multiple login options** - Users can sign up with Google/Apple via Clerk, then connect GitHub separately
- ✅ **Better control** - Manage GitHub tokens independently

## Setup Steps

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `KraftBeast` (or your app name)
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
   - **Application description**: (optional) "Automatic developer portfolio builder"

4. Click **"Register application"**

### 2. Get Credentials

After creating the app:

1. Copy the **Client ID**
2. Click **"Generate a new client secret"**
3. Copy the **Client Secret** (you won't see it again!)

### 3. Update Environment Variables

Add to your `.env` file:

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

### 4. For Production Deployment

When deploying to production (e.g., Vercel):

1. Go back to your GitHub OAuth App settings
2. Update the URLs:
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-domain.com/api/auth/github/callback`

3. Add the same environment variables to your hosting platform

## How It Works

### User Flow

```
1. User signs up with Clerk (Google/Apple/Email)
   ↓
2. User goes to dashboard
   ↓
3. Sees "Connect GitHub" button
   ↓
4. Clicks button → redirected to GitHub OAuth
   ↓
5. Authorizes KraftBeast
   ↓
6. Redirected back with access token
   ↓
7. Token stored in database
   ↓
8. Can now sync repos and build portfolio
```

### Technical Flow

```
Dashboard → /api/auth/github/connect
  ↓
GitHub OAuth Authorization
  ↓
/api/auth/github/callback
  ↓
Exchange code for token
  ↓
Fetch GitHub user info
  ↓
Store token in database
  ↓
Redirect to dashboard
```

## OAuth Scopes

The app requests these GitHub scopes:

- `read:user` - Read user profile information
- `user:email` - Read user email addresses
- `repo` - Access repositories (public and private)

## Database Schema

The User model stores GitHub connection info:

```prisma
model User {
  id              String   @id @default(cuid())
  clerkId         String   @unique          // Clerk user ID
  email           String   @unique
  name            String?
  avatarUrl       String?
  githubHandle    String?  @unique          // GitHub username
  githubToken     String?                   // GitHub access token
  githubConnected Boolean  @default(false)  // Connection status
  visits          Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  Repo            Repo[]
}
```

## Security Notes

### Token Storage

- GitHub tokens are stored encrypted in the database
- Tokens are never exposed to the client
- Only server-side API routes can access tokens

### Token Refresh

GitHub OAuth tokens don't expire by default, but:

- Users can revoke access anytime from GitHub settings
- App should handle token revocation gracefully
- Consider implementing token refresh logic for production

### Best Practices

1. **Never commit tokens** - Keep `.env` in `.gitignore`
2. **Use environment variables** - Never hardcode credentials
3. **Rotate secrets regularly** - Generate new client secrets periodically
4. **Monitor usage** - Check GitHub API rate limits
5. **Handle errors** - Gracefully handle token revocation

## Testing

### Local Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Sign up/in with Clerk

3. Go to dashboard

4. Click "Connect GitHub Account"

5. Authorize the app

6. You should see "GitHub Connected: @username"

7. Click "Sync Repos" to fetch repositories

### Verify Connection

Check the database:

```bash
npx prisma studio
```

Look for:
- `githubConnected` = true
- `githubHandle` = your username
- `githubToken` = (encrypted token)

## Troubleshooting

### "GitHub not connected" error

**Solution**: Make sure you clicked "Connect GitHub Account" button first

### OAuth callback fails

**Possible causes**:
1. Wrong callback URL in GitHub app settings
2. Missing `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET`
3. Callback URL doesn't match exactly

**Solution**: Double-check all URLs match exactly (including http/https)

### Token not working

**Possible causes**:
1. User revoked access on GitHub
2. Token expired (rare)
3. Insufficient scopes

**Solution**: Disconnect and reconnect GitHub account

### Rate limit errors

GitHub API has rate limits:
- **Authenticated**: 5,000 requests/hour
- **Unauthenticated**: 60 requests/hour

**Solution**: 
- Always use authenticated requests
- Implement caching
- Add rate limit handling

## API Endpoints

### Connect GitHub

```
GET /api/auth/github/connect
```

Redirects user to GitHub OAuth authorization page.

### OAuth Callback

```
GET /api/auth/github/callback?code=xxx
```

Handles OAuth callback, exchanges code for token, stores in database.

### Sync Repos

```
POST /api/github/sync
```

Fetches repos from GitHub API using stored token.

## Production Checklist

- [ ] GitHub OAuth App created
- [ ] Production callback URL configured
- [ ] Environment variables set in hosting platform
- [ ] SSL/HTTPS enabled
- [ ] Token encryption implemented (future)
- [ ] Error handling tested
- [ ] Rate limiting implemented (future)
- [ ] Monitoring set up

## Future Enhancements

### Token Encryption

Currently tokens are stored as plain text. For production, consider:

```typescript
import crypto from 'crypto'

function encryptToken(token: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY!)
  return cipher.update(token, 'utf8', 'hex') + cipher.final('hex')
}

function decryptToken(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY!)
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
}
```

### Token Refresh

Implement automatic token refresh:

```typescript
async function refreshGitHubToken(userId: string) {
  // Check if token is still valid
  // If not, prompt user to reconnect
}
```

### Webhook Auto-Setup

Automatically create webhooks when user connects:

```typescript
async function setupWebhook(token: string, repo: string) {
  await fetch(`https://api.github.com/repos/${repo}/hooks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      config: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/github`,
        content_type: 'json',
        secret: process.env.GITHUB_WEBHOOK_SECRET,
      },
      events: ['push', 'repository'],
    }),
  })
}
```

## Support

For issues:
1. Check GitHub OAuth app settings
2. Verify environment variables
3. Check server logs
4. Test with a fresh OAuth connection

## Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [GitHub Scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)
