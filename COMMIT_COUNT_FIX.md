# Commit Count Fix

## Problem
Repositories were showing 0 commits because the sync process wasn't fetching commit counts from GitHub.

## Solution
Updated the sync endpoint to fetch commit counts for each repository using GitHub's commits API.

## Implementation

### File: `src/app/api/github/sync/route.ts`

Added commit count fetching logic:

```typescript
// Fetch commit count for this repo
let commits = 0
try {
  // Use the commits API with per_page=1 to get total count from headers
  const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`
  const commitsResponse = await fetch(commitsUrl, {
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  })
  
  if (commitsResponse.ok) {
    // GitHub returns Link header with pagination info
    const linkHeader = commitsResponse.headers.get('Link')
    if (linkHeader) {
      // Extract last page number from Link header
      const match = linkHeader.match(/page=(\d+)>; rel="last"/)
      if (match) {
        commits = parseInt(match[1], 10)
      } else {
        // If no "last" link, there's only one page
        const data = await commitsResponse.json()
        commits = data.length
      }
    } else {
      // No Link header means fewer than per_page commits
      const data = await commitsResponse.json()
      commits = data.length
    }
  }
} catch (err) {
  console.error(`Failed to fetch commits for ${repo.name}:`, err)
}
```

## How It Works

1. **Request**: Fetches commits with `per_page=1` (minimal data transfer)
2. **Link Header**: GitHub includes pagination info in the `Link` header
3. **Parse**: Extracts the last page number from the header
4. **Count**: The last page number equals the total commit count
5. **Fallback**: If no pagination, counts the returned commits

### Example Link Header
```
Link: <https://api.github.com/repos/user/repo/commits?page=2>; rel="next", 
      <https://api.github.com/repos/user/repo/commits?page=150>; rel="last"
```

In this case, the repo has 150 commits.

## Benefits

- **Accurate**: Gets exact commit count from GitHub
- **Efficient**: Only fetches 1 commit per request (minimal bandwidth)
- **Reliable**: Uses GitHub's pagination system
- **Graceful**: Falls back to 0 if API fails

## Webhook Integration

The GitHub webhook already handles commit count updates:

**File**: `src/app/api/webhook/github/route.ts`

```typescript
update: {
  // ... other fields
  commits: { increment: data.commits?.length || 1 }
}
```

When new commits are pushed:
1. Webhook receives push event
2. Increments commit count by number of commits in push
3. Updates database

## Testing

### Initial Sync
1. Go to Dashboard
2. Click "Sync Repos"
3. Wait for sync to complete
4. Check repo cards - commit counts should be populated

### Webhook Updates
1. Push commits to a synced repo
2. Webhook automatically increments count
3. Refresh dashboard to see updated count

## Performance Considerations

- Each repo requires 1 additional API call during sync
- For 100 repos, adds ~100 API calls
- GitHub rate limit: 5,000 requests/hour (authenticated)
- Sync time increases slightly but remains reasonable

## Future Improvements

1. **Caching**: Cache commit counts to reduce API calls
2. **Batch Processing**: Process repos in parallel for faster sync
3. **Incremental Updates**: Only fetch commits since last sync
4. **Background Jobs**: Move sync to background queue for large repos
