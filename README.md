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

- ✅ GitHub OAuth authentication
- ✅ Automatic repo syncing
- ✅ Real-time webhook updates
- ✅ Public portfolio pages
- ✅ Visit tracking
- ✅ Clean, minimal UI inspired by IndiePage

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
- `DATABASE_URL`: Your PostgreSQL connection string (Supabase, Railway, Neon, etc.)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `CLERK_WEBHOOK_SECRET`: Clerk webhook secret
- `GITHUB_WEBHOOK_SECRET`: GitHub webhook secret

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

**Option 1: Supabase (Recommended)**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Copy the connection string (URI format)
4. Add to `DATABASE_URL` in `.env.local`

**Option 2: Railway**
1. Create a project at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy connection string

**Option 3: Neon**
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

## Roadmap

- [ ] Dribbble integration
- [ ] Instagram integration
- [ ] Gumroad integration
- [ ] Custom domains
- [ ] Analytics dashboard
- [ ] Premium themes
- [ ] Project pinning
- [ ] README parsing

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
