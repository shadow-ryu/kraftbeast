# GitHub App Flow Diagrams

Visual representation of how the GitHub App integration works.

## Installation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Installation Flow                       │
└─────────────────────────────────────────────────────────────────┘

User Dashboard
     │
     │ Clicks "Install GitHub App"
     ▼
/api/auth/github/app/install
     │
     │ Redirects to GitHub
     ▼
GitHub Authorization Page
     │
     │ User selects repos
     │ User clicks "Install"
     ▼
GitHub App Installed
     │
     │ Redirects with code
     ▼
/api/auth/github/app/callback
     │
     ├─► Exchange code for user token
     │
     ├─► Fetch GitHub user info
     │
     ├─► Get installation ID
     │
     └─► Store in database:
         - githubHandle
         - githubInstallationId
         - githubAppConnected = true
     │
     ▼
Dashboard (Success!)
```

## Repository Sync Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Repository Sync Flow                         │
└─────────────────────────────────────────────────────────────────┘

User clicks "Sync Repos"
     │
     ▼
/api/github/sync (POST)
     │
     ├─► Check if user has GitHub App
     │   │
     │   ├─► Yes: Use GitHub App flow
     │   │   │
     │   │   ├─► Generate JWT from private key
     │   │   │
     │   │   ├─► Get installation token (1 hour)
     │   │   │
     │   │   ├─► Fetch repos with installation token
     │   │   │
     │   │   └─► For each repo:
     │   │       ├─► Fetch languages
     │   │       ├─► Fetch commit count
     │   │       └─► Upsert to database
     │   │
     │   └─► No: Use OAuth flow (legacy)
     │       │
     │       ├─► Use stored OAuth token
     │       │
     │       └─► Fetch repos with OAuth token
     │
     ▼
Return success + repo count
```

## Webhook Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Webhook Flow                              │
└─────────────────────────────────────────────────────────────────┘

User pushes to repo
     │
     ▼
GitHub sends webhook
     │
     ▼
/api/webhook/github (POST)
     │
     ├─► Verify signature (HMAC-SHA256)
     │   │
     │   ├─► Valid: Continue
     │   └─► Invalid: Reject (401)
     │
     ├─► Check event type
     │   │
     │   ├─► "push" event
     │   │   │
     │   │   ├─► Find user by GitHub handle
     │   │   │
     │   │   ├─► Update repo metadata
     │   │   │
     │   │   └─► Create timeline entries
     │   │
     │   ├─► "installation" event
     │   │   │
     │   │   ├─► action = "created"
     │   │   │   └─► Store installation ID
     │   │   │
     │   │   └─► action = "deleted"
     │   │       └─► Remove installation ID
     │   │
     │   └─► "repository" event
     │       │
     │       ├─► action = "created"
     │       │   └─► Add repo to database
     │       │
     │       └─► action = "deleted"
     │           └─► Remove repo from database
     │
     ▼
Return success
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub App Authentication                     │
└─────────────────────────────────────────────────────────────────┘

Need to call GitHub API
     │
     ▼
Generate JWT
     │
     ├─► Load private key from env
     │
     ├─► Create payload:
     │   - iat: now - 60 seconds
     │   - exp: now + 10 minutes
     │   - iss: app_id
     │
     └─► Sign with RS256
     │
     ▼
JWT Token (valid 10 minutes)
     │
     ▼
Request installation token
     │
     ├─► POST /app/installations/{id}/access_tokens
     │
     ├─► Headers:
     │   - Authorization: Bearer {JWT}
     │
     └─► Response:
         - token: installation_token
         - expires_at: now + 1 hour
     │
     ▼
Installation Token (valid 1 hour)
     │
     ▼
Call GitHub API
     │
     ├─► Headers:
     │   - Authorization: Bearer {installation_token}
     │
     └─► Make API calls:
         - GET /installation/repositories
         - GET /repos/{owner}/{repo}/contents
         - GET /repos/{owner}/{repo}/commits
         - etc.
```

## Migration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    OAuth to GitHub App Migration                 │
└─────────────────────────────────────────────────────────────────┘

Existing OAuth User
     │
     ▼
Logs into Dashboard
     │
     ├─► Check user status:
     │   - Has OAuth token? Yes
     │   - Has GitHub App? No
     │
     ▼
Show Migration Banner
     │
     │ "Security Upgrade Available!"
     │ "Read-only access • Better security"
     │
     ▼
User clicks "Upgrade to GitHub App"
     │
     ▼
GitHub App Installation Flow
     │
     ├─► Install GitHub App
     │
     ├─► Store installation ID
     │
     └─► Set githubAppConnected = true
     │
     ▼
Dashboard (Upgraded!)
     │
     ├─► Migration banner hidden
     │
     ├─► "GitHub App" badge shown
     │
     └─► Future syncs use GitHub App
         (OAuth token kept for rollback)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Data Flow                                │
└─────────────────────────────────────────────────────────────────┘

GitHub Repository
     │
     │ Read-only access
     ▼
GitHub API
     │
     ├─► Repository metadata
     │   - name, description
     │   - stars, forks
     │   - language, topics
     │   - visibility (public/private)
     │
     ├─► Commit history
     │   - commit messages
     │   - timestamps
     │   - author info
     │
     └─► File contents
         - README.md
         - package.json
         - etc.
     │
     ▼
KraftBeast API
     │
     ├─► Process data
     │
     ├─► Store in database:
     │   - Repo table
     │   - Timeline table
     │
     └─► Generate portfolio
     │
     ▼
User Portfolio Page
     │
     ├─► Display repos
     │
     ├─► Show timeline
     │
     └─► Render README
```

