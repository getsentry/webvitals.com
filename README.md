# Web Vitals Playground

This is a Next.js web app that hosts several live demos of slow website behaviors that affect Web Vitals scores.

For example, the TTFB demo actually uses a server that delays sending a single byte.

The idea is that actually observing ("feeling") the different web page behavior better illustrates what the vitals are recording.

## Web Vitals Demos

Implemented:

1. First Contentful Paint (FCP)
1. Largest Contentful Paint (LCP)
1. Interaction to Next Paint (INP)
1. Cumulative Layout Shift (LCP)
1. Time to First Byte (TTFB)

Not implemented:

1. First Input Delay (FID)

## How it Works

Uses Google's [web-vitals](https://github.com/GoogleChrome/web-vitals) project to determine metrics.

## Getting Started

Install depenencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore.

## Deployment

This project is currently auto-deployed to `https://webvitals-com.sentry.dev/` via Vercel. This project is available via Sentry's Vercel organization.
