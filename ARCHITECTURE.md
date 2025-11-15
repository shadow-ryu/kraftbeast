# KraftBeast Architecture

## System Overview

KraftBeast is a Next.js 15 application that automatically syncs GitHub repositories to create and maintain developer portfolios.

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Next.js App (Vercel)        │
│  ┌───────────────────────────────┐  │
│  │      App Router (RSC)         │  │
│  │  - Landing Page               │  │
│  │  - Dashboard                  │  │
│  │  - Portfolio Pages            │  │
│  │  - Auth Pages                 │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │       API Routes              │  │
│  │  - /api/github/sync           │  │
│  │  - /api/github/repos          │  │
│  │  - /api/webhook/github        │  │
│  │  - /api/webhook/clerk         │  │
│  └───────────────────────────────┘  │
└──────┬──────────────────────┬───────┘
       │                      │
       ▼                      ▼
┌─────────────┐      ┌─────────────┐
│    Clerk    │      │  PostgreSQL │
│   (Auth)    │      │  (Prisma)   │
└─────────────┘      └─────────────┘
       │
       ▼
┌─────────────┐
│   GitHub    │
│     API     │
└─────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (Vercel Serverless)
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase, Railway, Neon, or self-hosted)
- **ORM**: Prisma

### Authentication
- **Provider**: Clerk
- **Method**: GitHub OAuth
- **Session**: JWT tokens

### External Services
- **GitHub API**: Fetch repos, user data
- **GitHub Webhooks**: Real-time push events
- **Clerk Webhooks**: User lifecycle events

## Data Flow

### 1. User Signup Flow
```
User clicks "Sign Up"
  → Clerk OAuth screen
  → GitHub authorization
  → Clerk creates user
  → Webhook to /api/webhook/clerk
  → Create user in database
  → Redirect to /dashboard
```

### 2. Repo Sync Flow
```
User clicks "Sync Repos"
  → POST /api/github/sync
  → Fetch repos from GitHub API
  → Upsert repos in database
  → Return success response
  → Dashboard updates
```

### 3. Webhook Update Flow
```
User pushes to GitHub
  → GitHub webhook triggered
  → POST /api/webhook/github
  → Verify signature
  → Parse payload
  → Update repo in database
  → Return 200 OK
```

### 4. Portfolio View Flow
```
Visitor opens /[username]
  → Server-side fetch user + repos
  → Increment visit counter
  → Render portfolio page
  → Return HTML
```

## Database Schema

### User Table
```sql
CREATE TABLE "User" (
  id           TEXT PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  name         TEXT,
  avatarUrl    TEXT,
  githubHandle TEXT UNIQUE,
  visits       INTEGER DEFAULT 0,
  createdAt    TIMESTAMP DEFAULT NOW(),
  updatedAt    TIMESTAMP DEFAULT NOW()
);
```

### Repo Table
```sql
CREATE TABLE "Repo" (
  id          TEXT PRIMARY KEY,
  userId      TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  stars       INTEGER DEFAULT 0,
  commits     INTEGER DEFAULT 0,
  lastPushed  TIMESTAMP NOT NULL,
  url         TEXT NOT NULL,
  language    TEXT,
  isPrivate   BOOLEAN DEFAULT false,
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE(userId, name)
);
```

### Indexes
```sql
CREATE INDEX idx_user_githubHandle ON "User"(githubHandle);
CREATE INDEX idx_repo_userId ON "Repo"(userId);
CREATE INDEX idx_repo_lastPushed ON "Repo"(lastPushed DESC);
```

## API Endpoints

### Public Endpoints

#### `GET /`
Landing page with product info and CTA.

#### `GET /[username]`
Public portfolio page for a user.
- Fetches user by githubHandle
- Fetches public repos
- Increments visit counter
- Returns 404 if user not found

### Protected Endpoints (Require Auth)

#### `GET /dashboard`
User dashboard with repos and stats.
- Requires Clerk authentication
- Fetches user data
- Displays repos and analytics

#### `POST /api/github/sync`
Manually sync repos from GitHub.
- Requires authentication
- Fetches repos from GitHub API
- Upserts repos in database
- Returns sync count

#### `GET /api/github/repos`
Fetch repos from GitHub API.
- Requires authentication
- Returns raw GitHub API response

### Webhook Endpoints

#### `POST /api/webhook/github`
Handle GitHub webhook events.
- Verifies signature
- Handles push events
- Handles repository events
- Updates database

#### `POST /api/webhook/clerk`
Handle Clerk webhook events.
- Verifies signature (Svix)
- Handles user.created
- Handles user.updated
- Syncs user data

## Authentication Flow

### Clerk Integration
```typescript
// middleware.ts
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})
```

### Protected Routes
- `/dashboard` - User dashboard
- `/api/github/*` - GitHub API routes

