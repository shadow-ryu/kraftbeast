# Resend Domain Setup

## Current Limitation

Resend free tier only allows sending emails to **your own email** (the one you signed up with). To send to any email address, you need to verify a domain.

## Option 1: Verify Your Domain (Production Ready)

### Steps:

1. **Go to Resend Dashboard**
   - Visit https://resend.com/domains
   - Click "Add Domain"

2. **Add Your Domain**
   - Enter your domain (e.g., `kraftbeast.com`)
   - Resend will provide DNS records

3. **Add DNS Records**
   Add these records to your domain DNS (via your domain registrar):
   ```
   Type: TXT
   Name: @
   Value: [provided by Resend]
   
   Type: MX
   Name: @
   Value: [provided by Resend]
   
   Type: TXT (DKIM)
   Name: resend._domainkey
   Value: [provided by Resend]
   ```

4. **Wait for Verification**
   - DNS propagation takes 5-60 minutes
   - Resend will verify automatically

5. **Update Your Code**
   In `src/app/api/contact/route.ts`, change:
   ```typescript
   from: 'KraftBeast <onboarding@resend.dev>'
   ```
   to:
   ```typescript
   from: 'KraftBeast <contact@yourdomain.com>'
   ```

## Option 2: Use Testing Mode (Development Only)

For testing, set the forward email to match your Resend account email:

```typescript
// In dashboard/profile, set forward email to: blackdragon4204@gmail.com
```

This allows testing without domain verification, but only sends to your own email.

## Option 3: Use Alternative Service

If you don't have a domain, consider:

### SendGrid (100 emails/day free)
```bash
npm install @sendgrid/mail
```

### Brevo (300 emails/day free)
```bash
npm install @getbrevo/brevo
```

### Mailgun (100 emails/day free)
No domain verification required for testing

## Recommended Approach

**For Development:**
- Use Resend with your own email as forward email
- Test the functionality

**For Production:**
- Verify a domain with Resend (or buy one for $10/year)
- Update the `from` address
- Now you can send to any email

## Cost

- **Resend Free Tier:** 3,000 emails/month, 100/day
- **Domain:** $10-15/year (Namecheap, Cloudflare)
- **Total:** ~$1/month for a production-ready contact form

## Current Setup

Your forward email is set to: `blackdragon4204@gmail.com`
This means all contact form submissions will go to this email.

To change it:
1. Go to `/dashboard/profile`
2. Update "Forward Email" field
3. Save

**Note:** With unverified domain, it must be `blackdragon4204@gmail.com`
