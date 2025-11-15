# KraftBeast Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Account** - For PostgreSQL database
2. **Clerk Account** - For authentication
3. **GitHub Account** - For OAuth and webhooks
4. **Vercel Account** - For hosting

## Step 1: Database Setup (PostgreSQL)

Choose any PostgreSQL provider. We recommend Supabase for simplicity:

### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to provision
4. Go to Settings → Database
5. Copy the connection string (URI format)
6. Save as `DATABASE_URL`

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string from Variables tab

### Option C: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string

## Step 2: Authentication Setup (Clerk)

### Create Clerk Application

1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Choose "Next.js" as framework

### Enable GitHub OAuth

1. In Clerk Dashboard → OAuth Providers
2. Enable GitHub
3. Configure OAuth scopes:
   - `user:email`
   - `read:user`
   - `public_repo` (or `repo` for private repos)
4. Copy Client ID and Secret

### Configure Redirect URLs

1. Go to Paths in Clerk Dashboard
2. Set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

### Get API Keys

1. Go to API Keys
2. Copy:
   - Publishable Key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret Key → `CLERK_SECRET_KEY`

## Step 3: Deploy to Vercel

### Initial Deployment

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Add Environment Variables

In Vercel project settings → Environment Variables, add:

```env
# Database (PostgreSQL connection string)
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_random_secret_string

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL

## Step 4: Run Database Migrations

After first deployment:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link project:
```bash
vercel link
```

3. Run migration:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

Or use Prisma Data Platform for managed migrations.

## Step 5: Configure Webhooks

### Clerk Webhook

1. Go to Clerk Dashboard → Webhooks
2. Click "Add Endpoint"
3. Endpoint URL: `https://your-domain.vercel.app/api/webhook/clerk`
4. Subscribe to events:
   - `user.created`
   - `user.updated`
5. Copy "Signing Secret"
6. Add to Vercel env vars as `CLERK_WEBHOOK_SECRET`
7. Redeploy

### GitHub Webhook (Per User)

Users will need to set up webhooks for their repos:

1. Go to GitHub repo → Settings → Webhooks
2. Click "Add webhook"
3. Payload URL: `https://your-domain.vercel.app/api/webhook/github`
4. Content type: `application/json`
5. Secret: Use the `GITHUB_WEBHOOK_SECRET` value
6. Events: Select "Let me select individual events"
   - ✅ Pushes
   - ✅ Repositories
7. Click "Add webhook"

**Note**: For MVP, users need to manually add webhooks. Future versions can automate this via GitHub App.

## Step 6: Update Clerk URLs

1. Go back to Clerk Dashboard
2. Update OAuth redirect URLs to use your Vercel domain:
   - `https://your-domain.vercel.app/sign-in`
   - `https://your-domain.vercel.app/sign-up`
   - `https://your-domain.vercel.app/dashboard`

## Step 7: Test the Application

1. Visit your deployed URL
2. Click "Get Started"
3. Sign up with GitHub
4. Go to Dashboard
5. Click "Sync GitHub Repos"
6. Verify repos appear
7. Visit your portfolio: `https://your-domain.vercel.app/[your-github-username]`
8. Make a push to a repo
9. Verify webhook updates the portfolio

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is active and accessible
- Ensure connection pooling is enabled (Prisma handles this)

### Clerk Authentication Issues

- Verify all Clerk env vars are set
- Check OAuth scopes include required permissions
- Ensure redirect URLs match exactly

### Webhook Not Working

- Check webhook secret matches
- Verify endpoint URL is correct
- Check Vercel function logs
- Ensure webhook is active in GitHub/Clerk

### Build Failures

- Check all dependencies are installed
- Verify TypeScript has no errors
- Check Prisma schema is valid
- Run `npx prisma generate` locally

## Production Checklist

- [ ] Database migrations applied
- [ ] All environment variables set
- [ ] Clerk webhooks configured
- [ ] GitHub OAuth working
- [ ] Test user signup flow
- [ ] Test repo sync
- [ ] Test webhook updates
- [ ] Test portfolio page
- [ ] Monitor error logs
- [ ] Set up custom domain (optional)

## Monitoring

### Vercel Logs

- Go to Vercel Dashboard → Deployments
- Click on deployment → Functions
- View real-time logs

### Prisma Studio

Access database:
```bash
npx prisma studio
```

### Error Tracking

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance

## Scaling Considerations

For production at scale:

1. **Database**: Upgrade Supabase plan or use connection pooling
2. **Rate Limiting**: Add rate limiting to API routes
3. **Caching**: Implement Redis for session/data caching
4. **CDN**: Use Vercel Edge for static assets
5. **Monitoring**: Set up alerts for errors and performance

## Cost Estimates

- **Vercel**: Free tier (Hobby) or $20/mo (Pro)
- **Database**: 
  - Supabase: Free tier or $25/mo (Pro)
  - Railway: $5/mo (500MB) or $20/mo (8GB)
  - Neon: Free tier or $19/mo (Pro)
- **Clerk**: Free tier (10k MAU) or $25/mo (Pro)

Total: $0-70/month depending on usage and provider

## Support

For deployment issues:
- Check Vercel logs
- Review Prisma migrations
- Verify webhook signatures
- Test API endpoints manually

## Next Steps

After successful deployment:
1. Share your portfolio link
2. Gather user feedback
3. Monitor analytics
4. Iterate on features
5. Consider premium features
