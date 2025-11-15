# Phase 2 Migration Guide

## Database Migration

The database schema has been updated with new tables and fields. Run the migration:

```bash
npx prisma migrate deploy
```

Or for development:

```bash
npx prisma migrate dev
```

## Schema Changes

### User Table - New Fields
- `bio` (String, optional) - User's short bio
- `twitterHandle` (String, optional) - Twitter username
- `forwardEmail` (String, optional) - Email for contact form

### New Tables

**WorkHistory**
- `id` - Unique identifier
- `userId` - Foreign key to User
- `title` - Job title
- `company` - Company name
- `startDate` - Start date (string format)
- `endDate` - End date or null for current
- `bullets` - Array of bullet points
- `order` - Display order

**Timeline**
- `id` - Unique identifier
- `userId` - Foreign key to User
- `repoName` - Repository name
- `message` - Commit message
- `timestamp` - Commit timestamp

## Environment Variables

No new environment variables required. The contact form endpoint logs to console by default.

### Optional: Email Service Integration

To enable actual email sending in the contact form, integrate an email service:

**Option 1: Resend**
```bash
npm install resend
```

Add to `.env`:
```
RESEND_API_KEY=your_key_here
```

Update `src/app/api/contact/route.ts` to use Resend.

**Option 2: SendGrid, Postmark, etc.**
Follow similar pattern - install SDK and update the contact route.

## Testing the New Features

1. **Profile Setup**
   ```
   - Navigate to /dashboard/profile
   - Add a bio
   - Add Twitter handle (without @)
   - Set forward email
   - Add work history entries
   ```

2. **View Portfolio**
   ```
   - Visit /{your-github-username}
   - Verify hero section shows bio
   - Check work history appears
   - Confirm social links work
   - Test contact form (if forward email set)
   ```

3. **Timeline Population**
   ```
   - Make a commit and push to any connected repo
   - GitHub webhook will create timeline entries
   - Check portfolio to see activity timeline
   ```

## Rollback

If you need to rollback:

```bash
npx prisma migrate resolve --rolled-back 20251114195338_add_profile_features
```

Then revert to previous migration:

```bash
npx prisma migrate deploy
```

## Notes

- Existing users will have null values for new fields
- Timeline is populated going forward (not retroactive)
- Contact form requires forward email to be visible
- Work history order can be adjusted via the `order` field
