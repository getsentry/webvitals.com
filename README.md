# WebVitals.com

**From Score to Solution** - The most actionable web performance analysis tool.

## What is WebVitals.com?

WebVitals.com transforms confusing performance metrics into clear, implementable action items. Unlike traditional tools that just give you a score, we provide:

- **Real-world performance data** from Chrome User Experience Report (CrUX)
- **AI-powered insights** with contextual analysis of your site
- **Technology detection** to identify your framework and hosting setup
- **Sentry-style scoring** for actionable performance metrics

## Key Features

🎯 **Real User Data** - Chrome UX Report data from actual visitors  
🤖 **AI-Powered Analysis** - Intelligent insights tailored to your site  
📊 **Sentry-Style Scoring** - Performance metrics with actionable thresholds  
🔧 **Technology Detection** - Automatic framework and platform identification  
⚡ **Streamlined Experience** - Focus on what matters most for your site

## Tech Stack

- **Next.js 15** - React meta-framework with App Router and Turbopack
- **React 19** - Interactive dashboard components with Server Components
- **TailwindCSS 4** - Utility-first styling with PostCSS integration
- **TypeScript** - Type-safe development with strict configuration
- **Vercel** - Deployment platform with native Next.js support
- **Sentry** - Error monitoring, performance tracking, and AI agent monitoring
- **AI SDK** - OpenAI integration for intelligent web performance analysis

## Development

```bash
# Install dependencies
pnpm install

# Start development server with Turbopack
pnpm dev

# Build for production with Turbopack
pnpm build

# Start production server
pnpm start

# Type checking
pnpm check

# Format code
pnpm format:fix

# Lint code
pnpm lint:fix
```

## Project Structure

```
app/                     # Next.js App Router
├── api/chat/           # API routes for AI analysis
├── layout.tsx          # Root layout with theme provider
├── page.tsx            # Homepage
└── globals.css         # Global styles

components/              # Reusable UI components
├── ui/                 # shadcn/ui component library
├── HeroSection.tsx     # Main hero with analysis interface
├── ChatInterface.tsx   # AI conversation interface
├── MessageRenderer.tsx # AI tool output rendering
└── ThemeProvider.tsx   # Next.js theme management

lib/                     # Utilities and services
├── utils.ts            # Shared utility functions
└── system-prompts.ts   # AI system prompts

tools/                   # Analysis tools (simplified to 2 core tools)
├── real-world-performance-tool.ts # Chrome UX Report data with Sentry scoring
└── tech-detection-tool.ts # Cloudflare-based technology detection

types/                   # TypeScript definitions
├── real-world-performance.ts # CrUX data and Sentry scoring types
└── cloudflare-tech.ts  # Technology detection types

hooks/                   # React hooks
├── use-mobile.ts       # Mobile detection hook
└── useScrollFade.ts    # Scroll animation hook

PRODUCT_SPEC.md          # Detailed product specification
CLAUDE.md               # Development guidelines for Next.js
```

---

_Building the future of actionable web performance analysis._
