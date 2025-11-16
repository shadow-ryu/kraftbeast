# GitHub App Setup - Step by Step

This guide walks you through setting up the GitHub App for KraftBeast with **read-only** permissions.

## Prerequisites

- GitHub account with admin access
- Access to your deployment environment (for environment variables)
- Database access (for running migrations)

## Step 1: Install Dependencies

```bash
npm install jsonwebtoken @types/jsonwebtoken
```

## Step 2: Run Database Migration

Create and run the Prisma migration to add GitHub App fields:

```bash
npx prisma migrate dev --name add_github_app_fields
```

This adds:
- `githubInstallationId` (String?) - Stores the installation ID
- `githubAppConnected` (Boolean) - Tracks GitHub App connection status

## Step 3: Register GitHub App

1. Go to https://github.com/settings/apps
2. Click **"New GitHub App"**

### Basic Information

Fill in these fields:

- **GitHub App name**: `KraftBeast` (or your preferred name, must be unique)
- **Homepage URL**: `https://yourdomain.com` (your production URL)
- **Callback URL**: `https://yourdomain.com/api/auth/github/app/callback`
- **Setup URL** (optional): `https://yourdomain.com/dashboard`
- **Webhook URL**: `https://yourdomain.com/api/webhook/github`
- **Webhook secret**: Generate a secure random string (save this!)

```bash
# Generate webhook secret
openssl rand -hex 32
```

### Permissions

Set these permissions (and ONLY these):

#### Repository Permissions
- **Contents**: **Read-only** ✓ (to read repo files, commits, branches)
- **Metadata**: **Read-only** (automatically included)

#### Account Permissions
- **Email addresses**: **Read-only** ✓ (to get user email)

**Important**: Do NOT grant write, admin, or any other permissions!

### Subscribe to Events

Check these webhook events:
- ✓ **Push** (to track new commits)
- ✓ **Repository** (to track repo created/deleted)
- ✓ **Installation** (to track app installs/uninstalls)
- ✓ **Installation repositories** (to track repo access changes)

### Where can this GitHub App be installed?

Select: **Any account** (allows users to install on personal or org accounts)

### Click "Create GitHub App"

## Step 4: Generate Credentials

After creating the app:

