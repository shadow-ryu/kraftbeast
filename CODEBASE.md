# KraftBeast Codebase Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Implementation Details](#implementation-details)
5. [User Flows](#user-flows)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Authentication](#authentication)
9. [Webhooks](#webhooks)
10. [Resources](#resources)

---

## Project Overview

**Name:** KraftBeast  
**Tagline:** Your portfolio updates itself — so you can too.  
**Purpose:** Automatically build and update developer portfolios from GitHub activity.

### Problem Statement
Developers hate maintaining portfolios. They build cool projects but never showcase them because updating personal sites is annoying, repetitive, and time-consuming.

### Solution
Connect GitHub once → every push auto-creates/updates a project card on your portfolio. No manual rebuilding, no design work, zero friction.

### Target Audience
- Solo developers
- Indie hackers
- Open-source builders
- Anyone who lives on GitHub

### MVP Goals
Validate that developers want automatic portfolio updates from GitHub. Success = users connect GitHub → push code → see instant update → share portfolio link.

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 (16.0.2) | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| shadcn/ui | Latest | Pre-built UI components |
| Lucide React | 0.553.0 | Icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 15 | Serverless API endpoints |
| Prisma | 6.19.0 | ORM for database |
| PostgreSQL | Latest | Relational database |
| Node.js | 18+ | Runtime environment |

### Authentication & Services

| Service | Purpose |
|---------|---------|
| Clerk | Authentication & user management |
| GitHub OAuth | Social login provider |
| GitHub API | Fetch repository data |
| GitHub Webhooks | Real-time push notifications |

### Deployment & Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Hosting & serverless functions |
| Supabase/Railway/Neon | PostgreSQL hosting (flexible) |
| Vercel Edge Network | CDN for static assets |

---

## Project Structure

```
kraftbeast/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── github/
│   │   │   │   ├── repos/
│   │   │   │   │   └── route.ts      # Fetch GitHub repos
│   │   │   │   └── sync/
│   │   │   │       └── route.ts      # Sync repos to database
│   │   │   └── webhook/
│   │   │       ├── clerk/
│   │   │       │   └── route.ts      # Clerk user events
│   │   │       └── github/
│   │   │           └── route.ts      # GitHub push events
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # User dashboard
│   │   │   └── loading.tsx           # Loading state
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx          # Sign in page
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx          # Sign up page
│   │   ├── [username]/
│   │   │   ├── page.tsx              # Public portfolio
│   │   │   ├── loading.tsx           # Loading state
│   │   │   └── not-found.tsx         # 404 page
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── not-found.tsx             # Global 404
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       └── skeleton.tsx
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   └── utils.ts                  # Utility functions
│   ├── types/
│   │   └── index.ts                  # TypeScript types
│   └── middleware.ts                 # Clerk auth middleware
├── prisma/
│   └── schema.prisma                 # Database schema
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── .env.example                      # Env template
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── next.config.js                    # Next.js config
├── components.json                   # shadcn/ui config
├── README.md                         # Project overview
├── QUICKSTART.md                     # Quick setup guide
├── DEPLOYMENT.md                     # Deployment guide
├── TESTING.md                        # Testing guide
├── ROADMAP.md                        # Feature roadmap
├── ARCHITECTURE.md                   # System architecture
├── CODEBASE.md                       # This file
└── setup.sh                          # Setup script
```

---

## Implementation Details

### 1. Landing Page (`src/app/page.tsx`)

**Purpose:** Marketing page to attract users and explain the product.

**Key Features:**
- Hero section with value proposition
- Feature cards (Connect GitHub, Auto-Sync, Track Visits)
- CTA buttons linking to sign-up
- Responsive design

**Components Used:**
- `Button` - CTA buttons
- `Card` - Feature cards
- Lucide icons - Visual elements

**Code Highlights:**
```typescript
// Clean, minimal design
<h1 className="text-5xl font-bold mb-6">
  Your Portfolio Updates Itself<br />
  <span className="text-neutral-600">— So You Can Too</span>
</h1>
```

### 2. Authentication (`src/middleware.ts`)

**Purpose:** Protect routes and manage user sessions.

**Implementation:**

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})
```

**Protected Routes:**
- `/dashboard` - Requires authentication
- `/api/github/*` - Requires authentication

**Public Routes:**
- `/` - Landing page
- `/[username]` - Portfolio pages
- `/sign-in`, `/sign-up` - Auth pages

### 3. Dashboard (`src/app/dashboard/page.tsx`)

**Purpose:** User's control center for managing repos and viewing stats.

**Features:**
- Display user info (avatar, name, GitHub handle)
- Show stats (repo count, visits, total stars)
- "Sync GitHub Repos" button
- Grid of synced repositories
- Link to public portfolio

**Data Flow:**
1. Server-side authentication check
2. Fetch current user from Clerk
3. Get or create user in database
4. Fetch user's repos with Prisma
5. Render dashboard with data

**Key Code:**
```typescript
const { userId } = await auth()
if (!userId) redirect('/sign-in')

const user = await currentUser()

let dbUser = await prisma.user.findUnique({
  where: { email: user?.emailAddresses[0]?.emailAddress },
  include: { repos: { orderBy: { lastPushed: 'desc' } } }
})
```

### 4. Portfolio Page (`src/app/[username]/page.tsx`)

**Purpose:** Public-facing portfolio showcasing user's projects.

**Features:**
- Left sidebar: User profile, stats, GitHub link
- Right content: Grid of project cards
- Visit counter (auto-increments)
- Responsive layout
- SEO-friendly (server-rendered)

**Data Flow:**
1. Extract username from URL params
2. Query database for user by githubHandle
3. Fetch public repos only
4. Increment visit counter
5. Render portfolio
6. Return 404 if user not found

**Key Code:**
```typescript
const user = await prisma.user.findUnique({
  where: { githubHandle: username },
  include: { 
    repos: { 
      where: { isPrivate: false },
      orderBy: { lastPushed: 'desc' } 
    } 
  }
})

if (!user) notFound()

await prisma.user.update({
  where: { id: user.id },
  data: { visits: { increment: 1 } }
})
```

### 5. GitHub Sync API (`src/app/api/github/sync/route.ts`)

**Purpose:** Manually sync repos from GitHub to database.

**Flow:**
1. Verify user authentication
2. Get GitHub OAuth token from Clerk
3. Fetch repos from GitHub API
4. Get or create user in database
5. Upsert each repo (update if exists, create if new)
6. Return sync count

**GitHub API Call:**
```typescript
const response = await fetch(
  'https://api.github.com/user/repos?per_page=100&sort=updated',
  {
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  }
)
```

**Database Upsert:**
```typescript
await prisma.repo.upsert({
  where: {
    userId_name: {
      userId: dbUser.id,
      name: repo.name
    }
  },
  update: {
    description: repo.description,
    stars: repo.stargazers_count,
    lastPushed: new Date(repo.pushed_at),
    // ... other fields
  },
  create: {
    userId: dbUser.id,
    name: repo.name,
    // ... all fields
  }
})
```

### 6. GitHub Webhook (`src/app/api/webhook/github/route.ts`)

**Purpose:** Handle real-time updates when user pushes to GitHub.

**Security:**
- Verifies webhook signature using HMAC SHA-256
- Prevents unauthorized webhook calls

**Supported Events:**
- `push` - Update repo on new commits
- `repository` - Handle repo creation/deletion

**Signature Verification:**
```typescript
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}
```

**Push Event Handler:**
```typescript
if (event === 'push') {
  const repoName = data.repository.name
  const githubHandle = data.repository.owner.login
  
  const user = await prisma.user.findUnique({
    where: { githubHandle }
  })
  
  await prisma.repo.upsert({
    where: { userId_name: { userId: user.id, name: repoName } },
    update: {
      lastPushed: pushedAt,
      commits: { increment: data.commits?.length || 1 }
    },
    create: { /* ... */ }
  })
}
```

### 7. Clerk Webhook (`src/app/api/webhook/clerk/route.ts`)

**Purpose:** Sync user data when Clerk events occur.

**Events Handled:**
- `user.created` - Create user in database
- `user.updated` - Update user info

**Signature Verification:**
```typescript
import { Webhook } from 'svix'

