# Testing Guide for KraftBeast

## Manual Testing Checklist

### 1. Landing Page
- [ ] Page loads correctly
- [ ] "Get Started" button works
- [ ] "Sign In" button works
- [ ] All sections render properly
- [ ] Responsive on mobile

### 2. Authentication Flow
- [ ] Sign up with GitHub works
- [ ] GitHub OAuth authorization succeeds
- [ ] Redirects to dashboard after signup
- [ ] Sign in with existing account works
- [ ] Sign out works
- [ ] Protected routes redirect to sign-in

### 3. Dashboard
- [ ] Dashboard loads after authentication
- [ ] User info displays correctly
- [ ] Stats cards show correct data
- [ ] "Sync GitHub Repos" button works
- [ ] Repos list displays after sync
- [ ] Repo cards show correct information
- [ ] "View Portfolio" link works
- [ ] Loading states appear during sync

### 4. Portfolio Page
- [ ] Portfolio page loads at `/[username]`
- [ ] User profile displays correctly
- [ ] Repo cards render properly
- [ ] Visit counter increments
- [ ] GitHub links work
- [ ] Responsive layout works
- [ ] 404 page shows for non-existent users

### 5. API Endpoints

#### `/api/github/sync`
```bash
# Test sync endpoint (requires authentication)
curl -X POST http://localhost:3000/api/github/sync \
  -H "Cookie: __session=YOUR_SESSION_COOKIE"
```

Expected: `{ "success": true, "synced": N }`

#### `/api/github/repos`
```bash
# Test repos fetch (requires authentication)
curl http://localhost:3000/api/github/repos \
  -H "Cookie: __session=YOUR_SESSION_COOKIE"
```

Expected: `{ "repos": [...] }`

#### `/api/webhook/github`
```bash
# Test GitHub webhook
curl -X POST http://localhost:3000/api/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: sha256=YOUR_SIGNATURE" \
  -d '{
    "ref": "refs/heads/main",
    "repository": {
      "name": "test-repo",
      "description": "Test repository",
      "html_url": "https://github.com/user/test-repo",
      "stargazers_count": 5,
      "language": "JavaScript",
      "pushed_at": 1234567890,
      "private": false,
      "owner": {
        "login": "your-github-username"
      }
    },
    "commits": [
      {
        "id": "abc123",
        "message": "Test commit",
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ]
  }'
```

Expected: `{ "success": true, "message": "Repo updated" }`

#### `/api/webhook/clerk`
```bash
# Test Clerk webhook
curl -X POST http://localhost:3000/api/webhook/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_xxx" \
  -H "svix-timestamp: 1234567890" \
  -H "svix-signature: v1,xxx" \
  -d '{
    "type": "user.created",
    "data": {
      "id": "user_xxx",
      "email_addresses": [
        {
          "email_address": "test@example.com",
          "id": "email_xxx"
        }
      ],
      "first_name": "Test",
      "last_name": "User",
      "image_url": "https://example.com/avatar.jpg",
      "username": "testuser"
    }
  }'
```

Expected: `{ "success": true }`

### 6. Database Operations

#### Check User Creation
```bash
npx prisma studio
```

Verify:
- User record exists
- Email is correct
- GitHub handle is set
- Avatar URL is present

#### Check Repo Sync
After syncing, verify:
- Repos are in database
- Stars count is correct
- Last pushed date is accurate
- Language is set
- Private flag is correct

### 7. Webhook Integration

#### GitHub Webhook Test
1. Go to a test repo on GitHub
2. Settings → Webhooks → Add webhook
3. Payload URL: `https://your-domain.com/api/webhook/github`
4. Content type: `application/json`
5. Secret: Your `GITHUB_WEBHOOK_SECRET`
6. Events: Push, Repository
7. Make a commit and push
8. Check webhook delivery in GitHub
9. Verify repo updated in database

