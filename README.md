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

- **Astro 5** - Fast static site generation with view transitions
- **React 19** - Interactive dashboard components
- **TailwindCSS 4** - Utility-first styling
- **TypeScript** - Type-safe development
- **Vercel** - Deployment and serverless functions
- **Sentry** - Error monitoring and performance tracking

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Format code
pnpm format:fix

# Lint code
pnpm lint:fix
```

## Project Structure

```
src/
├── components/           # Reusable UI components
├── layouts/             # Page layouts with view transitions
├── pages/               # File-based routing
├── lib/                 # Utilities and services
│   └── utils.ts         # Shared utilities
└── styles/              # Global CSS

PRODUCT_SPEC.md          # Detailed product specification
CLAUDE.md               # Development guidelines
```

---

_Building the future of actionable web performance analysis._