## Permission Scope

```
┌─────────────────────────────────────────────────────────────────┐
│                      Permission Scope                            │
└─────────────────────────────────────────────────────────────────┘

GitHub App Permissions
     │
     ├─► Repository Permissions
     │   │
     │   ├─► Contents: Read ✓
     │   │   - Read files
     │   │   - Read commits
     │   │   - Read branches
     │   │   - Read tags
     │   │
     │   └─► Metadata: Read ✓ (automatic)
     │       - Repository name
     │       - Description
     │       - Topics
     │       - Visibility
     │
     ├─► Account Permissions
     │   │
     │   └─► Email: Read ✓
     │       - User email address
     │
     └─► NOT Granted ✗
         │
         ├─► Contents: Write ✗
         ├─► Administration ✗
         ├─► Issues ✗
         ├─► Pull Requests ✗
         ├─► Secrets ✗
         └─► Webhooks ✗
```

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    System Architecture                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       │ HTTPS
       ▼
┌──────────────────────────────────────────────────────────────┐
│                      Next.js App                              │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Dashboard     │  │   API Routes    │  │  Webhooks   │ │
│  │   - UI          │  │   - Auth        │  │  - GitHub   │ │
│  │   - Settings    │  │   - Sync        │  │  - Clerk    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              GitHub App Library                          │ │
│  │  - JWT generation                                        │ │
│  │  - Installation token management                         │ │
│  │  - API helpers                                           │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │ Prisma
                            ▼
                    ┌───────────────┐
                    │   PostgreSQL  │
                    │   Database    │
                    │               │
                    │   - Users     │
                    │   - Repos     │
                    │   - Timeline  │
                    └───────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   GitHub     │  │    Clerk     │  │   Resend     │
│   API        │  │    Auth      │  │   Email      │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      Token Lifecycle                             │
└─────────────────────────────────────────────────────────────────┘

Private Key (stored in env)
     │
     │ Used to generate
     ▼
JWT Token
     │
     ├─► Valid for: 10 minutes
     ├─► Algorithm: RS256
     ├─► Payload: { iat, exp, iss }
     └─► Used for: App authentication
     │
     │ Exchange for
     ▼
Installation Token
     │
     ├─► Valid for: 1 hour
     ├─► Scope: Installation repos only
     ├─► Type: Bearer token
     └─► Used for: API calls
     │
     │ After 1 hour
     ▼
Token Expires
     │
     │ Generate new JWT
     │ Get new installation token
     ▼
Repeat cycle
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Error Handling Flow                          │
└─────────────────────────────────────────────────────────────────┘

API Request
     │
     ▼
Try to get installation token
     │
     ├─► Success: Continue
     │
     └─► Error:
         │
         ├─► Invalid JWT
         │   └─► Check private key format
         │       └─► Regenerate JWT
         │
         ├─► Installation not found
         │   └─► User needs to install app
         │       └─► Show installation prompt
         │
         ├─► Token expired
         │   └─► Generate new token
         │       └─► Retry request
         │
         └─► Permission denied
             └─► Check app permissions
                 └─► User may need to grant access
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       Security Flow                              │
└─────────────────────────────────────────────────────────────────┘

Webhook Received
     │
     ▼
Extract signature from header
     │
     ├─► x-hub-signature-256
     │
     ▼
Compute HMAC-SHA256
     │
     ├─► Use webhook secret
     ├─► Hash payload
     └─► Generate digest
     │
     ▼
Compare signatures
     │
     ├─► Match: Process webhook ✓
     │
     └─► No match: Reject (401) ✗
         │
         └─► Log security event
```

---

## Legend

```
│  = Flow direction
▼  = Next step
├─► = Branch/Option
└─► = Final branch
✓  = Allowed/Success
✗  = Denied/Error
```

## Quick Reference

### Key URLs
- Install: `/api/auth/github/app/install`
- Callback: `/api/auth/github/app/callback`
- Sync: `/api/github/sync`
- Webhook: `/api/webhook/github`

### Key Permissions
- Contents: Read-only ✓
- Metadata: Read-only ✓
- Email: Read-only ✓
- Write: None ✗

### Key Tokens
- JWT: 10 minutes (app auth)
- Installation: 1 hour (API calls)
- OAuth: Never expires (legacy)

### Key Events
- push: New commits
- installation: App install/uninstall
- repository: Repo created/deleted
