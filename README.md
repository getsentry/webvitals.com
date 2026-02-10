# WebVitals.com

**From Score to Solution** — AI-powered web performance analysis that transforms Core Web Vitals into actionable insights.

## What it does

Enter a URL, get real-world performance data from Chrome UX Report (CrUX), AI-powered analysis from Claude, and technology detection — all streamed in real time.

- Real user metrics (LCP, FCP, INP, CLS, TTFB) with Sentry-style scoring
- Technology detection (framework, hosting, CDN)
- AI-generated recommendations tailored to your detected stack
- Per-metric educational pages with interactive animations

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript 5** (strict)
- **Anthropic AI SDK** (`@ai-sdk/anthropic`) — Claude for streaming analysis
- **Sentry** (`@sentry/nextjs`) — error monitoring, tracing, session replay, AI monitoring
- **TailwindCSS 4** + **shadcn/ui** + **Motion** (animation)
- **Biome 2** — formatting and linting

## Development

```bash
pnpm install
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm check-types  # Type checking
pnpm lint         # Biome lint
```

Requires `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, and optionally Sentry env vars. See `.env.example`.

## Project Structure

```
app/
  api/chat/                  # AI streaming endpoint (2-step tool orchestration)
  api/follow-up-suggestions/ # Follow-up generation
  [metric]/                  # LCP, FCP, INP, CLS, TTFB pages
ai/tools/                    # AI tool definitions
components/                  # UI components, animations, visualizations
hooks/                       # Custom React hooks
lib/                         # Utilities
types/                       # TypeScript definitions
```

## License

Apache License 2.0 — see [LICENSE](LICENSE).
