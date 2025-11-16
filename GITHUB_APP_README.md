# GitHub App Integration

KraftBeast uses a GitHub App for secure, read-only access to your repositories.

## Why GitHub App?

### Security & Trust
- ✅ **Read-only access** - We can only read your repos, never write
- ✅ **No admin rights** - We can't modify settings or permissions
- ✅ **Transparent permissions** - You see exactly what we access
- ✅ **Installation tokens** - Short-lived, scoped tokens (1 hour)

### Better Experience
- ⚡ **Automatic webhooks** - One webhook for all repos
- 🎯 **Granular control** - Choose which repos to share
- 🔄 **Easy management** - Install/uninstall anytime
- 📊 **Better rate limits** - GitHub Apps get higher API limits

## What We Access

### Repository Permissions
- **Contents**: Read-only (to read files, commits, branches)
- **Metadata**: Read-only (basic repo info like name, description)

### Account Permissions
- **Email**: Read-only (to identify your account)

### What We DON'T Access
- ❌ No write access to code
- ❌ No admin access to settings
- ❌ No access to issues or pull requests
- ❌ No access to secrets or environment variables
- ❌ No access to organization data (unless you grant it)

## Installation

### For New Users

1. Sign up at [yourdomain.com](https://yourdomain.com)
2. Go to your dashboard
3. Click "Install GitHub App"
4. Select repositories to share
5. Click "Install"
6. Your repos will automatically sync!

### For Existing Users (OAuth Migration)

If you previously connected via OAuth:

1. You'll see a migration banner on your dashboard
2. Click "Upgrade to GitHub App"
3. Complete the installation
4. Your existing data will be preserved
5. You'll now use the more secure GitHub App

## Features

### Automatic Sync
- Repos sync automatically when you install the app
- Click "Sync Repos" anytime to refresh
- Webhooks keep your timeline updated in real-time

### Real-time Updates
- Push events trigger automatic timeline updates
- New repos are detected automatically
- Deleted repos are removed from your portfolio

### Privacy Control
- Choose which repos to share during installation
- Toggle repo visibility in your dashboard
- Private repos are hidden by default

## Management

### View Your Installation
1. Go to [GitHub Settings → Installations](https://github.com/settings/installations)
2. Find "KraftBeast" in the list
3. Click "Configure"

### Add/Remove Repositories
1. Go to your installation settings (link above)
2. Under "Repository access":
   - Select "All repositories" or
   - Select "Only select repositories"
3. Choose which repos to grant access
4. Click "Save"

### Uninstall
1. Go to your installation settings
2. Scroll to "Danger zone"
3. Click "Uninstall"
4. Your data will remain in KraftBeast but won't sync

### Reinstall
1. Go to your dashboard
2. Click "Install GitHub App"
3. Complete installation again
4. Your previous data will be restored

## Webhooks

### What We Listen For
- **Push events** - Updates your timeline with new commits
- **Repository events** - Detects new/deleted repos
- **Installation events** - Tracks app install/uninstall

### Webhook Security
- All webhooks are verified with HMAC-SHA256 signatures
- Invalid signatures are rejected
- Webhook secret is stored securely

## API Usage

### How We Use the API
- Fetch repository list
- Read repository contents (for README display)
- Fetch commit history
- Read language statistics
- Get repository metadata

### What We DON'T Do
- Create, update, or delete files
- Modify repository settings
- Create issues or pull requests
- Manage collaborators or permissions
- Access private organization data (unless granted)

## Rate Limits

GitHub Apps get better rate limits:
- **5,000 requests/hour** per installation
- **15,000 requests/hour** for authenticated requests
- Separate from your personal rate limit

## Security

### Token Management
- Installation tokens expire after 1 hour
- Tokens are generated on-demand, never stored
- Private key is stored securely in environment variables
- All API calls use HTTPS

### Data Storage
- We store: repo name, description, stars, commits, languages
- We DON'T store: code, issues, pull requests, secrets
- Installation ID is stored to generate tokens
- You can delete your data anytime

### Permissions Verification
You can verify our permissions anytime:
1. Go to [GitHub Settings → Installations](https://github.com/settings/installations)
2. Click "Configure" on KraftBeast
3. Review "Permissions" section
4. Should show:
   - ✓ Read access to code
   - ✓ Read access to metadata
   - ✗ NO write access

## Troubleshooting

### "Installation not found"
**Cause**: You haven't installed the GitHub App yet

**Solution**: Click "Install GitHub App" in your dashboard

### Repos not syncing
**Cause**: App doesn't have access to those repos

**Solution**: 
1. Go to [installation settings](https://github.com/settings/installations)
2. Add the repos to your installation
3. Click "Sync Repos" in dashboard

### Webhooks not working
**Cause**: Webhook delivery failed

**Solution**:
1. Check [webhook deliveries](https://github.com/settings/installations)
2. Click "Recent Deliveries" to see errors
3. Contact support if issues persist

### "Permission denied" errors
**Cause**: Trying to access repos not in installation

**Solution**: Add the repos to your installation (see above)

## Privacy

### What We Collect
- Repository metadata (name, description, stars, etc.)
- Commit messages and timestamps
- Programming languages used
- Repository visibility (public/private)

### What We DON'T Collect
- Source code contents
- Issues or pull requests
- Comments or discussions
- Secrets or environment variables
- Personal information beyond email

### Data Retention
- Data is kept while your account is active
- Delete your account to remove all data
- Uninstalling the app stops new data collection
- Existing data remains until you delete it

## Support

### Need Help?
- Check our [documentation](https://yourdomain.com/docs)
- Email: support@yourdomain.com
- GitHub Issues: [github.com/yourorg/kraftbeast](https://github.com/yourorg/kraftbeast)

### Report Security Issues
- Email: security@yourdomain.com
- Do NOT open public issues for security concerns

## Developer Resources

### For Contributors
- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Installation Guide](./GITHUB_APP_SETUP_STEPS.md)
- [Migration Guide](./GITHUB_APP_MIGRATION.md)
- [Environment Setup](./GITHUB_APP_ENV_SETUP.md)

### API Endpoints
- Installation: `/api/auth/github/app/install`
- Callback: `/api/auth/github/app/callback`
- Sync: `/api/github/sync`
- Webhook: `/api/webhook/github`

## Comparison: OAuth vs GitHub App

| Feature | OAuth App (Old) | GitHub App (New) |
|---------|----------------|------------------|
| Permissions | Full `repo` scope | Read-only contents |
| Write Access | Yes ❌ | No ✅ |
| Webhooks | Per-repository | Centralized ✅ |
| Token Type | User token | Installation token ✅ |
| Token Expiry | Never | 1 hour ✅ |
| Rate Limits | 5,000/hour | 15,000/hour ✅ |
| Security | Good | Better ✅ |
| User Trust | Lower | Higher ✅ |

## FAQ

### Can you modify my code?
**No.** We only have read-only access. We cannot create, update, or delete any files.

### Can you see my private repos?
**Only if you grant access.** During installation, you choose which repos to share.

### Can you access my organization repos?
**Only if you grant access.** Organization owners can install the app for org repos.

### What happens if I uninstall?
Your data remains in KraftBeast but stops syncing. You can reinstall anytime.

### Can I limit access to specific repos?
**Yes!** During installation, select "Only select repositories" and choose which ones.

### How do I revoke access?
Uninstall the app from [GitHub Settings → Installations](https://github.com/settings/installations).

### Is my data secure?
Yes. We use industry-standard security practices, HTTPS, and don't store your code.

### Can I export my data?
Yes. Contact support for a data export.

### What if I have issues?
Contact support at support@yourdomain.com or check our documentation.

## Updates

### Version History
- **v2.0** (2024-11) - GitHub App with read-only permissions
- **v1.0** (2024-10) - OAuth App (deprecated)

### Changelog
- Added GitHub App support
- Implemented read-only permissions
- Added migration banner for OAuth users
- Improved webhook handling
- Enhanced security with installation tokens

---

**Last Updated**: November 2024
**Status**: ✅ Production Ready
**Security**: Read-only access only