1. **Note your App ID** (shown at the top of the page)
2. **Generate a Client Secret**:
   - Scroll to "Client secrets"
   - Click "Generate a new client secret"
   - Copy and save it immediately (you won't see it again!)
3. **Generate a Private Key**:
   - Scroll to "Private keys"
   - Click "Generate a private key"
   - A `.pem` file will download
   - Keep this file secure!

## Step 5: Configure Environment Variables

Update your `.env` file:

```bash
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_NAME=kraftbeast
GITHUB_APP_CLIENT_ID=Iv1.abc123def456
GITHUB_APP_CLIENT_SECRET=your_client_secret_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Private Key - Convert to single line with \n
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
```

### Converting Private Key

The private key needs to be a single-line string with `\n` for newlines:

**Option 1: Manual**
```bash
# Open the .pem file and replace actual newlines with \n
# Example:
# -----BEGIN RSA PRIVATE KEY-----
# MIIEpAIBAAKCAQEA...
# -----END RSA PRIVATE KEY-----
#
# Becomes:
# "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
```

**Option 2: Using awk**
```bash
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' your-app-name.2024-11-16.private-key.pem
```

## Step 6: Deploy Updated Code

1. **Commit the changes**:
```bash
git add .
git commit -m "Add GitHub App support with read-only permissions"
git push
```

2. **Update environment variables** in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Heroku: Settings → Config Vars
   - Railway: Variables tab
   - AWS/GCP: Update secrets manager

3. **Deploy**:
```bash
# If using Vercel
vercel --prod

# If using other platforms, follow their deployment process
```

## Step 7: Test the Installation

### Test with Your Account

1. Go to your dashboard: `https://yourdomain.com/dashboard`
2. Click "Install GitHub App"
3. Select repositories to grant access
4. Click "Install"
5. You should be redirected back with a success message
6. Click "Sync Repos" to test syncing

### Verify Permissions

1. Go to https://github.com/settings/installations
2. Click on your app installation
3. Verify it shows:
   - ✓ Read access to code
   - ✓ Read access to metadata
   - ✗ NO write access
   - ✗ NO admin access

### Test Webhooks

1. Push a commit to one of your repos
2. Check your webhook logs:
   - GitHub: Settings → Developer settings → GitHub Apps → Your App → Advanced → Recent Deliveries
   - Your app: Check server logs for webhook processing
3. Verify the timeline updates in your dashboard

## Step 8: Migrate Existing Users

### Show Migration Banner

The migration banner will automatically appear for users who:
- Have connected via OAuth (old method)
- Have NOT installed the GitHub App yet

### User Migration Flow

1. User sees banner: "Security Upgrade Available!"
2. User clicks "Upgrade to GitHub App"
3. User is redirected to GitHub App installation
4. After installation, user is marked as migrated
5. System uses GitHub App tokens going forward

### Manual Migration

For users who don't see the banner:

1. Go to Settings
2. Under "Integrations" → "GitHub"
3. Click "Upgrade to App"
4. Follow installation flow

## Step 9: Monitor and Verify

### Check Installation Status

```sql
-- Count users by connection type
SELECT 
  COUNT(*) FILTER (WHERE "githubAppConnected" = true) as app_users,
  COUNT(*) FILTER (WHERE "githubConnected" = true AND "githubAppConnected" = false) as oauth_users,
  COUNT(*) FILTER (WHERE "githubConnected" = false AND "githubAppConnected" = false) as no_connection
FROM "User";
```

### Monitor Webhook Deliveries

1. Go to your GitHub App settings
2. Click "Advanced" tab
3. View "Recent Deliveries"
4. Check for any failed deliveries

### Test API Calls

```bash
# Test that you can only read (not write)
# This should work:
curl -H "Authorization: Bearer $INSTALLATION_TOKEN" \
  https://api.github.com/repos/username/repo/contents/README.md

# This should fail with 403:
curl -X PUT \
  -H "Authorization: Bearer $INSTALLATION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","content":"dGVzdA=="}' \
  https://api.github.com/repos/username/repo/contents/test.txt
```

## Troubleshooting

### "Installation ID not found"

**Cause**: User hasn't installed the GitHub App yet

**Solution**: 
- User needs to click "Install GitHub App" button
- Verify installation at https://github.com/settings/installations

### "Failed to get installation token"

**Cause**: Invalid private key or App ID

**Solution**:
- Verify `GITHUB_APP_ID` matches your app
- Check private key format (must have `\n` for newlines)
- Ensure private key is wrapped in quotes

### Webhooks not triggering

**Cause**: Webhook URL not accessible or secret mismatch

**Solution**:
- Verify webhook URL is publicly accessible (not localhost)
- Check `GITHUB_WEBHOOK_SECRET` matches GitHub App settings
- Review webhook delivery logs on GitHub

### "Permission denied" errors

**Cause**: Trying to perform write operations

**Solution**:
- This is expected! The app only has read permissions
- Verify you're only calling read endpoints
- Check that you're not trying to create/update/delete resources

## Security Best Practices

1. **Never commit private keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate secrets regularly** (client secret, webhook secret)
4. **Monitor webhook deliveries** for suspicious activity
5. **Audit permissions** periodically to ensure read-only access
6. **Use HTTPS** for all webhook endpoints
7. **Validate webhook signatures** (already implemented)

## Rollback Plan

If you need to rollback:

1. **Keep OAuth routes active** during migration period
2. **Database supports both** `githubToken` and `githubInstallationId`
3. **Feature flag** to switch between OAuth and App:

```typescript
const useGitHubApp = process.env.FEATURE_GITHUB_APP === 'true'
```

4. **Revert environment variables** to OAuth credentials
5. **Users can reconnect** via OAuth flow

## Next Steps

After successful migration:

1. **Update documentation** to reflect GitHub App usage
2. **Remove OAuth routes** (or mark as deprecated)
3. **Archive OAuth App** on GitHub (don't delete immediately)
4. **Monitor for 30 days** before fully deprecating OAuth
5. **Celebrate** 🎉 - You now have read-only, secure access!

## Support

If you encounter issues:

1. Check GitHub App webhook delivery logs
2. Review server logs for errors
3. Verify environment variables are set correctly
4. Test with a fresh GitHub account
5. Consult GitHub Apps documentation: https://docs.github.com/en/apps

## Resources

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [GitHub App Permissions](https://docs.github.com/en/rest/overview/permissions-required-for-github-apps)
- [Authenticating with GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app)
- [Webhook Events](https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payloads)
