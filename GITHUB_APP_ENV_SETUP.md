# GitHub App Environment Variables Setup

Quick reference for setting up GitHub App environment variables.

## Required Environment Variables

```bash
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_NAME=kraftbeast
GITHUB_APP_CLIENT_ID=Iv1.abc123def456
GITHUB_APP_CLIENT_SECRET=ghp_abc123def456...
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
```

## Where to Find These Values

### 1. GITHUB_APP_ID
- Location: GitHub App settings page (top of page)
- Example: `123456`
- Format: Numeric ID

### 2. GITHUB_APP_NAME
- Location: GitHub App settings → "GitHub App name"
- Example: `kraftbeast`
- Format: Lowercase, no spaces (use hyphens)
- Used in: Installation URL

### 3. GITHUB_APP_CLIENT_ID
- Location: GitHub App settings → "Client ID"
- Example: `Iv1.abc123def456`
- Format: Starts with `Iv1.`

### 4. GITHUB_APP_CLIENT_SECRET
- Location: GitHub App settings → "Client secrets" → "Generate a new client secret"
- Example: `ghp_abc123def456...`
- ⚠️ **Important**: Copy immediately! You won't see it again.
- Format: Starts with `ghp_` or similar prefix

### 5. GITHUB_APP_PRIVATE_KEY
- Location: GitHub App settings → "Private keys" → "Generate a private key"
- Downloads as: `your-app-name.2024-11-16.private-key.pem`
- ⚠️ **Important**: Keep this file secure!

#### Converting Private Key to Environment Variable

**Option 1: Manual Conversion**
```bash
# Open the .pem file
cat your-app-name.2024-11-16.private-key.pem

# Copy the content and replace newlines with \n
# Example:
# -----BEGIN RSA PRIVATE KEY-----
# MIIEpAIBAAKCAQEA...
# -----END RSA PRIVATE KEY-----
#
# Becomes:
# "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
```

**Option 2: Using awk (macOS/Linux)**
```bash
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' your-app-name.2024-11-16.private-key.pem
```

**Option 3: Using sed (macOS/Linux)**
```bash
sed ':a;N;$!ba;s/\n/\\n/g' your-app-name.2024-11-16.private-key.pem
```

**Result Format:**
```bash
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
```

### 6. GITHUB_WEBHOOK_SECRET
- Location: GitHub App settings → "Webhook secret"
- Generate using:
  ```bash
  openssl rand -hex 32
  ```
- Example: `a1b2c3d4e5f6...`
- Format: Random hex string (64 characters recommended)

## Platform-Specific Setup

### Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable:
   - Name: `GITHUB_APP_ID`
   - Value: `123456`
   - Environment: Production, Preview, Development
3. For private key:
   - Use the converted single-line format
   - Include the quotes in the value

### Heroku
```bash
heroku config:set GITHUB_APP_ID=123456
heroku config:set GITHUB_APP_NAME=kraftbeast
heroku config:set GITHUB_APP_CLIENT_ID=Iv1.abc123def456
heroku config:set GITHUB_APP_CLIENT_SECRET=ghp_abc123def456...
heroku config:set GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
heroku config:set GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

### Railway
1. Go to Variables tab
2. Click "New Variable"
3. Add each variable
4. For private key, use RAW editor mode

### Docker
```dockerfile
# In docker-compose.yml
environment:
  - GITHUB_APP_ID=123456
  - GITHUB_APP_NAME=kraftbeast
  - GITHUB_APP_CLIENT_ID=Iv1.abc123def456
  - GITHUB_APP_CLIENT_SECRET=ghp_abc123def456...
  - GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
  - GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

### AWS (Secrets Manager)
```bash
# Store private key as a secret
aws secretsmanager create-secret \
  --name kraftbeast/github-app-private-key \
  --secret-string file://your-app-name.2024-11-16.private-key.pem

# Reference in your app
GITHUB_APP_PRIVATE_KEY=$(aws secretsmanager get-secret-value \
  --secret-id kraftbeast/github-app-private-key \
  --query SecretString \
  --output text)
```

## Validation

### Test Your Configuration

```bash
# Test that environment variables are set
node -e "console.log(process.env.GITHUB_APP_ID)"
node -e "console.log(process.env.GITHUB_APP_CLIENT_ID)"
node -e "console.log(process.env.GITHUB_APP_PRIVATE_KEY ? 'Private key set' : 'Private key missing')"
```

### Test JWT Generation

```javascript
// test-github-app.js
const jwt = require('jsonwebtoken');

const appId = process.env.GITHUB_APP_ID;
const privateKey = process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');

const now = Math.floor(Date.now() / 1000);
const payload = {
  iat: now - 60,
  exp: now + 600,
  iss: appId,
};

try {
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  console.log('✅ JWT generated successfully');
  console.log('Token:', token.substring(0, 50) + '...');
} catch (error) {
  console.error('❌ JWT generation failed:', error.message);
}
```

Run:
```bash
node test-github-app.js
```

## Security Best Practices

### ✅ DO
- Store private key in environment variables or secrets manager
- Use different secrets for development and production
- Rotate secrets regularly (every 90 days)
- Use HTTPS for all webhook endpoints
- Verify webhook signatures
- Keep private key file secure (chmod 600)
- Add `.pem` files to `.gitignore`

### ❌ DON'T
- Commit private keys to version control
- Share private keys via email or chat
- Use the same secrets across environments
- Store secrets in code or config files
- Expose secrets in logs or error messages
- Use weak webhook secrets

## Troubleshooting

### "Invalid JWT"
- Check that private key is correctly formatted
- Ensure newlines are properly escaped (`\n`)
- Verify App ID matches your GitHub App
- Check that private key hasn't expired or been revoked

### "Invalid signature"
- Verify webhook secret matches GitHub App settings
- Check that secret is the same in both places
- Ensure you're using SHA-256 for signature verification

### "Installation not found"
- Verify user has installed the GitHub App
- Check that installation ID is stored in database
- Ensure user granted access to repositories

### Private Key Format Issues

**Wrong:**
```bash
# Missing quotes
GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nMIIE...

# Actual newlines instead of \n
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIE...
-----END RSA PRIVATE KEY-----"
```

**Correct:**
```bash
# Single line with \n and quotes
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
```

## Quick Setup Checklist

- [ ] Register GitHub App on GitHub
- [ ] Generate client secret
- [ ] Generate private key
- [ ] Generate webhook secret
- [ ] Convert private key to single-line format
- [ ] Add all variables to `.env` file
- [ ] Add all variables to production environment
- [ ] Test JWT generation
- [ ] Test installation flow
- [ ] Test webhook delivery
- [ ] Verify read-only access

## Example .env File

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kraftbeast"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# GitHub App (Production)
GITHUB_APP_ID=123456
GITHUB_APP_NAME=kraftbeast
GITHUB_APP_CLIENT_ID=Iv1.abc123def456
GITHUB_APP_CLIENT_SECRET=ghp_abc123def456...
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6...

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Resend
RESEND_API_KEY=re_...
```

## Need Help?

- GitHub Apps Documentation: https://docs.github.com/en/apps
- JWT Debugger: https://jwt.io
- Webhook Testing: https://webhook.site
- ngrok (for local testing): https://ngrok.com
