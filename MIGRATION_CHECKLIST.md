# GitHub App Migration Checklist

Use this checklist to track your migration from OAuth App to GitHub App.

## Phase 1: Preparation ✅

- [ ] Read `GITHUB_APP_MIGRATION.md`
- [ ] Read `GITHUB_APP_SETUP_STEPS.md`
- [ ] Read `GITHUB_APP_ENV_SETUP.md`
- [ ] Understand the benefits of GitHub App
- [ ] Plan migration timeline
- [ ] Notify users (optional)

## Phase 2: GitHub App Registration

- [ ] Go to https://github.com/settings/apps
- [ ] Click "New GitHub App"
- [ ] Fill in basic information:
  - [ ] App name
  - [ ] Homepage URL
  - [ ] Callback URL
  - [ ] Webhook URL
  - [ ] Webhook secret (generated)
- [ ] Set permissions:
  - [ ] Contents: Read-only ✓
  - [ ] Metadata: Read-only ✓
  - [ ] Email: Read-only ✓
  - [ ] NO write permissions ✓
- [ ] Subscribe to events:
  - [ ] Push ✓
  - [ ] Repository ✓
  - [ ] Installation ✓
  - [ ] Installation repositories ✓
- [ ] Set "Any account" for installation
- [ ] Click "Create GitHub App"
- [ ] Save App ID
- [ ] Generate and save Client Secret
- [ ] Generate and download Private Key

## Phase 3: Local Development Setup

- [ ] Install dependencies:
  ```bash
  npm install
  ```
- [ ] Convert private key to single-line format
- [ ] Update `.env` file with GitHub App credentials
- [ ] Run database migration:
  ```bash
  npx prisma migrate dev
  ```
- [ ] Verify Prisma client generated:
  ```bash
  npx prisma generate
  ```
- [ ] Restart TypeScript server (if using VS Code)
- [ ] Start development server:
  ```bash
  npm run dev
  ```

## Phase 4: Local Testing

- [ ] Test installation flow:
  - [ ] Go to http://localhost:3000/dashboard
  - [ ] Click "Install GitHub App"
  - [ ] Complete installation on GitHub
  - [ ] Verify redirect back to dashboard
  - [ ] Check success message
- [ ] Test repository sync:
  - [ ] Click "Sync Repos"
  - [ ] Verify repos appear in dashboard
  - [ ] Check repo details (stars, commits, etc.)
- [ ] Test webhook (requires ngrok or similar):
  - [ ] Set up ngrok: `ngrok http 3000`
  - [ ] Update webhook URL in GitHub App settings
  - [ ] Push to a repo
  - [ ] Verify webhook received
  - [ ] Check timeline updates
- [ ] Test read-only access:
  - [ ] Verify you can read repo contents
  - [ ] Verify write operations fail (expected)
- [ ] Test migration banner:
  - [ ] Create test user with OAuth
  - [ ] Verify banner appears
  - [ ] Test "Upgrade to App" flow

## Phase 5: Production Deployment

- [ ] Commit changes:
  ```bash
  git add .
  git commit -m "Add GitHub App support with read-only permissions"
  git push
  ```
- [ ] Update production environment variables:
  - [ ] GITHUB_APP_ID
  - [ ] GITHUB_APP_NAME
  - [ ] GITHUB_APP_CLIENT_ID
  - [ ] GITHUB_APP_CLIENT_SECRET
  - [ ] GITHUB_APP_PRIVATE_KEY
  - [ ] GITHUB_WEBHOOK_SECRET
- [ ] Run production migration:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Deploy application
- [ ] Update GitHub App webhook URL to production URL
- [ ] Verify deployment successful

## Phase 6: Production Testing

- [ ] Test installation flow in production
- [ ] Test repository sync in production
- [ ] Test webhook delivery in production
- [ ] Verify GitHub App appears in installations
- [ ] Check webhook delivery logs on GitHub
- [ ] Test with multiple users (if possible)
- [ ] Verify read-only permissions enforced

## Phase 7: User Migration

- [ ] Monitor existing OAuth users
- [ ] Verify migration banner appears for OAuth users
- [ ] Track migration adoption rate
- [ ] Send email notification (optional):
  ```
  Subject: Security Upgrade: New GitHub App Integration
  
  We've upgraded to GitHub App for better security!
  
  Benefits:
  - Read-only access (no write permissions)
  - Better security with installation tokens
  - Automatic webhook setup
  
  Action Required:
  1. Visit your dashboard
  2. Click "Upgrade to GitHub App"
  3. Complete installation
  
  Your existing data will be preserved.
  ```
