# Quick Start Guide

Get WebVitals.com running locally in under 5 minutes.

## 🚀 Prerequisites

- **Node.js**: Version 22.19.0 (via Volta) or latest LTS
- **pnpm**: Latest version (`npm install -g pnpm`)
- **API Keys**: Google PageSpeed Insights API key, Cloudflare API token

## ⚡ Quick Setup

### 1. Clone & Install

```bash
git clone https://github.com/user/webvitals.com.git
cd webvitals.com
pnpm install
```

### 2. Environment Configuration

Create `.env.local` file:

```bash
# Required API Keys
GOOGLE_API_KEY=your_google_pagespeed_api_key
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id  
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
OPENAI_API_KEY=your_openai_api_key

# Optional: Sentry (for monitoring)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### 3. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) - you're ready to go! 🎉

## 🔑 API Key Setup

### Google PageSpeed Insights API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the PageSpeed Insights API
4. Create credentials (API Key)
5. Add the key to your `.env.local`

### Cloudflare API

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to "My Profile" → "API Tokens"
3. Create a custom token with:
   - **Permissions**: `Account:Cloudflare Tunnel:Read`, `Zone:Zone:Read`
   - **Account Resources**: Include your account
4. Get your Account ID from the right sidebar
5. Add both to your `.env.local`

### OpenAI API

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys section
3. Create a new secret key
4. Add to your `.env.local`

## 🧪 Test the Setup

### 1. Analyze a Website

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Enter a domain (e.g., `vercel.com`)
3. Select device configuration (mobile, desktop, or both)
4. Click "Analyze Performance"

Expected behavior:
- Loading state with animated background
- AI analysis streaming in real-time
- Performance data visualization
- Follow-up suggestions appearing after analysis

### 2. Verify API Connections

Check browser console for successful API calls:
- ✅ Google PageSpeed API: Returns CrUX data
- ✅ Cloudflare API: Returns technology detection
- ✅ OpenAI API: Streams analysis and follow-up suggestions

## 📁 Project Structure Overview

```
webvitals.com/
├── app/                    # Next.js App Router
│   ├── api/chat/          # AI analysis endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── ai/                    # AI system
│   ├── artifacts/         # Streaming components
│   ├── tools/            # Analysis tools
│   └── context.ts        # Session management
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── *.tsx            # Feature components
├── lib/                 # Utilities
└── types/              # TypeScript definitions
```

## 🔧 Development Commands

```bash
# Development
pnpm dev                # Start dev server with Turbopack
pnpm dev --port 3001   # Run on different port

# Type Checking
pnpm check-types       # TypeScript validation

# Code Quality
pnpm lint              # Check code with Biome
pnpm lint:fix          # Auto-fix issues
pnpm format            # Format code

# Production
pnpm build             # Build for production
pnpm start             # Start production server
```

## 🎯 Next Steps

### Explore the Codebase
- [Architecture Guide](./architecture.md) - Technical overview
- [Component Library](./components.md) - UI components and patterns
- [AI System](../ai/overview.md) - AI tools and artifacts

### Make Your First Change
1. Edit `components/HeroLanding.tsx` to customize the landing page
2. Modify `ai/tools/` to adjust analysis behavior
3. Update `components/ui/` to customize the design system

### Deploy to Production
- [Deployment Guide](../deployment/guide.md) - Production deployment
- [Environment Variables](../deployment/environment.md) - Configuration reference

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
pnpm dev --port 3001
```

**API Key Issues**
- Verify all required environment variables are set
- Check API key permissions and usage limits
- Restart development server after changing `.env.local`

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
pnpm dev
```

**Type Errors**
```bash
# Check TypeScript configuration
pnpm check-types
```

### Getting Help

- Check the [FAQ](../faq.md) for common questions
- Browse [GitHub Issues](https://github.com/getsentry/webvitals.com/issues) for existing problems
- Open a new issue if you need help

## 🎉 You're Ready!

Your local WebVitals.com instance is now running. Start by analyzing a few websites to get familiar with the platform, then dive into the codebase to understand how the AI analysis works.