const wh = new Webhook(webhookSecret)
const evt = wh.verify(payload, headers)
```

**User Creation:**
```typescript
if (evt.type === 'user.created') {
  await prisma.user.upsert({
    where: { email: email_addresses[0]?.email_address },
    update: { /* ... */ },
    create: {
      email: email_addresses[0]?.email_address,
      name: `${first_name} ${last_name}`.trim(),
      avatarUrl: image_url,
      githubHandle: username,
    }
  })
}
```

---

## User Flows

### Flow 1: New User Signup

```
1. User visits landing page (/)
   ↓
2. Clicks "Get Started" or "Sign Up"
   ↓
3. Redirected to Clerk sign-up page
   ↓
4. Chooses "Continue with GitHub"
   ↓
5. GitHub OAuth authorization screen
   ↓
6. User authorizes app
   ↓
7. Clerk creates user account
   ↓
8. Webhook sent to /api/webhook/clerk
   ↓
9. User created in database
   ↓
10. Redirected to /dashboard
```

**Technical Details:**
- Clerk handles OAuth flow
- GitHub scopes: `user:email`, `read:user`, `repo`
- Webhook creates database record
- Session stored in HTTP-only cookie

### Flow 2: Sync Repositories

```
1. User on dashboard
   ↓
2. Clicks "Sync GitHub Repos"
   ↓
