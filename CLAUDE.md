# CLAUDE.md

You are a seasoned staff-level software engineer.

Try to limit scope of changes to avoid massive multi-file refactorings, unless explicitly prompted to do so. If unsure, ask if appropriate.

You do not always agree with the user. You should express the tradeoffs of a given approach, instead of blindly agreeing with it.

Avoid sycophantic language like "You're absolutely right!" or "Perfect!" in response to user prompts. Instead, use more hesitant, objective language like "Got it", "That seems prudent", and "Finished".

Avoid misleading yourself or the user that the changes are always correct. Don't just think about all the ways in which the changes have succeeded. Express the ways in which it might not have worked.

## 🎯 Cursor Rules

Follow the guidelines in `@.cursor/rules` which include:
- **Web Interface Guidelines**: `@.cursor/rules/web-interface-guidelines.mdc` - Comprehensive rules for building accessible, fast, delightful UIs with keyboard support, touch interactions, animations, layout, performance, and design standards

## 📚 Complete Documentation

For comprehensive project documentation, see `@docs/`:
- **Project Overview**: `@docs/overview.md` - Mission, features, and competitive advantages
- **Development Guide**: `@docs/development/quick-start.md` - Getting started
- **Technical Architecture**: `@docs/development/architecture.md` - Detailed system design
- **API Documentation**: `@docs/api/overview.md` - API specifications
- **AI Integration**: `@docs/ai/overview.md` - AI system details  
- **Deployment Guide**: `@docs/deployment/guide.md` - Production deployment
- **Contributing**: `@docs/contributing/guide.md` - Development workflow
- **FAQ**: `@docs/faq.md` - Common questions and troubleshooting

## Project Overview

This is a Next.js-based website with TailwindCSS and React integration, deployed on Vercel with Sentry monitoring. The project uses modern web development tools and follows component-based architecture with App Router.

## Development Commands

```bash
# Start development server with Turbopack
pnpm dev

# Build for production with Turbopack
pnpm build

# Start production server
pnpm start

# Type checking
pnpm check-types

# Code formatting and linting
pnpm format        # Format code with Biome
pnpm format:fix    # Fix formatting issues
pnpm lint          # Check for linting issues
```

**Note**: Always ask before running dev/build commands or formatting/linting - the user prefers to handle these manually.

## Architecture and Structure

### Framework Stack
- **Next.js 15.5.4**: React meta-framework with App Router and Turbopack
- **React 19.1.0**: Component library with concurrent features
- **TailwindCSS 4.1.3**: Utility-first CSS framework with PostCSS integration
- **TypeScript 5**: Type safety with strict configuration
- **Biome 2.2.2**: Code formatting and linting (replaces ESLint/Prettier)

### Key Integrations
- **Vercel**: Deployment platform (native Next.js support)
- **Sentry**: Error monitoring and performance tracking (`@sentry/nextjs`)
- **shadcn/ui**: Component system with Radix UI primitives
- **AI SDK**: OpenAI integration with streaming analysis and tool orchestration
- **Motion**: Modern animation library for smooth UI interactions
- **Magic UI**: Additional component library for advanced UI patterns
- **Kibo UI**: Theme switcher and additional UI components

### Directory Structure
```
app/                   # Next.js App Router
├── api/              # API routes (App Router format)
│   ├── chat/         # Main AI analysis endpoint
│   ├── follow-up-suggestions/ # Follow-up artifact endpoint
│   └── slow-response/         # Slow response simulation
├── [metric]/         # Individual Core Web Vitals pages
│   ├── lcp/          # Largest Contentful Paint
│   ├── fcp/          # First Contentful Paint
│   ├── inp/          # Interaction to Next Paint
│   ├── cls/          # Cumulative Layout Shift
│   └── ttfb/         # Time to First Byte
├── layout.tsx        # Root layout
├── page.tsx          # Homepage
└── globals.css       # Global styles

ai/                   # AI system implementation
├── tools/            # AI analysis tools
├── system-prompts.ts # AI prompts and instructions
└── index.ts          # AI configuration

components/           # Reusable React components
├── ui/              # Design system components
│   ├── ai-elements/ # AI-specific UI components
│   ├── kibo-ui/     # Kibo UI integrations
│   └── *.tsx        # shadcn/ui base components
├── animations/      # Core Web Vitals animations
├── performance/     # Performance visualization components
├── demo/            # Demo and simulation components
└── *.tsx            # Main UI components

lib/                 # Utility functions and configurations
contexts/            # React context providers
hooks/               # Custom React hooks
types/               # TypeScript type definitions
stores/              # State management (Zustand)
```

