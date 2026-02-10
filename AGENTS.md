# Agent Instructions

Staff-level engineer tone. Express tradeoffs, not agreement. Avoid sycophantic language. Limit scope unless explicitly asked to refactor broadly.

## Package Manager

Use **pnpm**: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm check-types`, `pnpm lint`

Ask before running dev/build/lint commands — user handles these manually.

## Commit Attribution

AI commits MUST include:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript 5** (strict)
- **Anthropic AI SDK** (`@ai-sdk/anthropic`) with `claude-sonnet-4-5` / `claude-haiku-4-5`
- **Sentry** (`@sentry/nextjs`) — error monitoring, tracing, session replay, AI monitoring
- **TailwindCSS 4** + **shadcn/ui** (New York style, Lucide icons) + **Motion** (animation)
- **Biome 2** — formatting (space indent, double quotes) and linting

## Key Conventions

- Server Components by default; `"use client"` only when interactive
- `cn()` from `@/lib/utils` for Tailwind class merging
- `@/*` path alias maps to project root
- API routes: `app/api/[route]/route.ts`, export `GET`/`POST`/etc.
- Biome auto-organizes imports — don't manually sort

## AI Tool Orchestration (`app/api/chat/route.ts`)

1. **Step 1**: Parallel `getRealWorldPerformance` + `detectTechnologies`
2. **Step 2**: Conditional `generateAnalysisBreakdown` (only if `hasData: true`)
3. Stops after 2 steps via `stopWhen: stepCountIs(2)`
4. `prepareStep` hook excludes breakdown tool when no performance data
5. Frontend checks `hasData` flag — never render breakdown UI when `false`

## Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `ANTHROPIC_API_KEY` | Server | Anthropic API for AI analysis |
| `GOOGLE_API_KEY` | Server | PageSpeed Insights / CrUX data |
| `SENTRY_AUTH_TOKEN` | Server | Source map uploads |
| `NEXT_PUBLIC_SENTRY_DSN` | Client | Sentry error reporting |

## Animation Rules

- Default to **spring animations** with Motion (not duration-based)
- Max duration: 1s (most should be 0.2s-0.3s)
- Respect `prefers-reduced-motion` — disable transforms, show static state
- Only `will-change`: `transform`, `opacity`, `clipPath`, `filter`
- Scope hover effects: `@media (hover: hover) and (pointer: fine)`
- See `.cursor/rules/` for easing reference tables

## Directory Structure

```
app/api/chat/           # Main AI streaming endpoint
app/api/follow-up-suggestions/  # Follow-up generation
app/[metric]/           # LCP, FCP, INP, CLS, TTFB pages
ai/tools/               # AI tool definitions
components/animations/  # Per-metric educational animations
components/ui/          # shadcn/ui + custom components
types/                  # TypeScript type definitions
hooks/                  # Custom React hooks
```

## Local Skills

- **AI SDK**: `.agents/skills/ai-sdk/SKILL.md` — AI SDK patterns, common errors, latest API
- **Next.js**: `.agents/skills/next-best-practices/SKILL.md` — App Router, RSC, error handling
- **React Performance**: `.agents/skills/vercel-react-best-practices/SKILL.md` — 57 optimization rules
- **Composition Patterns**: `.agents/skills/vercel-composition-patterns/SKILL.md` — Component architecture
- **Motion**: `.agents/skills/motion/SKILL.md` — Animation patterns
- **Tailwind**: `.agents/skills/tailwind/SKILL.md` — Tailwind v4 patterns
- **Frontend Design**: `.agents/skills/frontend-design/SKILL.md` — UI design quality
- **Sentry Fix Issues**: `.agents/skills/sentry-fix-issues/SKILL.md` — Debug production errors
- **Commit**: `.agents/skills/commit/SKILL.md` — Sentry commit conventions
- **Create PR**: `.agents/skills/create-pr/SKILL.md` — PR conventions

