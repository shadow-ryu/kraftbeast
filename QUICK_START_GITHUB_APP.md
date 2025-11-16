# Quick Start: GitHub App Setup

Get your GitHub App running in 30 minutes.

## Prerequisites

- [ ] GitHub account
- [ ] KraftBeast codebase
- [ ] Database access
- [ ] Production deployment ready

## Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

## Step 2: Run Database Migration (1 minute)

```bash
npx prisma migrate deploy
npx prisma generate
```

## Step 3: Register GitHub App (10 minutes)

1. Go to https://github.com/settings/apps
2. Click "New GitHub App"
3. Fill in:
   - **Name**: `kraftbeast` (or your choice)
   - **Homepage**: `https://yourdomain.com`
   - **Callback**: `https://yourdomain.com/api/auth/github/app/callback`
   - **Webhook**: `https://yourdomain.com/api/webhook/github`
   - **Webhook secret**: Run `openssl rand -hex 32`

4. Set permissions:
   - **Contents**: Read-only ✓
   - **Metadata**: Read-only ✓
   - **Email**: Read-only ✓

5. Subscribe to events:
   - Push ✓
   - Repository ✓
   - Installation ✓

6. Click "Create GitHub App"

7. Save these values:
   - App ID
   - Client ID
   - Generate Client Secret (save it!)
   - Generate Private Key (download .pem file)

## Step 4: Configure Environment (5 minutes)

### Convert Private Key

```bash
# Option 1: Using awk
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' your-app.private-key.pem

# Option 2: Manual
# Open .pem file, replace newlines with \n
```

### Update .env

```bash
# Add to .env
GITHUB_APP_ID=123456
GITHUB_APP_NAME=kraftbeast
GITHUB_APP_CLIENT_ID=Iv1.abc123def456
GITHUB_APP_CLIENT_SECRET=ghp_abc123...
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

## Step 5: Test Locally (5 minutes)

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000/dashboard
# Click "Install GitHub App"
# Complete installation
# Click "Sync Repos"
# Verify repos appear
```

## Step 6: Deploy to Production (5 minutes)

```bash
# Commit changes
git add .
git commit -m "Add GitHub App support"
git push

# Deploy (example for Vercel)
vercel --prod

# Or use your deployment method
```

## Step 7: Configure Production (2 minutes)

Add environment variables to your hosting platform:

**Vercel:**
- Project Settings → Environment Variables
- Add all GITHUB_APP_* variables

**Heroku:**
```bash
heroku config:set GITHUB_APP_ID=123456
heroku config:set GITHUB_APP_CLIENT_ID=Iv1.abc123...
# ... etc
```

**Railway:**
- Variables tab → Add variables

## Step 8: Test Production (5 minutes)

1. Visit your production dashboard
2. Click "Install GitHub App"
3. Complete installation
4. Sync repos
5. Push to a repo
6. Verify webhook triggers
7. Check timeline updates

## Verification Checklist

- [ ] GitHub App created
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Local testing passed
- [ ] Production deployed
- [ ] Production testing passed
- [ ] Webhooks working
- [ ] Read-only verified

## Common Issues

### "Invalid JWT"
**Fix**: Check private key format, ensure `\n` for newlines

### "Installation not found"
**Fix**: User needs to install the app first

### Webhooks not working
**Fix**: Verify webhook URL is publicly accessible

### TypeScript errors
**Fix**: Restart TypeScript server in your IDE

## Next Steps

1. **Monitor**: Check webhook deliveries on GitHub
2. **Migrate**: Existing OAuth users will see migration banner
3. **Support**: Help users with installation
4. **Document**: Update your user documentation

## Resources

- Full guide: `GITHUB_APP_SETUP_STEPS.md`
- Environment setup: `GITHUB_APP_ENV_SETUP.md`
- Migration guide: `GITHUB_APP_MIGRATION.md`
- Checklist: `MIGRATION_CHECKLIST.md`

## Support

Need help?
- Check documentation files
- Review GitHub Apps docs: https://docs.github.com/en/apps
- Test with fresh account
- Verify environment variables

---

**Estimated time**: 30 minutes
**Difficulty**: Medium
**Status**: Ready to deploy
