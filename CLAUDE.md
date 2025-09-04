# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based website with TailwindCSS and React integration, deployed on Vercel with Sentry monitoring. The project uses modern web development tools and follows component-based architecture.

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Code formatting and linting
pnpm format        # Check formatting with Biome
pnpm format:fix    # Fix formatting issues
pnpm lint          # Check for linting issues
pnpm lint:fix      # Fix linting issues
```

**Note**: Always ask before running dev/build commands or formatting/linting - the user prefers to handle these manually.

## Architecture and Structure

### Framework Stack
- **Astro 5.x**: Meta-framework with SSG/SSR capabilities
- **React 19**: Component library for interactive elements
- **TailwindCSS 4.x**: Utility-first CSS framework
- **TypeScript**: Type safety with strict configuration
- **Biome**: Code formatting and linting (replaces ESLint/Prettier)

### Key Integrations
- **Vercel**: Deployment platform (`@astrojs/vercel` adapter)
- **Sentry**: Error monitoring and performance tracking
- **shadcn/ui**: Component system with Radix UI primitives

### Directory Structure
```
src/
├── components/        # Reusable components
│   ├── ui/           # shadcn/ui components (React)
│   └── *.astro       # Astro components
├── layouts/          # Page layouts
├── pages/            # File-based routing
├── lib/              # Utility functions
└── styles/           # Global CSS
```

### Component Architecture
- **Astro Components**: Use `.astro` files for static/server-rendered components
- **React Components**: Use `.tsx` files in `src/components/ui/` for interactive components
- **Path Mapping**: `@/*` maps to `src/*` for clean imports
- **Styling**: Use `cn()` utility from `@/lib/utils` to merge Tailwind classes

### Configuration Files
- **Biome**: Uses space indentation, double quotes, organizes imports automatically
- **TypeScript**: Extends Astro's strict config with React JSX support  
- **Astro**: Configured with React, Vercel adapter, and Sentry integration
- **shadcn/ui**: New York style, TypeScript, uses Lucide icons

### Sentry Integration
- Client-side monitoring with browser tracing and session replay
- Server-side error tracking
- Source maps uploaded during build (requires `SENTRY_AUTH_TOKEN`)
- Project: "webvitals", Org: "sergtech"

## Development Notes

### Code Style
- Use space indentation (configured in Biome)
- Double quotes for JavaScript/TypeScript
- Imports are automatically organized by Biome
- Follow Astro component conventions for static content
- Use React components only when interactivity is needed

### Component Guidelines
- Place reusable UI components in `src/components/ui/`
- Use the `cn()` utility for conditional class merging
- Follow shadcn/ui patterns for consistent styling
- Leverage Astro's component slot system for content projection

### Environment Variables
- `PUBLIC_SENTRY_DSN`: Client-side Sentry DSN
- `SENTRY_AUTH_TOKEN`: Server-side token for source map uploads