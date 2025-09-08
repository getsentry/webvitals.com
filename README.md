# WebVitals.com

**From Score to Solution** - The most actionable web performance analysis tool.

## What is WebVitals.com?

WebVitals.com transforms confusing performance metrics into clear, implementable action items. Unlike traditional tools that just give you a score, we provide:

- **Tech-aware recommendations** tailored to your framework (React, Next.js, Vue, etc.)
- **AI-powered insights** that understand your specific site architecture
- **Implementation guides** with step-by-step code examples
- **Sentry integration** to bridge synthetic analysis with real user monitoring

## Key Features

🎯 **Contextual Analysis** - Recommendations based on your detected tech stack  
🤖 **AI-Powered Suggestions** - Smart insights beyond generic advice  
📊 **Real User Monitoring** - Seamless Sentry integration for ongoing performance tracking  
📚 **Educational Content** - Learn why optimizations matter and how to implement them  
⚡ **Actionable Results** - Clear priorities with effort vs. impact scoring

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
└── ThemeProvider.tsx   # Next.js theme management

lib/                     # Utilities and services
├── utils.ts            # Shared utility functions
└── cloudflare-scanner-utils.ts # Security analysis utilities

tools/                   # Analysis tools
├── pagespeed-tool.ts   # Google PageSpeed Insights integration
└── cloudflare-scanner-tool.ts # Security scanning tool

types/                   # TypeScript definitions
├── pagespeed.ts        # PageSpeed Insights types
└── cloudflare-scanner.ts # Security analysis types

PRODUCT_SPEC.md          # Detailed product specification
CLAUDE.md               # Development guidelines for Next.js
```

---

_Building the future of actionable web performance analysis._