### Component Architecture
- **Server Components**: Default components that render on the server
- **Client Components**: Use `"use client"` directive for interactive components
- **Path Mapping**: `@/*` maps to root directory for clean imports
- **Styling**: Use `cn()` utility from `@/lib/utils` to merge Tailwind classes
- **Theme System**: Uses `next-themes` with proper SSR hydration

### Configuration Files
- **Biome**: Uses space indentation, double quotes, organizes imports automatically
- **TypeScript**: Strict Next.js configuration with React JSX support
- **Next.js**: Configured with Turbopack, external packages, and Sentry integration
- **TailwindCSS**: PostCSS integration with utility-first approach
- **shadcn/ui**: New York style, TypeScript, uses Lucide icons

### Sentry Integration
- Next.js integration with `@sentry/nextjs`
- Client-side monitoring with browser tracing and session replay
- Server-side error tracking with performance monitoring
- AI SDK integration for agent monitoring
- Source maps uploaded during build (requires `SENTRY_AUTH_TOKEN`)
- Project: "webvitals", Org: "sentry"

## Development Notes

### Code Style
- Use space indentation (configured in Biome)
- Double quotes for JavaScript/TypeScript
- Imports are automatically organized by Biome
- Follow Next.js conventions: Server Components by default, Client Components when needed
- Use React Server Components for static content, Client Components for interactivity

### Component Guidelines
- Place reusable UI components in `components/ui/`
- Use the `cn()` utility for conditional class merging
- Follow shadcn/ui patterns for consistent styling
- Prefer Server Components unless interactivity is required
- Use proper TypeScript types with Next.js conventions

### Environment Variables
- `NEXT_PUBLIC_SENTRY_DSN`: Client-side Sentry DSN (public)
- `SENTRY_AUTH_TOKEN`: Server-side token for source map uploads (private)
- `OPENAI_API_KEY`: OpenAI API key for AI analysis (private)
- `GOOGLE_API_KEY`: Google PageSpeed Insights API key (private)

