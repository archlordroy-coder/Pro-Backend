# Pro Informatique API - Deployment Guide

## Prerequisites

- Node.js 18+ (or 20 LTS recommended)
- npm 9+ or yarn
- Firebase Account with Firestore
- Vercel Account (for hosting)
- GitHub Account (for CI/CD)

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/archlordroy-coder/Pro-Backend.git
cd Pro-Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Server
PORT=3000
NODE_ENV=development

# Firebase (get from Firebase Console)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"pro-informatique",...}'

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-very-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:8000

# Logging
LOG_LEVEL=debug
```

### 4. Build TypeScript

```bash
npm run build
```

### 5. Start Development Server

```bash
npm run dev
# Or for production build:
npm start
```

Server will run on `http://localhost:3000`

### 6. Test API

```bash
# Health check
curl http://localhost:3000/health

# API Docs
open http://localhost:3000/api-docs
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project "pro-informatique"
3. Enable Firestore Database
4. Choose location (e.g., europe-west1 for EU)

### 2. Create Service Account

1. Firebase Console → Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save JSON file securely
4. Convert to single-line string for environment variable:

```bash
# Format the JSON for .env
cat firebase-key.json | jq -c . | sed 's/"/\\"/g'
```

### 3. Set Up Firestore Collections

```bash
# Collections will be auto-created on first write
# But you can manually create these for organization:
- users
- services
- products
- promotions
- reviews
- cyber_tickets
- computers
- audit_logs
```

### 4. Create Composite Indexes

In Firebase Console → Firestore → Indexes, create these composite indexes:

```
users:         (email, deletedAt)
products:      (category, deletedAt)
reviews:       (productId, rating DESC)
cyber_tickets: (status, priority DESC, userId)
services:      (category, deletedAt)
```

## JWT Secret Generation

Generate secure secrets for development and production:

```bash
# Development
openssl rand -base64 32
# Output: AbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOp

# Production (use different value)
openssl rand -base64 32
# Output: ZyXwVuTsRqPoNmLkJiHgFeDcBaAbCdEfGhIjKlMnOp
```

## Docker Setup (Optional)

If you prefer to run in Docker:

### 1. Create Dockerfile

Already exists as `Dockerfile` in project root.

### 2. Build Image

```bash
docker build -t pro-informatique-api:latest .
```

### 3. Run Container

```bash
docker run -p 3000:3000 \
  -e JWT_SECRET="your-secret" \
  -e FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' \
  pro-informatique-api:latest
```

## Vercel Deployment

### Option 1: Direct Deployment (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Connect repository to Vercel via Vercel Dashboard
3. Configure environment variables in Vercel Settings
4. Auto-deploy on push to main branch

### Option 3: GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [master, main]
  pull_request:
    branches: [master, main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_SCOPE }}
```

## Environment Variables Configuration

### Development (.env.local)

```env
PORT=3000
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=debug
```

### Production (Vercel Dashboard)

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable individually:

| Name | Value | Environment |
|------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `{...}` | Production |
| `JWT_SECRET` | `<random-secret>` | Production |
| `JWT_REFRESH_SECRET` | `<random-secret>` | Production |
| `ALLOWED_ORIGINS` | `https://yourdomain.com,https://www.yourdomain.com` | Production |
| `LOG_LEVEL` | `info` | Production |

3. Click "Save and Redeploy"

## Domain Setup

### 1. Add Custom Domain to Vercel

1. Vercel Dashboard → Settings → Domains
2. Add domain (e.g., `api.proinformatique.dev`)
3. Vercel generates DNS records
4. Update DNS at your registrar

### 2. DNS Configuration

Add these DNS records at your registrar (e.g., GoDaddy, Namecheap):

```
Type: CNAME
Name: api
Value: cname.vercel.com.
```

Or:

```
Type: A
Name: api
Value: 76.76.19.130  # Or Vercel's current IP
```

## SSL/HTTPS

