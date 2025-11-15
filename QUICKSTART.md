# KraftBeast Quick Start Guide

Get KraftBeast running locally in 10 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up PostgreSQL Database

Choose any PostgreSQL provider (Supabase recommended):

**Supabase:**
1. Go to [supabase.com](https://supabase.com) and create a project
2. Copy your connection string from Settings → Database

**Railway:**
1. Go to [railway.app](https://railway.app)
2. Create project → Add PostgreSQL
3. Copy connection string

**Or use local PostgreSQL:**
```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
```

## 3. Set Up Clerk

1. Go to [clerk.com](https://clerk.com) and create an application
2. Enable GitHub OAuth provider
3. Copy your publishable and secret keys

## 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GITHUB_WEBHOOK_SECRET=any_random_string_here
```

## 5. Initialize Database

```bash
npx prisma migrate dev
npx prisma generate
```

## 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 7. Test the Flow

1. Click "Get Started"
2. Sign up with GitHub
3. Authorize the app
4. You'll be redirected to `/dashboard`
5. Click "Sync GitHub Repos"
6. Your repos will appear
7. Visit `http://localhost:3000/[your-github-username]` to see your portfolio

## Common Issues

### "GitHub not connected"

Make sure you:
1. Enabled GitHub OAuth in Clerk
2. Signed up using GitHub (not email)
3. Authorized the GitHub connection

### Database Connection Error

Check that:
1. `DATABASE_URL` is correct
2. Database is active and accessible
3. You ran `npx prisma migrate dev`

### Repos Not Syncing

Verify:
1. You're signed in
2. GitHub OAuth has correct scopes
3. Check browser console for errors

## Next Steps

- Set up webhooks for real-time updates (see DEPLOYMENT.md)
- Customize the UI in `src/app/page.tsx`
- Add more features to the dashboard
- Deploy to Vercel

## Development Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npx prisma studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Project Structure

```
kraftbeast/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── github/
│   │   │   │   ├── repos/route.ts
│   │   │   │   └── sync/route.ts
│   │   │   └── webhook/
│   │   │       ├── clerk/route.ts
│   │   │       └── github/route.ts
│   │   ├── dashboard/page.tsx
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   ├── [username]/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/ui/
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── supabase.ts
│   └── middleware.ts
├── prisma/
│   └── schema.prisma
└── .env.local
```

## Need Help?

- Check the main README.md
- Review DEPLOYMENT.md for production setup
- Open an issue on GitHub
