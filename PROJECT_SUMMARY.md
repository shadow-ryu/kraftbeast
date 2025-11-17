# KraftBeast - Project Summary

## Overview

**KraftBeast** is a SaaS platform that automatically builds and maintains developer portfolios by syncing with GitHub. Every push to GitHub updates your portfolio in real-time, eliminating the need for manual portfolio maintenance.

**Tagline:** *Your portfolio updates itself — so you can too.*

---

## Core Features

### 🔐 Authentication & User Management
- **GitHub OAuth via Clerk** - Secure authentication with GitHub
- **GitHub App Integration** - Read-only access to repositories (no write permissions)
- **User Profiles** - Customizable profile with bio, social links, and work history
- **Public Portfolio Pages** - Each user gets a unique URL: `kraftbeast.com/[username]`

### 📦 Repository Management
- **Automatic Repo Syncing** - Syncs all repositories from GitHub (public & private)
- **Manual Sync Button** - Users can trigger sync anytime from dashboard
- **Automated Cron Job** - Syncs all users' repos every 6 hours automatically
- **Repository Visibility Control** - Show/hide specific repos on public portfolio
- **Fork Detection** - Identifies and badges forked repositories
- **Private Repo Support** - Private repos visible only to portfolio owner
- **Language Detection** - Automatically detects and displays programming languages used
- **Multi-Language Support** - Shows all languages used in each repository with percentages

### 📊 Repository Details
- **Stars Count** - Display GitHub stars for each repository
- **Commit Count** - Shows total commits per repository
- **Last Updated** - Displays when repo was last pushed
- **Repository Description** - Syncs and displays repo descriptions
- **README Viewer** - View repository README files directly on portfolio
- **File Browser** - Browse repository files and folders for private repos
- **Syntax Highlighting** - Code files displayed with proper syntax highlighting

### 💼 Professional Profile Features
- **Work History Manager** - Add, edit, and reorder work experience
  - Job title, company, date range
  - Bullet points for responsibilities/achievements
  - Drag-and-drop reordering
- **Bio Section** - Personal introduction on portfolio
- **Social Links Integration**:
  - GitHub (automatic)
  - Twitter/X handle
  - LinkedIn profile URL
- **Contact Form** - Visitors can send messages via email forwarding
- **Email Forwarding** - Messages forwarded to user's preferred email

### 📈 Analytics & Tracking
- **Portfolio Visit Counter** - Tracks total portfolio page views
- **Activity Timeline** - Shows recent commit activity across all repos
- **Timeline Date Range Control** - Customize which commits appear (7/30/90 days or custom range)
- **Timeline Entry Management** - Hide specific commits from public view
- **Repository Stats** - Total repos, stars, and commits displayed

### 🎨 User Experience
- **Dark Mode Support** - Full light/dark theme toggle
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Loading Skeletons** - Page-specific loading states for better UX
- **Theme-Aware Components** - All UI elements adapt to light/dark mode
- **Clean, Modern UI** - Built with Tailwind CSS and shadcn/ui components

### ⚙️ Settings & Customization
- **Repository Visibility Settings** - Control which repos appear publicly
- **Default Repo View** - Choose default tab for private repos (README/Files/Description)
- **Timeline Range Settings** - Configure activity timeline date range
- **Social Media Settings** - Manage Twitter and LinkedIn links
- **Email Settings** - Configure contact form forwarding

### 🔄 Real-Time Updates
- **GitHub Webhooks** - Automatic updates when you push to GitHub
- **Webhook Verification** - Secure webhook signature validation
- **Push Event Handling** - Updates repo metadata on every push
- **Repository Event Handling** - Syncs when repos are created/deleted/updated

### 🔒 Security & Privacy
- **Read-Only GitHub Access** - App only reads data, never writes
- **Private Repo Protection** - Private repos only visible to owner
- **Secure Webhooks** - Signature verification for all webhook events
- **Environment Variables** - Sensitive data stored securely
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **XSS Protection** - React automatically escapes user input

### 🚀 Performance & Scalability
- **Server-Side Rendering** - Fast initial page loads with Next.js RSC
- **Database Optimization** - Indexed queries for fast data retrieval
- **Efficient Syncing** - Pagination support for large repo collections
- **Connection Pooling** - Prisma manages database connections efficiently
- **Edge Network** - Deployed on Vercel's global edge network

---

## Technical Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database (Supabase/Railway/Neon)

### Authentication & APIs
- **Clerk** - Authentication and user management
- **GitHub API** - Repository data fetching
- **GitHub App** - Secure, read-only repo access
- **GitHub Webhooks** - Real-time push notifications

### Deployment
- **Vercel** - Hosting and serverless functions
- **Vercel Cron** - Scheduled background jobs
- **Automatic HTTPS** - SSL certificates included
- **Preview Deployments** - Test changes before production

---

## User Journey

### 1. Sign Up
1. User clicks "Get Started" on landing page
2. Authenticates with GitHub via Clerk
3. Redirected to dashboard

### 2. Connect GitHub
1. Install KraftBeast GitHub App
2. Grant read-only access to repositories
3. App syncs all repos automatically

### 3. Customize Profile
1. Edit profile: name, bio, social links
2. Add work history with bullet points
3. Configure email forwarding for contact form
4. Set repository visibility preferences

### 4. Share Portfolio
1. Get unique portfolio URL: `kraftbeast.com/[username]`
2. Share with employers, clients, or community
3. Portfolio updates automatically with every GitHub push

