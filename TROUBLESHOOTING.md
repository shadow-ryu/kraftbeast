# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Unknown argument `languages`" Error

**Problem**: Prisma doesn't recognize the `languages` field after schema changes.

**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

**Why**: When you modify the Prisma schema, the TypeScript types need to be regenerated. The Next.js dev server may cache the old types.

### 2. Commits Showing 0

**Problem**: Repository commit counts are 0 after sync.

**Solution**:
1. Go to Dashboard
2. Click "Sync Repos" button
3. Wait for sync to complete (may take longer than before)
4. Commit counts should now be populated

**Why**: The sync process now fetches commit counts from GitHub. Existing repos need to be re-synced to populate this data.

### 3. TypeScript Errors After Schema Changes

**Problem**: TypeScript complains about missing properties on Prisma models.

**Solution**:
```bash
# 1. Ensure migration is applied
npx prisma migrate dev

# 2. Regenerate Prisma client
npx prisma generate

# 3. Restart TypeScript server in your IDE
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
# Kiro: The IDE should auto-detect changes

# 4. Clear build cache
rm -rf .next
```

### 4. Private Repo Modal Not Opening

**Problem**: Clicking private repos redirects to GitHub instead of opening modal.

**Checklist**:
- [ ] Verify repo has `isPrivate: true` in database
- [ ] Check browser console for JavaScript errors
- [ ] Ensure RepoCard component is being used (not old Card component)
- [ ] Verify RepoModal component is imported correctly

**Debug**:
```typescript
// In repo-card.tsx, add console.log
const handleCardClick = () => {
  console.log('Repo clicked:', repo.name, 'isPrivate:', repo.isPrivate)
  if (repo.isPrivate) {
    setIsModalOpen(true)
  } else {
    window.open(repo.url, '_blank')
  }
}
```

### 5. Languages Not Displaying

**Problem**: Only one language shows instead of all languages.

**Checklist**:
- [ ] Re-sync repos to fetch language data
- [ ] Check database: `languages` field should contain JSON
- [ ] Verify RepoCard component extracts languages correctly

**SQL Check**:
```sql
SELECT name, language, languages FROM "Repo" LIMIT 5;
```

Expected `languages` format:
```json
{
  "TypeScript": 12345,
  "JavaScript": 6789,
  "HTML": 234
}
```

### 6. README Not Loading in Modal

**Problem**: README tab shows "README not accessible".

**Possible Causes**:
1. **No README**: Repo doesn't have a README file
2. **Private Repo**: GitHub token doesn't have access
3. **Token Expired**: GitHub token needs refresh
4. **API Rate Limit**: Hit GitHub API rate limit

**Solutions**:
- Verify repo has README on GitHub
- Reconnect GitHub account in Settings
- Wait if rate limited (resets hourly)
- Check browser console for API errors

### 7. File Tree Not Loading

**Problem**: Files tab shows "File structure not accessible".

**Possible Causes**:
1. **Empty Repo**: No files in repository
2. **Private Repo**: Token doesn't have access
3. **Large Repo**: Tree API may timeout
4. **API Error**: GitHub API issue

**Solutions**:
- Verify repo has files on GitHub
- Reconnect GitHub account
- Check browser console for errors
- Try a smaller repo first

### 8. Settings Not Saving

**Problem**: Changes in Settings page don't persist.

**Debug Steps**:
1. Open browser DevTools → Network tab
2. Click "Save Settings"
3. Check for `/api/user/settings` request
4. Verify response is 200 OK
5. Check response body for errors

**Common Issues**:
- Network error (check internet connection)
- Authentication error (re-login)
- Validation error (check console)

### 9. Migration Issues

**Problem**: Database schema out of sync.

**Solution**:
```bash
# Check migration status
npx prisma migrate status

# If migrations pending
npx prisma migrate dev

# If database is corrupted
npx prisma migrate reset  # WARNING: Deletes all data!
npx prisma migrate dev
```

### 10. Dev Server Issues

**Problem**: Changes not reflecting in dev server.

**Solution**:
```bash
# Stop dev server (Ctrl+C)

# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Regenerate Prisma
npx prisma generate

# Restart dev server
npm run dev
```

## Performance Issues

### Slow Sync

**Problem**: Repo sync takes a long time.

**Why**: Now fetches languages + commits for each repo (2 extra API calls per repo).

**Expected Times**:
- 10 repos: ~5-10 seconds
- 50 repos: ~20-30 seconds
- 100 repos: ~40-60 seconds

**Optimization** (future):
- Implement parallel processing
- Cache language data
- Use GraphQL API for batch requests

### GitHub Rate Limits

**Limits**:
- Authenticated: 5,000 requests/hour
- Unauthenticated: 60 requests/hour

**Check Rate Limit**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/rate_limit
```

**If Rate Limited**:
- Wait for reset (shown in response)
- Reduce sync frequency
- Implement caching

## Getting Help

### Check Logs

**Browser Console**:
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

**Server Logs**:
- Check terminal running `npm run dev`
- Look for error messages
- Check API route logs

### Useful Commands

```bash
# Check database
npx prisma studio

# View migrations
npx prisma migrate status

# Reset database (DANGER!)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Check build
npm run build

# Lint code
npm run lint
```

### Debug Mode

Add to `.env.local`:
```
DEBUG=true
LOG_LEVEL=debug
```

Then add logging in API routes:
```typescript
if (process.env.DEBUG) {
  console.log('Debug info:', data)
}
```