3. POST request to /api/github/sync
   ↓
4. Backend fetches GitHub OAuth token from Clerk
   ↓
5. Calls GitHub API: GET /user/repos
   ↓
6. Receives list of repositories
   ↓
7. For each repo:
   - Check if exists in database
   - Update if exists, create if new
   ↓
8. Returns success + count
   ↓
9. Dashboard refreshes showing repos
```

**Technical Details:**
- Uses GitHub REST API v3
- Fetches up to 100 repos per request
- Upsert operation prevents duplicates
- Stores: name, description, stars, language, etc.

### Flow 3: Automatic Update via Webhook

```
1. User pushes code to GitHub
   ↓
2. GitHub triggers webhook
   ↓
3. POST to /api/webhook/github
   ↓
4. Verify webhook signature
   ↓
5. Parse push event payload
   ↓
6. Extract repo info and owner
   ↓
7. Find user by githubHandle
   ↓
8. Update repo in database:
   - Increment commit count
   - Update lastPushed timestamp
   - Update stars/description
   ↓
9. Return 200 OK to GitHub
   ↓
10. Portfolio page shows updated data on next visit
```

**Technical Details:**
- Webhook signature verified with HMAC SHA-256
- Handles push and repository events
- Idempotent operations (safe to retry)
- No user interaction required

### Flow 4: View Portfolio

```
1. Visitor opens /[username]
   ↓
2. Server-side rendering (RSC)
   ↓
3. Query database for user
   ↓
4. Fetch public repos only
   ↓
5. Increment visit counter
   ↓
6. Render HTML with data
   ↓
7. Send to browser
   ↓
8. Page displays instantly (SSR)
```

**Technical Details:**
- Server-side rendered for SEO
- Only public repos shown
- Visit counter atomic increment
- Fast response time (<500ms)

### Flow 5: Share Portfolio

```
1. User on dashboard
   ↓
2. Clicks "View Portfolio"
   ↓
3. Opens /[githubHandle] in new tab
   ↓
4. User copies URL
   ↓