#### Clerk Webhook Test
1. Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/clerk`
3. Subscribe to: user.created, user.updated
4. Create a test user
5. Check webhook delivery in Clerk
6. Verify user created in database

## Automated Testing (Future)

### Unit Tests
```typescript
// Example test structure
describe('GitHub Sync', () => {
  it('should fetch repos from GitHub API', async () => {
    // Test implementation
  })

  it('should save repos to database', async () => {
    // Test implementation
  })

  it('should handle API errors gracefully', async () => {
    // Test implementation
  })
})
```

### Integration Tests
```typescript
describe('Portfolio Page', () => {
  it('should display user profile', async () => {
    // Test implementation
  })

  it('should show all public repos', async () => {
    // Test implementation
  })

  it('should increment visit counter', async () => {
    // Test implementation
  })
})
```

### E2E Tests (Playwright/Cypress)
```typescript
test('complete user flow', async ({ page }) => {
  // 1. Visit landing page
  await page.goto('/')
  
  // 2. Click sign up
  await page.click('text=Get Started')
  
  // 3. Authenticate with GitHub
  // ... OAuth flow
  
  // 4. Sync repos
  await page.click('text=Sync GitHub Repos')
  
  // 5. Verify repos appear
  await expect(page.locator('.repo-card')).toHaveCount(3)
  
  // 6. Visit portfolio
  await page.click('text=View Portfolio')
  
  // 7. Verify portfolio loads
  await expect(page).toHaveURL(/\/[a-z]+/)
})
```

## Performance Testing

### Lighthouse Scores
Target scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/

# Using wrk
wrk -t12 -c400 -d30s http://localhost:3000/
```

## Security Testing

### Authentication
- [ ] Protected routes require authentication
- [ ] Session tokens are secure
- [ ] OAuth flow is secure
- [ ] CSRF protection is enabled

### API Security
- [ ] Webhook signatures are verified
- [ ] Rate limiting is implemented
- [ ] Input validation is present
- [ ] SQL injection is prevented (Prisma handles this)

### Data Privacy
- [ ] Private repos are not shown on portfolio
- [ ] User emails are not exposed
- [ ] Sensitive data is not logged

## Common Issues & Solutions

### Issue: Repos not syncing
**Solution**: 
1. Check GitHub OAuth scopes
2. Verify token is valid
3. Check API rate limits
4. Review error logs

### Issue: Webhook not triggering
**Solution**:
1. Verify webhook URL is correct
2. Check webhook secret matches
3. Ensure endpoint is publicly accessible
4. Review webhook delivery logs in GitHub

### Issue: Database connection fails
**Solution**:
1. Verify DATABASE_URL is correct
2. Check Supabase project is active
3. Ensure migrations are applied
4. Test connection with `npx prisma db pull`

### Issue: Authentication fails
**Solution**:
1. Verify Clerk keys are correct
2. Check OAuth redirect URLs
3. Ensure middleware is configured
4. Review Clerk dashboard logs

## Monitoring in Production

### Key Metrics to Track
- User signups per day
- Repos synced per user
- Webhook success rate
- Portfolio page views
- API response times
- Error rates

### Logging
```typescript
// Add structured logging
console.log({
  level: 'info',
  message: 'Repo synced',
  userId: user.id,
  repoCount: repos.length,
  timestamp: new Date().toISOString()
})
```

### Alerts
Set up alerts for:
- High error rates (> 5%)
- Slow response times (> 2s)
- Failed webhook deliveries
- Database connection issues

## Testing Checklist Before Deploy

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Webhooks configured
- [ ] OAuth providers working
- [ ] All pages load correctly
- [ ] API endpoints respond
- [ ] Error handling works
- [ ] Loading states appear
- [ ] Mobile responsive
- [ ] Lighthouse scores acceptable
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Production env vars set

## Post-Deploy Verification

1. Visit production URL
2. Sign up with test account
3. Sync repos
4. View portfolio
5. Test webhook with real push
6. Check database records
7. Monitor error logs
8. Verify analytics tracking
