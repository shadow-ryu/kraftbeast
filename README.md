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

## Run Locally

Follow these steps to get KraftBeast running on your local machine.

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** (Local or Cloud like Neon/Supabase)
- **Clerk Account** (for authentication)
- **GitHub Account** (to create a GitHub App)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd kraftbeast
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the required values:

- **Database**: `DATABASE_URL`
- **Clerk**: Keys from your Clerk Dashboard
- **GitHub App**: App ID, Client ID, Client Secret, Private Key, Webhook Secret
- **Inngest** (Optional for local): `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- **App URL**: `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### 3. Database Setup

Initialize your database schema:

```bash
npm run db:migrate
npm run db:generate
```

### 4. Start Development Server

Run the Next.js development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 5. Start Inngest (Background Jobs)

To test background jobs (like repo syncing) locally, open a new terminal and run:

```bash
npx inngest-cli@latest dev
```

Open the Inngest dashboard at [http://localhost:8288](http://localhost:8288) to trigger and view events.

## Deployment

### 1. Database

Provision a PostgreSQL database using a provider like **Neon**, **Supabase**, or **Railway**. Get the connection string.

### 2. Vercel Deployment

1.  Push your code to a GitHub repository.
2.  Import the project into **Vercel**.
3.  In the **Environment Variables** section, add all variables from your `.env.local`.
    *   **Important**: Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://kraftbeast.com`).
4.  Deploy.

### 3. Webhooks Configuration

Update your third-party services to point to your production URL.

#### Clerk Webhook
- **URL**: `https://<your-domain>/api/webhook/clerk`
- **Events**: `user.created`, `user.updated`

#### GitHub App Webhook
- **URL**: `https://<your-domain>/api/webhook/github`
- **Events**: `push`, `repository`

### 4. Inngest Setup (Production)

1.  Create an account on [Inngest](https://inngest.com).
2.  Connect your Vercel project to Inngest (or manually add `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` to Vercel env vars).
3.  Deploy your application. Inngest will automatically detect your functions.

### 5. Cron Jobs

KraftBeast uses Vercel Cron for scheduled syncing. This is configured in `vercel.json` and will be automatically picked up by Vercel upon deployment.

## Configuration

### Contact Form Setup

KraftBeast supports per-user Resend API key management with user-bound encryption:

#### For Hosted Users (Recommended)
Each user provides their own Resend API key for email forwarding:

1. Get your Resend API key from [resend.com/api-keys](https://resend.com/api-keys) (100 emails/day free)
2. Go to Dashboard → Settings → Contact Form
3. Enter your key and save
4. Your key is encrypted with AES-256-GCM using your unique user identifiers
5. Once active, the "Contact Me" section will appear on your public portfolio

**Security Features:**
- Keys are encrypted at rest using AES-256-GCM with user-bound encryption
- Each user's key is encrypted using their unique userId and clerkId
- Decrypted only at runtime when sending emails
- Never returned to frontend once stored
- No shared encryption secret required - each user's key is unique

#### For Self-Hosted (Legacy)
Set a global `RESEND_API_KEY` in your environment variables. This will be used for all users if they haven't configured their own key.

**Environment Variables:**
```bash
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

*Refer to the [Run Locally](#run-locally) and [Deployment](#deployment) sections for database setup instructions.*

## Useful Commands

```bash
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