5. Shares on Twitter/LinkedIn/etc.
   ↓
6. Visitors click link
   ↓
7. Portfolio loads with all projects
   ↓
8. Visit counter increments
```

**Technical Details:**
- Clean URLs: `kraftbeast.com/username`
- No authentication required
- SEO optimized
- Social media preview cards (future)

---

## API Documentation

### Public Endpoints

#### `GET /`
**Description:** Landing page  
**Auth:** None  
**Response:** HTML page

#### `GET /[username]`
**Description:** Public portfolio page  
**Auth:** None  
**Parameters:**
- `username` (path) - GitHub username  

**Response:** HTML page or 404

**Side Effects:**
- Increments visit counter

### Protected Endpoints

#### `GET /dashboard`
**Description:** User dashboard  
**Auth:** Required (Clerk)  
**Response:** HTML page with user data

#### `POST /api/github/sync`
**Description:** Sync repos from GitHub  
**Auth:** Required (Clerk)  
**Request:** None  
**Response:**
```json
{
  "success": true,
  "synced": 15
}
```

**Errors:**
- 401: Unauthorized
- 400: GitHub not connected
- 500: Sync failed

#### `GET /api/github/repos`
**Description:** Fetch repos from GitHub API  
**Auth:** Required (Clerk)  
**Response:**
```json
{
  "repos": [
    {
      "id": 123,
      "name": "my-project",
      "description": "Cool project",
      "stargazers_count": 42,
      "language": "TypeScript",
      // ... more fields
    }
  ]
}
```

### Webhook Endpoints

#### `POST /api/webhook/github`
**Description:** Handle GitHub webhook events  
**Auth:** Signature verification  
**Headers:**
- `x-github-event`: Event type
- `x-hub-signature-256`: HMAC signature  

**Request Body (push event):**
```json
{
  "ref": "refs/heads/main",
  "repository": {
    "name": "repo-name",
    "owner": { "login": "username" },
    "stargazers_count": 10,
    // ... more fields
  },
  "commits": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Repo updated"
}
```

#### `POST /api/webhook/clerk`
**Description:** Handle Clerk user events  
**Auth:** Svix signature verification  
**Headers:**
- `svix-id`: Message ID
- `svix-timestamp`: Timestamp
- `svix-signature`: Signature  

**Request Body:**
```json
{
  "type": "user.created",
  "data": {
    "id": "user_xxx",
    "email_addresses": [...],
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Database Schema

### User Table

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  avatarUrl    String?
  githubHandle String?  @unique
  repos        Repo[]
  visits       Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Fields:**
- `id` - Unique identifier (CUID)
- `email` - User email (unique, required)
- `name` - Display name (optional)
- `avatarUrl` - Profile picture URL
- `githubHandle` - GitHub username (unique)
- `repos` - Relation to Repo model
- `visits` - Portfolio view count
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

**Indexes:**
- Primary: `id`
- Unique: `email`, `githubHandle`

### Repo Table

```prisma
model Repo {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  stars       Int      @default(0)
  commits     Int      @default(0)
  lastPushed  DateTime
  url         String
  language    String?
  isPrivate   Boolean  @default(false)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, name])
}
```

**Fields:**
- `id` - Unique identifier (CUID)
- `userId` - Foreign key to User
- `name` - Repository name
- `description` - Repo description
- `stars` - Star count
- `commits` - Commit count
- `lastPushed` - Last push timestamp
- `url` - GitHub URL
- `language` - Primary language
- `isPrivate` - Privacy flag
- `user` - Relation to User model
- `createdAt` - Record creation
- `updatedAt` - Last update

**Indexes:**
- Primary: `id`
- Unique: `(userId, name)` composite
- Foreign key: `userId` → `User.id`

**Cascade Delete:**
- When user deleted, all repos deleted

### Relationships

```
User (1) ←→ (Many) Repo
```

One user can have many repos.  
Each repo belongs to one user.

---

## Authentication

### Clerk Integration

**Setup:**
1. Clerk application created
2. GitHub OAuth provider enabled
3. OAuth scopes configured
4. Redirect URLs set

**OAuth Scopes:**
- `user:email` - Read user email
- `read:user` - Read user profile
- `repo` - Access repositories (public + private)

**Session Management:**
- JWT tokens stored in HTTP-only cookies
- Automatic token refresh
- Secure session handling

**Middleware Protection:**
```typescript
// Protects /dashboard and /api/github/*
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})
```

**Getting Current User:**
```typescript
import { auth, currentUser } from '@clerk/nextjs/server'

// Get user ID
const { userId } = await auth()

// Get full user object
const user = await currentUser()
```

**Accessing GitHub Token:**
```typescript
const githubAccount = user?.externalAccounts?.find(
  account => account.provider === 'oauth_github'
)
```

---

## Webhooks

### GitHub Webhook Setup

**Configuration:**
1. Go to repo Settings → Webhooks
2. Payload URL: `https://your-domain.com/api/webhook/github`
3. Content type: `application/json`
4. Secret: Set `GITHUB_WEBHOOK_SECRET`
5. Events: Push, Repository

**Security:**
- HMAC SHA-256 signature verification
- Secret key stored in environment
- Timing-safe comparison

**Events Handled:**
- `push` - New commits pushed
- `repository.created` - New repo created
- `repository.deleted` - Repo deleted

### Clerk Webhook Setup

**Configuration:**
1. Clerk Dashboard → Webhooks
2. Endpoint: `https://your-domain.com/api/webhook/clerk`
3. Events: user.created, user.updated
4. Copy signing secret

**Security:**
- Svix signature verification
- Automatic replay protection
- Timestamp validation

**Events Handled:**
- `user.created` - New user signup
- `user.updated` - User info changed

---

## Resources

### Official Documentation

**Next.js:**
- Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

**Prisma:**
- Docs: https://www.prisma.io/docs
- Schema: https://www.prisma.io/docs/concepts/components/prisma-schema
- Client: https://www.prisma.io/docs/concepts/components/prisma-client

**Clerk:**
- Docs: https://clerk.com/docs
- Next.js: https://clerk.com/docs/quickstarts/nextjs
- Webhooks: https://clerk.com/docs/integrations/webhooks

**GitHub:**
- REST API: https://docs.github.com/en/rest
- Webhooks: https://docs.github.com/en/webhooks
- OAuth: https://docs.github.com/en/apps/oauth-apps

**Tailwind CSS:**
- Docs: https://tailwindcss.com/docs
- v4: https://tailwindcss.com/blog/tailwindcss-v4

**shadcn/ui:**
- Docs: https://ui.shadcn.com
- Components: https://ui.shadcn.com/docs/components

### Database Providers

**Supabase:**
- Website: https://supabase.com
- Docs: https://supabase.com/docs
- Pricing: https://supabase.com/pricing

**Railway:**
- Website: https://railway.app
- Docs: https://docs.railway.app
- Pricing: https://railway.app/pricing

**Neon:**
- Website: https://neon.tech
- Docs: https://neon.tech/docs
- Pricing: https://neon.tech/pricing

### Deployment

**Vercel:**
- Website: https://vercel.com
- Docs: https://vercel.com/docs
- Next.js: https://vercel.com/docs/frameworks/nextjs

### Learning Resources

**Next.js 15:**
- What's New: https://nextjs.org/blog/next-15
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

**Prisma:**
- Getting Started: https://www.prisma.io/docs/getting-started
- Migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Best Practices: https://www.prisma.io/docs/guides/performance-and-optimization

**TypeScript:**
- Handbook: https://www.typescriptlang.org/docs/handbook
- React + TypeScript: https://react-typescript-cheatsheet.netlify.app

### Community & Support

**GitHub:**
- Issues: Create issues for bugs
- Discussions: Ask questions
- Pull Requests: Contribute code

**Discord/Slack:**
- Next.js: https://nextjs.org/discord
- Prisma: https://pris.ly/discord
- Clerk: https://clerk.com/discord

### Tools & Utilities

**Development:**
- Prisma Studio: `npx prisma studio`
- Vercel CLI: `npm i -g vercel`
- GitHub CLI: https://cli.github.com

**Testing:**
- Webhook Testing: https://webhook.site
- API Testing: Postman, Insomnia
- Load Testing: Apache Bench, wrk

**Monitoring:**
- Vercel Analytics: Built-in
- Sentry: Error tracking
- LogRocket: Session replay

---

## Environment Variables Reference

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# GitHub
GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"
GITHUB_WEBHOOK_SECRET="your_webhook_secret"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Quick Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Start production server

# Database
npm run db:generate            # Generate Prisma client
npm run db:migrate             # Run migrations
npm run db:push                # Push schema changes
npm run db:studio              # Open Prisma Studio

# Utilities
npm run lint                   # Run ESLint
./setup.sh                     # Run setup script
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page |
| `src/app/dashboard/page.tsx` | User dashboard |
| `src/app/[username]/page.tsx` | Portfolio page |
| `src/app/api/github/sync/route.ts` | Sync API |
| `src/app/api/webhook/github/route.ts` | GitHub webhook |
| `src/app/api/webhook/clerk/route.ts` | Clerk webhook |
| `src/lib/prisma.ts` | Prisma client |
| `src/middleware.ts` | Auth middleware |
| `prisma/schema.prisma` | Database schema |
| `.env.local` | Environment variables |

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
- Check `DATABASE_URL` is correct
- Verify database is running
- Test connection: `npx prisma db pull`

**2. Authentication Not Working**
- Verify Clerk keys are set
- Check OAuth redirect URLs
- Ensure middleware is configured

**3. Repos Not Syncing**
- Check GitHub OAuth scopes
- Verify token is valid
- Review API rate limits

**4. Webhook Not Triggering**
- Verify webhook URL is public
- Check signature secret matches
- Review webhook delivery logs

**5. Build Errors**
- Run `npm run db:generate`
- Clear `.next` folder
- Check TypeScript errors

---

## Performance Considerations

**Database:**
- Indexes on `githubHandle` and `userId`
- Connection pooling via Prisma
- Efficient queries with `select` and `include`

**Caching:**
- Static pages cached by Vercel
- API responses can be cached
- Consider Redis for sessions (future)

**Optimization:**
- Server-side rendering for SEO
- Image optimization with Next.js Image
- Code splitting automatic
- Edge functions for global speed

---

## Security Best Practices

**Authentication:**
- JWT tokens in HTTP-only cookies
- CSRF protection enabled
- Session timeout configured

**API Security:**
- Webhook signature verification
- Rate limiting (future)
- Input validation
- SQL injection prevented (Prisma)

**Data Privacy:**
- Private repos not shown
- User emails not exposed
- GDPR compliant (future)

---

## Contributing

**Setup:**
1. Fork repository
2. Clone locally
3. Run `./setup.sh`
4. Create feature branch
5. Make changes
6. Test thoroughly
7. Submit pull request

**Code Style:**
- TypeScript strict mode
- ESLint rules enforced
- Prettier formatting
- Meaningful commit messages

---

## License

MIT License - See LICENSE file

---

## Support

**Documentation:**
- README.md - Overview
- QUICKSTART.md - Setup guide
- DEPLOYMENT.md - Deploy guide
- TESTING.md - Test guide
- ROADMAP.md - Future plans
- ARCHITECTURE.md - System design
- CODEBASE.md - This file

**Contact:**
- GitHub Issues
- Email support
- Community Discord

---

**Last Updated:** November 2024  
**Version:** 1.0.0 (MVP)  
**Status:** Production Ready
