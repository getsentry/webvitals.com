# Deployment Guide

WebVitals.com is optimized for deployment on Vercel with Next.js native integration, but can be deployed on any platform supporting Node.js.

## 🚀 Vercel Deployment (Recommended)

### Prerequisites
- Vercel account
- GitHub repository
- Required API keys

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/user/webvitals.com)

### Manual Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Connect your project
   vercel
   ```

2. **Configure Environment Variables**
   
   In Vercel Dashboard → Project → Settings → Environment Variables:
   
   ```bash
   # Required
   GOOGLE_API_KEY=your_google_pagespeed_api_key
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
   OPENAI_API_KEY=your_openai_api_key
   
   # Optional (Monitoring)
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   SENTRY_AUTH_TOKEN=your_sentry_auth_token
   ```

3. **Deploy**
   ```bash
   # Production deployment
   vercel --prod
   ```

### Vercel Configuration

**`vercel.json`** (if needed):
```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_TELEMETRY_DISABLED": "1"
  }
}
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Use Node.js 22 with Alpine
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Enable pnpm
RUN corepack enable pnpm

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  webvitals:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}
      - CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
      - SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# Or with plain Docker
docker build -t webvitals .
docker run -p 3000:3000 --env-file .env webvitals
```

## ☁️ Cloud Platform Deployment

### AWS (App Runner)

1. **Create App Runner Service**
   ```bash
   # Using AWS CLI
   aws apprunner create-service \
     --service-name webvitals \
     --source-configuration '{
       "ImageRepository": {
         "ImageIdentifier": "your-ecr-repo/webvitals:latest",
         "ImageConfiguration": {
           "Port": "3000",
           "RuntimeEnvironmentVariables": {
             "NODE_ENV": "production"
           }
         }
       }
     }'
   ```

2. **Environment Variables**
   Add through AWS Console or CLI with required API keys

### Google Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy webvitals \
  --image gcr.io/PROJECT_ID/webvitals \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,GOOGLE_API_KEY=your_key
```

### Azure Container Instances

```bash
# Deploy to Azure
az container create \
  --resource-group webvitals-rg \
  --name webvitals \
  --image your-registry/webvitals:latest \
  --dns-name-label webvitals \
  --ports 3000 \
  --environment-variables NODE_ENV=production
```

## 🔧 Build Optimization

### Next.js Configuration

**`next.config.ts`**:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack for faster builds
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Output configuration for Docker
  output: 'standalone',
  
  // External packages for build optimization
  serverExternalPackages: [
    '@sentry/profiling-node',
    'import-in-the-middle',
    'require-in-the-middle',
  ],
  
  // Compression
  compress: true,
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Performance Optimizations

**Bundle Analysis**:
```bash
# Analyze bundle size
ANALYZE=true pnpm build
```

**Build Caching**:
```bash
# Enable build cache
export NEXT_CACHE_HANDLER=cache-handler.js
```

## 🔒 Security Configuration

### Environment Variables

**Production Environment**:
```bash
# Never commit these to version control
GOOGLE_API_KEY=                    # Google PageSpeed Insights
CLOUDFLARE_ACCOUNT_ID=             # Cloudflare Account ID
CLOUDFLARE_API_TOKEN=              # Cloudflare API Token
OPENAI_API_KEY=                    # OpenAI API Key
NEXT_PUBLIC_SENTRY_DSN=            # Sentry DSN (public)
SENTRY_AUTH_TOKEN=                 # Sentry Auth Token (private)
SENTRY_ORG=                        # Sentry Organization
SENTRY_PROJECT=                    # Sentry Project
NODE_ENV=production                # Environment flag
NEXT_TELEMETRY_DISABLED=1          # Disable Next.js telemetry
```

### Security Headers

Implemented via Next.js configuration and Vercel security features:

- **Content Security Policy**: Prevents XSS attacks
- **HTTPS Enforcement**: Automatic HTTPS redirects
- **HSTS Headers**: HTTP Strict Transport Security
- **Frame Protection**: X-Frame-Options to prevent clickjacking

## 📊 Monitoring Setup

### Sentry Configuration

**`sentry.server.config.ts`**:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  org: 'sentry',
  project: 'webvitals',
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // AI SDK integration
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});
```

### Health Checks

**`app/api/health/route.ts`**:
```typescript
export async function GET() {
  try {
    // Check database connections, external APIs, etc.
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        google: await checkGoogleAPI(),
        cloudflare: await checkCloudflareAPI(),
        openai: await checkOpenAI(),
      },
    };
    
    return Response.json(health);
  } catch (error) {
    return Response.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
```

## 🚦 CI/CD Pipeline

### GitHub Actions

**`.github/workflows/deploy.yml`**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm check-types
      - run: pnpm lint
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔍 Troubleshooting

### Common Deployment Issues

**Build Failures**:
```bash
# Clear Next.js cache
rm -rf .next
pnpm build

# Check dependencies
pnpm audit
```

**API Key Issues**:
- Verify all environment variables are set correctly
- Check API key permissions and quotas
- Ensure keys are added to production environment

**Performance Issues**:
- Enable Vercel Analytics for detailed metrics
- Monitor Sentry performance tracking
- Check Core Web Vitals in production

### Deployment Checklist

- [ ] All environment variables configured
- [ ] API keys tested and working
- [ ] Build completes successfully
- [ ] Health check endpoint responds
- [ ] Sentry monitoring configured
- [ ] Domain and SSL configured
- [ ] Performance monitoring enabled
- [ ] Error tracking functional

## 📈 Post-Deployment

### Performance Monitoring

1. **Core Web Vitals**: Monitor via Vercel Analytics
2. **Error Tracking**: Review Sentry dashboard
3. **API Performance**: Track response times and success rates
4. **User Analytics**: Monitor usage patterns and engagement

### Maintenance

- **Weekly**: Review error rates and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize API usage and costs