### Public Routes
- `/` - Landing page
- `/[username]` - Portfolio pages
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

## Security

### Authentication
- JWT tokens via Clerk
- HTTP-only cookies
- Secure session management

### Webhook Verification
```typescript
// GitHub webhook
const signature = request.headers.get('x-hub-signature-256')
const isValid = verifySignature(payload, signature, secret)

// Clerk webhook
const wh = new Webhook(webhookSecret)
const evt = wh.verify(payload, headers)
```

### Data Protection
- Private repos not shown on portfolio
- User emails not exposed
- SQL injection prevented (Prisma)
- XSS protection (React)
- CSRF protection (Next.js)

### Rate Limiting
```typescript
// Future implementation
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

## Performance Optimizations

### Server-Side Rendering
- Portfolio pages use RSC
- Fast initial page load
- SEO-friendly

### Caching Strategy
```typescript
// Future implementation
export const revalidate = 60 // Revalidate every 60s

// Or use on-demand revalidation
revalidatePath(`/${username}`)
```

### Database Optimization
- Indexes on frequently queried fields
- Connection pooling via Prisma
- Efficient queries with select/include

### Image Optimization
```typescript
// Use Next.js Image component
<Image 
  src={user.avatarUrl} 
  width={96} 
  height={96}
  alt={user.name}
/>
```

## Error Handling

### API Routes
```typescript
try {
  // Operation
  return NextResponse.json({ success: true })
} catch (error) {
  console.error('Error:', error)
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  )
}
```

### Client-Side
```typescript
// Use error boundaries
export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

## Deployment Architecture

### Vercel
- Serverless functions for API routes
- Edge network for static assets
- Automatic HTTPS
- Preview deployments

### Environment Variables
```
Production:
- DATABASE_URL (PostgreSQL connection string)
- CLERK_SECRET_KEY
- GITHUB_WEBHOOK_SECRET

Development:
- Same as production but different values
```

### CI/CD Pipeline
```
Git Push → GitHub
  → Vercel detects change
  → Run build
  → Run tests (future)
  → Deploy to preview
  → Merge to main
  → Deploy to production
```

## Monitoring & Logging

### Logging Strategy
```typescript
// Structured logging
console.log({
  level: 'info',
  message: 'Repo synced',
  userId: user.id,
  repoCount: repos.length,
  timestamp: new Date().toISOString()
})
```

### Metrics to Track
- API response times
- Database query times
- Webhook success rate
- User signups
- Repo syncs
- Portfolio views
- Error rates

### Error Tracking
```typescript
// Future: Sentry integration
import * as Sentry from '@sentry/nextjs'

Sentry.captureException(error)
```

## Scalability Considerations

### Current Limits
- Vercel: 100GB bandwidth/month (Hobby)
- Database: Varies by provider (typically 500MB-1GB free tier)
- GitHub API: 5,000 requests/hour

### Scaling Strategy

#### Database
- Upgrade database plan
- Add read replicas (if supported)
- Implement caching layer with Redis

#### API
- Add rate limiting
- Implement request queuing
- Use background jobs for heavy operations

#### Storage
- Move avatars to CDN
- Compress images
- Use lazy loading

## Future Architecture

### Microservices
```
┌─────────────┐
│   Next.js   │
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│     API Gateway         │
└──────┬──────────────────┘
       │
       ├─────────────┬─────────────┬─────────────┐
       ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   Auth   │  │   Sync   │  │Portfolio │  │Analytics │
│ Service  │  │ Service  │  │ Service  │  │ Service  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Message Queue
```typescript
// For async operations
import { Queue } from 'bullmq'

const syncQueue = new Queue('repo-sync')

// Add job
await syncQueue.add('sync', { userId, repos })

// Process job
syncQueue.process(async (job) => {
  await syncRepos(job.data)
})
```

### Caching Layer
```typescript
// Redis for caching
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Cache portfolio data
await redis.set(`portfolio:${username}`, data, { ex: 3600 })
```

## Development Workflow

### Local Development
```bash
# Start dev server
npm run dev

# Run Prisma Studio
npm run db:studio

# Generate Prisma client
npm run db:generate

# Create migration
npm run db:migrate
```

### Testing
```bash
# Unit tests (future)
npm test

# E2E tests (future)
npm run test:e2e

# Type checking
npm run type-check
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format

# Build check
npm run build
```

## Documentation

### Code Documentation
- JSDoc comments for functions
- README for each major component
- API documentation (future)

### User Documentation
- QUICKSTART.md - Getting started
- DEPLOYMENT.md - Deployment guide
- TESTING.md - Testing guide
- ROADMAP.md - Feature roadmap

## Conclusion

This architecture provides:
- ✅ Scalability for growth
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Easy maintenance
- ✅ Clear separation of concerns
- ✅ Future-proof design