- [ ] Provide support for users with issues
- [ ] Document common migration issues

## Phase 8: Monitoring (First Week)

- [ ] Monitor webhook deliveries daily
- [ ] Check for failed API calls
- [ ] Review error logs
- [ ] Track user migration rate
- [ ] Respond to user feedback
- [ ] Fix any issues discovered

## Phase 9: Monitoring (First Month)

- [ ] Weekly webhook delivery check
- [ ] Weekly error log review
- [ ] Track migration completion rate
- [ ] Gather user feedback
- [ ] Document lessons learned

## Phase 10: OAuth Deprecation (After 30 Days)

- [ ] Verify >90% users migrated to GitHub App
- [ ] Send final migration reminder to OAuth users
- [ ] Set deprecation date for OAuth
- [ ] Update documentation to remove OAuth references
- [ ] Mark OAuth routes as deprecated
- [ ] Add deprecation warnings to OAuth flow
- [ ] Plan OAuth removal date

## Phase 11: OAuth Removal (After 60 Days)

- [ ] Verify 100% critical users migrated
- [ ] Remove OAuth API routes
- [ ] Remove OAuth environment variables
- [ ] Archive OAuth App on GitHub (don't delete yet)
- [ ] Update all documentation
- [ ] Remove OAuth-related code
- [ ] Clean up database (optional):
  ```sql
  -- Remove OAuth tokens (optional, keep for rollback)
  -- UPDATE "User" SET "githubToken" = NULL WHERE "githubAppConnected" = true;
  ```

## Phase 12: Cleanup (After 90 Days)

- [ ] Delete OAuth App on GitHub
- [ ] Remove OAuth token column from database (optional)
- [ ] Archive migration documentation
- [ ] Update README with GitHub App only
- [ ] Celebrate successful migration! 🎉

## Rollback Plan (If Needed)

If critical issues arise:

- [ ] Identify the issue
- [ ] Document the problem
- [ ] Revert to OAuth flow:
  - [ ] Update environment variables
  - [ ] Redirect users to OAuth flow
  - [ ] Keep GitHub App active for testing
- [ ] Fix the issue
- [ ] Test thoroughly
- [ ] Resume migration

## Success Metrics

Track these metrics to measure migration success:

- [ ] **Installation Rate**: % of users who installed GitHub App
- [ ] **Migration Rate**: % of OAuth users who migrated
- [ ] **Webhook Success Rate**: % of webhooks delivered successfully
- [ ] **API Error Rate**: % of API calls that fail
- [ ] **User Satisfaction**: Feedback from users
- [ ] **Support Tickets**: Number of migration-related issues

## Target Metrics

- Installation Rate: >95%
- Migration Rate: >90% (after 30 days)
- Webhook Success Rate: >99%
- API Error Rate: <1%
- User Satisfaction: Positive feedback
- Support Tickets: <5% of users

## Common Issues & Solutions

### Issue: Users can't install GitHub App
**Solution**: Verify callback URL is correct and accessible

### Issue: Webhooks not triggering
**Solution**: Check webhook URL is publicly accessible and secret matches

### Issue: "Installation not found" error
**Solution**: User needs to complete installation flow

### Issue: TypeScript errors about new fields
**Solution**: Restart TypeScript server and regenerate Prisma client

### Issue: Migration banner not showing
**Solution**: Check user has OAuth token but not GitHub App

### Issue: Repos not syncing
**Solution**: Verify installation token generation and API calls

## Support Resources

- Documentation: `GITHUB_APP_MIGRATION.md`
- Setup Guide: `GITHUB_APP_SETUP_STEPS.md`
- Environment Setup: `GITHUB_APP_ENV_SETUP.md`
- Implementation Summary: `GITHUB_APP_IMPLEMENTATION_SUMMARY.md`
- GitHub Docs: https://docs.github.com/en/apps

## Notes

Use this space to track issues, decisions, and learnings:

```
Date: ___________
Issue: ___________
Solution: ___________
Notes: ___________
```

---

**Migration Started**: ___________
**Migration Completed**: ___________
**OAuth Deprecated**: ___________
**OAuth Removed**: ___________

**Status**: [ ] Not Started [ ] In Progress [ ] Completed [ ] Rolled Back
