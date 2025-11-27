# KraftBeast 🦁

**Your portfolio updates itself — so you can too.**

A simple SaaS that builds and updates your developer portfolio automatically — every time you push to GitHub.

## Problem

Developers hate maintaining portfolios. They build cool stuff, but never show it off because updating personal sites is annoying, repetitive, and time-consuming.

## Solution

Hook your GitHub once → every push auto-creates a project card on your portfolio. No rebuilding, no design, no friction.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (can use Supabase, Railway, Neon, etc.)
- **ORM**: Prisma
- **Auth**: Clerk (GitHub OAuth)
- **Hosting**: Vercel
- **Integrations**: GitHub API + Webhooks

## Features

### Core Features
- ✅ **GitHub App Integration** - Read-only access with automatic syncing
- ✅ **Real-time Updates** - Webhooks keep your portfolio current
- ✅ **Private Repo Support** - Showcase private work with README & file browser
- ✅ **Public Portfolio Pages** - Beautiful, SEO-friendly URLs
- ✅ **Dark Mode** - Smooth theme transitions

### Portfolio Experience
- ✅ **Pinned Projects** - Highlight your best work
- ✅ **Activity Timeline** - Show recent commits with date filtering
- ✅ **Work History** - Professional experience with drag-and-drop ordering
- ✅ **Contact Form** - Let visitors reach out directly
- ✅ **Social Links** - Connect GitHub, Twitter, LinkedIn

### Customization
- ✅ **Accent Color Picker** - Personalize with your brand color
- ✅ **Repository Visibility** - Control what's public
- ✅ **Default Views** - Choose README, Files, or Description
- ✅ **Timeline Range** - Filter commits by date (7/30/90 days or custom)

### Analytics & Insights
- ✅ **Portfolio Visits** - Track profile views
- ✅ **Project Views** - See which repos get attention
- ✅ **Top Projects** - Identify your most popular work
- ✅ **Sync Activity Log** - Monitor sync operations
- ✅ **Sync Status** - Know when your portfolio was last updated

### Privacy & Security
- ✅ **Read-only Access** - Never writes to your repositories
- ✅ **Webhook Verification** - Secure signature validation
- ✅ **Data Export** - Download all your data (GDPR compliant)
- ✅ **Private Repo Protection** - Content only visible when logged in
- ✅ **Encrypted API Keys** - Per-user Resend keys stored with AES-256-GCM encryption

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Clerk account
- GitHub OAuth app

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd kraftbeast
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```
  Fill in your credentials:
  DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
  CLERK_SECRET_KEY=your_clerk_secret_key
  CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
  GITHUB_APP_ID=your_github_app_id
  GITHUB_APP_NAME=kraftbeast
  GITHUB_APP_CLIENT_ID=your_github_app_client_id
  GITHUB_APP_CLIENT_SECRET=your_github_app_client_secret
  GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nyour_private_key_here\n-----END RSA PRIVATE KEY-----"
  GITHUB_WEBHOOK_SECRET=your_webhook_secret
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  RESEND_API_KEY=re_your_api_key_here
  
  # Inngest (Background Jobs) - Optional for local dev
  INNGEST_EVENT_KEY=your_inngest_event_key_here
  INNGEST_SIGNING_KEY=your_inngest_signing_key_here

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  avatarUrl    String?
  githubHandle String?  @unique
  repos        Repo[]
  visits       Int      @default(0)
}

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
  user        User     @relation(fields: [userId], references: [id])
}
```

## Routes

- `/` - Landing page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/dashboard` - User dashboard (protected)
- `/[username]` - Public portfolio page
- `/api/github/sync` - Sync GitHub repos
- `/api/github/repos` - Fetch GitHub repos
- `/api/webhook/github` - GitHub webhook handler
- `/api/webhook/clerk` - Clerk webhook handler

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Webhooks Setup

#### Clerk Webhook
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/clerk`
3. Subscribe to: `user.created`, `user.updated`
4. Copy signing secret to `CLERK_WEBHOOK_SECRET`

#### GitHub Webhook
1. Go to GitHub → Settings → Webhooks
2. Add webhook: `https://your-domain.com/api/webhook/github`
3. Content type: `application/json`
4. Events: `push`, `repository`
5. Add secret to `GITHUB_WEBHOOK_SECRET`

## Configuration

### Contact Form Setup

KraftBeast supports two modes for contact forms:

#### For Hosted Users (Recommended)
Each user provides their own Resend API key for email forwarding:

1. Get your Resend API key from [resend.com/api-keys](https://resend.com/api-keys) (100 emails/day free)
2. Go to Dashboard → Settings → Contact Form
3. Enter your key and save
4. Your key is encrypted with AES-256-GCM and stored securely in the database
5. Once active, the "Contact Me" section will appear on your public portfolio

**Security Features:**
- Keys are encrypted at rest using server-side AES-256-GCM
- Decrypted only at runtime when sending emails
- Never returned to frontend once stored
- Uses environment-stored `ENCRYPTION_SECRET` for consistent encryption/decryption

#### For Self-Hosted (Legacy)
Set a global `RESEND_API_KEY` in your environment variables. This will be used for all users if they haven't configured their own key.

**Environment Variables Required:**
```bash
# Encryption key for storing per-user Resend API keys
# Generate with: openssl rand -base64 32
ENCRYPTION_SECRET=your_32_byte_random_secret_here

# Optional: Global Resend key for self-hosted (legacy)
RESEND_API_KEY=re_your_api_key_here
```

### Clerk Setup

1. Create a Clerk application
2. Enable GitHub OAuth provider
3. Configure OAuth scopes: `user:email`, `read:user`, `repo`
4. Set redirect URLs:
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
   - After sign-in: `/dashboard`

### Database Setup (PostgreSQL)

You can use any PostgreSQL provider:

**Option 1: Supabase**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy the connection string (URI format)
4. Add to `DATABASE_URL` in `.env.local`

**Option 2: Railway**
1. Create a project at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy connection string

**Option 3: Neon(Recommended)**
1. Create a project at [neon.tech](https://neon.tech)
2. Copy connection string

**Option 4: Local PostgreSQL**
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
# or use Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
```

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio
npx prisma studio

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name
```

## Validation Metrics

- % of users connecting ≥1 repo
- Push events triggering card updates
- Returning visitors on portfolio pages
- Conversion to premium features

## Documentation

- 📖 [User Guide](USER_GUIDE.md) - Complete guide for users
- 🚀 [Production Features](PRODUCTION_FEATURES.md) - Feature documentation
- 🔧 [Feature Migration Guide](FEATURE_MIGRATION_GUIDE.md) - Migration instructions
- ✅ [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Production deployment guide
- 🔍 [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- 📧 [Contact Form Setup](CONTACT_FORM_SETUP.md) - Per-user Resend integration guide
- 🎉 [Implementation Complete](IMPLEMENTATION_COMPLETE.md) - Final summary
- 🏗️ [Architecture](ARCHITECTURE.md) - System architecture
- 📝 [TypeScript Fixes](TYPESCRIPT_FIXES.md) - Type-related documentation

## Roadmap

### Completed ✅
- [x] GitHub App integration
- [x] Private repo support
- [x] Project pinning
- [x] Analytics dashboard
- [x] README parsing
- [x] Activity timeline
- [x] Accent color customization
- [x] Data export

### Coming Soon 🚧
- [ ] LinkedIn OAuth integration
- [ ] Webhook retry background job
- [ ] Thumbnail upload UI
- [ ] Historical commit fetching
- [ ] Custom domains
- [ ] Advanced analytics with charts
- [ ] Team portfolios
- [ ] Blog integration

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