### 5. Manage Content
1. Hide/show specific repositories
2. Reorder work history entries
3. Customize timeline date range
4. View analytics (visits, stars, commits)

---

## Key Differentiators

### ✅ Fully Automatic
- No manual updates required
- Syncs every 6 hours automatically
- Real-time updates via webhooks

### ✅ Private Repo Support
- Show private repos on your portfolio
- Only you can see the details
- README and file browsing included

### ✅ Professional Features
- Work history management
- Contact form with email forwarding
- Activity timeline
- Social media integration

### ✅ Developer-Friendly
- Clean, minimal design
- Fast loading times
- Dark mode support
- Mobile responsive

### ✅ Zero Maintenance
- Set it once, forget it
- Automatic syncing
- No rebuilds needed
- Always up-to-date

---

## Database Schema

### User Model
- Profile information (name, bio, avatar)
- GitHub connection (handle, installation ID)
- Social links (Twitter, LinkedIn)
- Settings (email forwarding, default views, timeline range)
- Analytics (visit count)

### Repository Model
- GitHub metadata (name, description, URL)
- Stats (stars, commits, last pushed)
- Languages (detected programming languages)
- Visibility settings (public/private, visible/hidden)
- Fork detection

### Work History Model
- Job details (title, company, dates)
- Bullet points for achievements
- Ordering for display

### Timeline Model
- Commit activity tracking
- Timestamp and message
- Visibility control (show/hide)
- Date range filtering

---

## API Endpoints

### Public Routes
- `GET /` - Landing page
- `GET /[username]` - Public portfolio page
- `POST /api/contact` - Contact form submission

### Protected Routes (Require Auth)
- `GET /dashboard` - User dashboard
- `GET /dashboard/profile` - Profile editor
- `GET /dashboard/settings` - Settings page
- `POST /api/github/sync-app` - Manual repo sync
- `PATCH /api/repos/[id]/visibility` - Toggle repo visibility
- `POST /api/work-history` - Create work history entry
- `PATCH /api/work-history/[id]` - Update work history entry
- `DELETE /api/work-history/[id]` - Delete work history entry
- `PATCH /api/timeline/[id]/hide` - Hide timeline entry
- `PATCH /api/user/settings` - Update user settings

### Webhook Routes
- `POST /api/webhook/github` - GitHub push/repo events
- `POST /api/webhook/clerk` - User lifecycle events

### Cron Routes
- `GET /api/cron/sync-repos` - Automated repo sync (every 6 hours)

---

## Deployment & Configuration

### Environment Variables Required
```
DATABASE_URL                      # PostgreSQL connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY # Clerk public key
CLERK_SECRET_KEY                  # Clerk secret key
CLERK_WEBHOOK_SECRET              # Clerk webhook signing secret
GITHUB_WEBHOOK_SECRET             # GitHub webhook signing secret
GITHUB_APP_ID                     # GitHub App ID
GITHUB_APP_PRIVATE_KEY            # GitHub App private key
GITHUB_APP_CLIENT_ID              # GitHub App OAuth client ID
GITHUB_APP_CLIENT_SECRET          # GitHub App OAuth client secret
CRON_SECRET                       # Cron job authentication secret
NEXT_PUBLIC_APP_URL               # Application base URL
RESEND_API_KEY                    # Email service API key (for contact form)
```

### Webhooks Setup
1. **Clerk Webhook**: `https://your-domain.com/api/webhook/clerk`
   - Events: `user.created`, `user.updated`
2. **GitHub Webhook**: `https://your-domain.com/api/webhook/github`
   - Events: `push`, `repository`

### Cron Job
- Runs every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- Syncs all users with GitHub App installed
- Configured in `vercel.json`

---

## Future Roadmap

### Planned Features
- [ ] Custom domains for portfolios
- [ ] Advanced analytics dashboard
- [ ] Project pinning (highlight specific repos)
- [ ] README parsing for better project cards
- [ ] Blog integration
- [ ] Premium themes and layouts
- [ ] Team portfolios
- [ ] Export portfolio as PDF
- [ ] Integration with other platforms:
  - [ ] Dribbble (design work)
  - [ ] Instagram (visual content)
  - [ ] Gumroad (digital products)
  - [ ] Dev.to (blog posts)

### Potential Enhancements
- [ ] AI-generated project descriptions
- [ ] Contribution graph visualization
- [ ] Skills extraction from code
- [ ] Automated README generation
- [ ] Portfolio templates
- [ ] SEO optimization tools
- [ ] Social media sharing cards
- [ ] Portfolio comparison tools

---

## Success Metrics

### User Engagement
- % of users connecting GitHub App
- Average repos per user
- Portfolio visit counts
- Contact form submissions

### Technical Performance
- API response times
- Webhook success rate
- Cron job execution success
- Database query performance

### Growth Indicators
- New user signups
- Active users (monthly)
- Portfolio shares
- Returning visitors

---

## Conclusion

KraftBeast solves the problem of portfolio maintenance for developers by automating the entire process. With GitHub App integration, real-time webhooks, and scheduled syncing, portfolios stay up-to-date without any manual effort. The platform combines professional features (work history, contact forms, social links) with developer-friendly design (dark mode, clean UI, fast performance) to create the ultimate automated portfolio solution.

**Built with:** Next.js 15, TypeScript, Prisma, PostgreSQL, Clerk, GitHub API, Vercel
**Status:** Production-ready with active development
**License:** MIT
