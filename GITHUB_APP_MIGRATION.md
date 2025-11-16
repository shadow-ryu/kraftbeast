# GitHub App Migration Guide

## Overview

This guide covers the migration from GitHub OAuth App to GitHub App for KraftBeast. The GitHub App provides better security, granular permissions, and centralized webhook management.

## Why Migrate?

### OAuth App Limitations
- Broad scopes (full `repo` access)
- Individual webhook setup per repository
- User-level tokens (less secure)
- Limited permission granularity

### GitHub App Benefits
- **Read-only access** to repository contents
- **Centralized webhooks** - one webhook for all repos
- **Installation tokens** - more secure, scoped per installation
- **Better user trust** - clear permission boundaries
- **No write/admin access** - users can trust we only read

## Step 1: Register GitHub App

1. Go to [GitHub Developer Settings](https://github.com/settings/apps)
2. Click "New GitHub App"
3. Fill in the details:

### Basic Information
- **GitHub App name**: `KraftBeast` (or your preferred name)
- **Homepage URL**: `https://yourdomain.com`
- **Callback URL**: `https://yourdomain.com/api/auth/github/app/callback`
- **Setup URL**: `https://yourdomain.com/dashboard` (optional)
- **Webhook URL**: `https://yourdomain.com/api/webhook/github`
- **Webhook secret**: Generate a secure random string

### Permissions

#### Repository Permissions
- **Contents**: Read-only (to read repo files, commits, branches)
- **Metadata**: Read-only (automatically included, for basic repo info)

#### User Permissions
- **Email addresses**: Read-only (to get user email)

### Subscribe to Events
- [x] Push
- [x] Repository (for repo created/deleted events)

### Where can this GitHub App be installed?
- Select "Any account" (so users can install on their personal or org accounts)

4. Click "Create GitHub App"
5. **Save your credentials**:
   - App ID
   - Client ID
   - Client Secret (generate one)
   - Private Key (generate and download)
   - Webhook Secret

## Step 2: Environment Variables

Update your `.env` file:

```bash
# GitHub App (replaces OAuth App)
GITHUB_APP_ID=your_app_id
GITHUB_APP_CLIENT_ID=your_client_id
GITHUB_APP_CLIENT_SECRET=your_client_secret
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Keep old OAuth for migration period (optional)
# GITHUB_CLIENT_ID=old_oauth_client_id
# GITHUB_CLIENT_SECRET=old_oauth_client_secret
```

**Important**: The private key should be stored as a single-line string with `\n` for newlines, or use a file path.

## Step 3: Database Migration

Run the Prisma migration to add GitHub App fields:

```bash
npx prisma migrate dev --name add_github_app_fields
```

This adds:
- `githubInstallationId` - The installation ID for the GitHub App
- `githubAppConnected` - Boolean flag for GitHub App connection status

## Step 4: Deploy Updated Code

1. Deploy the new API routes and webhook handler
2. Update environment variables in production
3. Test the installation flow in a staging environment first

## Step 5: User Migration

### For New Users
- They will automatically use the GitHub App installation flow
- No action needed

### For Existing Users
1. Show a banner in the dashboard encouraging migration
2. Provide a "Migrate to GitHub App" button
3. When clicked:
   - Redirect to GitHub App installation
   - After installation, mark user as migrated
   - Optionally revoke old OAuth token

### Migration UI Message
```
🔒 Security Upgrade Available!

We've upgraded to GitHub App for better security and privacy.
The new integration only requests READ access to your repositories.

Benefits:
✓ Read-only access (no write permissions)
✓ Better security with installation tokens
✓ Automatic webhook setup for all repos
✓ More granular permission control

[Upgrade to GitHub App] [Learn More]
```

## Step 6: Webhook Configuration

With GitHub App, webhooks are centralized:
- One webhook URL handles all installations
- Events are automatically sent for all repos in the installation
- No need to configure webhooks per repository

The webhook payload includes `installation.id` to identify which user/installation triggered the event.

## Step 7: Testing

### Test Installation Flow
1. Create a test GitHub account
2. Install your GitHub App
3. Verify repos sync correctly
4. Push to a repo and verify webhook triggers
5. Check timeline updates

### Test Permissions
1. Verify you can read repo contents
2. Verify you CANNOT write to repos (should fail)
3. Verify you can fetch commits and file trees

## Step 8: Deprecate OAuth App

After all users have migrated:
1. Update documentation to remove OAuth references
2. Remove OAuth API routes (or mark deprecated)
3. Remove OAuth environment variables
4. Archive the old OAuth App on GitHub

## Rollback Plan

If issues arise:
1. Keep OAuth App active during migration period
2. Add feature flag to switch between OAuth and App
3. Database supports both `githubToken` and `githubInstallationId`
4. Can revert by redirecting to old OAuth flow

## Security Notes

### Read-Only Guarantee
- GitHub App only requests `contents:read` permission
- Users can verify permissions before installing
- Installation tokens are scoped and short-lived
- No write, admin, or delete permissions requested

### Token Management
- Installation tokens expire after 1 hour
- Generate new tokens on-demand for API calls
- Never store installation tokens (only installation ID)
- Private key must be kept secure (use environment variables or secrets manager)

## Support & Troubleshooting

### Common Issues

**Installation ID not found**
- User needs to install the GitHub App first
- Check that installation was successful
- Verify `githubInstallationId` is stored in database

**Webhook not triggering**
- Verify webhook URL is accessible (not localhost)
- Check webhook secret matches
- Review GitHub App webhook delivery logs

**Permission denied errors**
- Verify app has correct permissions in GitHub settings
- Check that installation token is valid
- Ensure user granted access to the specific repository

## Resources

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Authenticating with GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app)
- [GitHub App Permissions](https://docs.github.com/en/rest/overview/permissions-required-for-github-apps)
- [Webhook Events](https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payloads)