- Automatically handled by Vercel
- HTTPS enforced by default
- Automatic certificate renewal (Let's Encrypt)

## Monitoring & Logging

### Application Logs

View in Vercel Dashboard:
1. Project → Deployments → Select deployment → Logs tab

### Winston Logs

In production, logs are written to:
- Console (visible in Vercel Logs)
- Files (in `/logs/` directory if configured)

Configure log shipping to external service:

```typescript
// Edit src/lib/logger.ts
if (process.env.LOG_SHIPPING_URL) {
  logger.add(new transports.Http({
    host: process.env.LOG_SHIPPING_URL,
    path: '/logs',
    ssl: true
  }));
}
```

### Health Checks

Monitor server health:

```bash
# External monitoring script
curl https://api.proinformatique.dev/health

# Response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 12345.67,
    "database": "connected"
  }
}
```

## Backups & Recovery

### Firebase Automatic Backups

Firestore automatically creates daily backups.

Restore backup:
1. Firebase Console → Firestore → Backups
2. Select backup
3. Click "Restore"

### Manual Export

```bash
# Export Firestore data
gcloud firestore export gs://your-bucket-name/backup-$(date +%s)

# Import Firestore data
gcloud firestore import gs://your-bucket-name/2024-01-01T12:00:00_12345/
```

## Scaling Strategy

### Phase 1: Current (Single Instance)
- Single Vercel serverless function
- Firestore handles database scaling
- Good for < 1000 daily active users

### Phase 2: Caching Layer
- Add Redis (Upstash)
- Cache frequently accessed data
- Reduces database reads

### Phase 3: Read Replicas
- Firestore read replicas (if available)
- Database-level scaling
- Regional redundancy

### Phase 4: Microservices
- If needed, split services
- Separate deployments
- API Gateway pattern

## Performance Optimization

### Current Optimizations

1. **Query Optimization**
   - Firestore indexes
   - Pagination (default 20 items)
   - Early filtering

2. **Caching**
   - HTTP cache headers
   - Client-side caching

3. **Compression**
   - gzip enabled on Vercel

### Measure Performance

```bash
# Lighthouse CI
npm install -g @lhci/cli@*
lhci autorun

# Load testing
npm install -g artillery
artillery quick --count 100 --num 1000 https://api.proinformatique.dev
```

## Security Checklist

- [ ] JWT secrets are unique and long (min 32 chars)
- [ ] ALLOWED_ORIGINS configured for production domain
- [ ] Firebase security rules configured
- [ ] HTTPS enforced (Vercel default)
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Audit logs enabled
- [ ] Regular backups scheduled
- [ ] Monitoring alerts set up

## Rollback Procedure

If deployment has critical issues:

### Quick Rollback (Vercel)

1. Vercel Dashboard → Project → Deployments
2. Find working deployment
3. Click "..." → "Promote to Production"

### Git Rollback

```bash
# Find problematic commit
git log --oneline -10

# Revert to previous commit
git revert <commit-hash>
git push

# Auto-deploys if using Vercel GitHub integration
```

### Database Rollback

Use Firebase backup (see "Backups & Recovery" section)

## Troubleshooting

### Issue: "Cannot find module 'firebase-admin'"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: "JWT secret not set"

```bash
# Check environment variables
vercel env list

# Verify variable exists and is set correctly
echo $JWT_SECRET
```

### Issue: "CORS error from client"

1. Check `ALLOWED_ORIGINS` includes client URL
2. Verify no trailing spaces in origin URL
3. Test with curl (no CORS restrictions):

```bash
curl -H "Origin: https://yourdomain.com" https://api.proinformatique.dev/v1/services
```

### Issue: "Database connection failed"

1. Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is valid
2. Check Firebase project still exists
3. Verify Firestore database is enabled
4. Check IAM permissions

## Contact & Support

- Documentation: README.md
- Architecture: ARCHITECTURE.md  
- Issues: GitHub Issues
- Email: support@proinformatique.dev

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-XX  
**Maintenance**: Pro Informatique Team
