# Email Setup Guide

## Why Resend?

You **cannot** send emails directly without authentication. Email servers require credentials to prevent spam. Resend is the simplest solution:

- ✅ **100 emails/day free** (no credit card required)
- ✅ **2 minutes setup**
- ✅ **Visitor's email set as reply-to** (user can reply directly)
- ✅ **No SMTP configuration needed**

## Setup Steps

### 1. Sign Up for Resend (Free)

```
1. Go to https://resend.com
2. Sign up with GitHub or email
3. Verify your email
```

### 2. Get API Key

```
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it "KraftBeast"
4. Copy the key (starts with "re_")
```

### 3. Add to Environment Variables

Add to your `.env` file:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

### 4. Test It

```
1. Set your forward email in /dashboard/profile
2. Visit your portfolio /{username}
3. Fill out the contact form
4. Check your email!
```

## How It Works

1. **Visitor fills form** with their name, email, and message
2. **Email is sent FROM** `onboarding@resend.dev` (or your domain)
3. **Email is sent TO** the user's forward email
4. **Reply-To is set** to visitor's email
5. **User can reply directly** to the visitor

## Example Email Flow

```
Visitor: john@example.com
Portfolio Owner: you@gmail.com

Email sent:
  From: KraftBeast <onboarding@resend.dev>
  To: you@gmail.com
  Reply-To: john@example.com
  
When you hit "Reply", it goes directly to john@example.com
```

## Using Your Own Domain (Optional)

For production, you can use your own domain:

1. Add domain in Resend dashboard
2. Add DNS records (they provide them)
3. Update the `from` field in `src/app/api/contact/route.ts`:

```typescript
from: 'KraftBeast <contact@yourdomain.com>'
```

## Free Tier Limits

- 100 emails/day
- 3,000 emails/month
- No credit card required
- Perfect for portfolio contact forms

## Alternative: Gmail SMTP (Not Recommended)

If you insist on using Gmail SMTP:
- You need YOUR Gmail credentials (not visitor's)
- Must enable 2FA and create App Password
- More complex setup
- Gmail may block automated emails
- Not scalable

**Resend is the better choice for this use case.**