### API Routes
- Use App Router format: `app/api/[route]/route.ts`
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`
- Return `Response` objects or use Next.js response helpers
- Handle errors with proper HTTP status codes

**Current API Endpoints:**
- `/api/chat`: Main AI analysis endpoint with streaming responses
- `/api/follow-up-suggestions`: Follow-up artifact streaming

### Core Features

**Individual Metric Pages:**
- Dedicated pages for each Core Web Vital (LCP, FCP, INP, CLS, TTFB)
- Educational content with interactive animations
- Metric-specific optimization guidance
- Visual demonstrations of performance concepts

**AI Analysis Tools:**
- Real World Performance Tool: Chrome User Experience Report data collection
- Technology Detection Tool: Cloudflare-powered tech stack identification
- Analysis Breakdown Tool: Detailed performance analysis breakdown

**Animation System:**
- Motion-based animations for each Core Web Vital
- Educational visualizations of performance concepts
- Smooth transitions and micro-interactions
- Accessibility-aware animations with reduced motion support

### AI SDK Architecture

The AI analysis system uses Vercel AI SDK's tool orchestration with step-based execution:

**Tool Execution Flow (app/api/chat/route.ts):**
1. **Step 1**: Parallel execution of `getRealWorldPerformance` and `detectTechnologies`
2. **Step 2**: Conditional execution of `generateAnalysisBreakdown` (only if performance data exists)
3. Stream stops after 2 steps via `stopWhen: [stepCountIs(2)]`

**Conditional Tool Activation:**
- `prepareStep` hook checks if `getRealWorldPerformance` returned `hasData: false`
- If no performance data: `generateAnalysisBreakdown` is excluded from `activeTools`
- This prevents the AI from attempting analysis when data is unavailable

**Frontend States:**
- **Performance data available**: Show full analysis with breakdown
- **No performance data** (`hasData: false`): Show fallback message, skip analysis breakdown
- Frontend must check tool results for `hasData` flag to determine which UI to render
- Never call or render analysis breakdown UI when `hasData: false`

**Monitoring:**
- AI SDK telemetry enabled with `functionId: "pagespeed-analysis-chat"`
- Sentry integration tracks tool execution errors via `onStepFinish`
- Failed tool results are captured with context (model, tool name, error details)

## Animations Guidelines
 
### Keep your animations fast
 
- Default to use `ease-out` for most animations.
- Animations should never be longer than 1s (unless it's illustrative), most of them should be around 0.2s to 0.3s.
 
### Easing rules
 
- Don't use built-in CSS easings unless it's `ease` or `linear`.
- Use the following easings for their described use case:
  - **`ease-in`**: (Starts slow, speeds up) Should generally be avoided as it makes the UI feel slow.
    - `ease-in-quad`: `cubic-bezier(.55, .085, .68, .53)`
    - `ease-in-cubic`: `cubic-bezier(.550, .055, .675, .19)`
    - `ease-in-quart`: `cubic-bezier(.895, .03, .685, .22)`
    - `ease-in-quint`: `cubic-bezier(.755, .05, .855, .06)`
    - `ease-in-expo`: `cubic-bezier(.95, .05, .795, .035)`
    - `ease-in-circ`: `cubic-bezier(.6, .04, .98, .335)`
 
  - **`ease-out`**: (Starts fast, slows down) Best for elements entering the screen or user-initiated interactions.
    - `ease-out-quad`: `cubic-bezier(.25, .46, .45, .94)`
    - `ease-out-cubic`: `cubic-bezier(.215, .61, .355, 1)`
    - `ease-out-quart`: `cubic-bezier(.165, .84, .44, 1)`
    - `ease-out-quint`: `cubic-bezier(.23, 1, .32, 1)`
    - `ease-out-expo`: `cubic-bezier(.19, 1, .22, 1)`
    - `ease-out-circ`: `cubic-bezier(.075, .82, .165, 1)`
 
  - **`ease-in-out`**: (Smooth acceleration and deceleration) Perfect for elements moving within the screen.
    - `ease-in-out-quad`: `cubic-bezier(.455, .03, .515, .955)`
    - `ease-in-out-cubic`: `cubic-bezier(.645, .045, .355, 1)`
    - `ease-in-out-quart`: `cubic-bezier(.77, 0, .175, 1)`
    - `ease-in-out-quint`: `cubic-bezier(.86, 0, .07, 1)`
    - `ease-in-out-expo`: `cubic-bezier(1, 0, 0, 1)`
    - `ease-in-out-circ`: `cubic-bezier(.785, .135, .15, .86)`
 
 
### Hover transitions
 
- Use the built-in CSS `ease` with a duration of `200ms` for simple hover transitions like `color`, `background-color`,`opacity`.
- Fall back to easing rules for more complex hover transitions.
- Disable hover transitions on touch devices with the `@media (hover: hover) and (pointer: fine)` media query.
 
### Accessibility
 
- If `transform` is used in the animation, disable it in the `prefers-reduced-motion` media query.
 
### Origin-aware animations
 
- Elements should animate from the trigger. If you open a dropdown or a popover it should animate from the button. Change `transform-origin` according to the trigger position.
 
### Performance
 
- Stick to opacity and transforms when possible. Example: Animate using `transform` instead of `top`, `left`, etc. when trying to move an element.
- Do not animate drag gestures using CSS variables.
- Do not animate blur values higher than 20px.
- Use `will-change` to optimize your animation, but use it only for: `transform`, `opacity`, `clipPath`, `filter`.
- When using Motion/Framer Motion use `transform` instead of `x` or `y` if you need animations to be hardware accelerated.
 
### Spring animations
 
- Default to spring animations when using Framer Motion.
- Avoid using bouncy spring animations unless you are working with drag gestures.