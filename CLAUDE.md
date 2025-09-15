# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **Next.js 15.5.2**: React meta-framework with App Router and Turbopack
- **React 19**: Component library for interactive elements
- **TailwindCSS 4.x**: Utility-first CSS framework with PostCSS integration
- **TypeScript**: Type safety with strict configuration
- **Biome**: Code formatting and linting (replaces ESLint/Prettier)

### Key Integrations
- **Vercel**: Deployment platform (native Next.js support)
- **Sentry**: Error monitoring and performance tracking (`@sentry/nextjs`)
- **shadcn/ui**: Component system with Radix UI primitives
- **AI SDK**: OpenAI integration for intelligent web analysis

### Directory Structure
```
app/                   # Next.js App Router
├── api/chat/         # API routes (App Router format)
├── layout.tsx        # Root layout
├── page.tsx          # Homepage
└── globals.css       # Global styles

components/           # Reusable React components
├── ui/              # shadcn/ui components
└── *.tsx            # Interactive components

lib/                 # Utility functions
tools/               # Analysis tools (PageSpeed, Cloudflare)
types/               # TypeScript type definitions
hooks/               # React hooks
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
- Project: "webvitals", Org: "sergtech"

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