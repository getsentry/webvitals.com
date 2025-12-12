# WebVitals.com Documentation

Welcome to the comprehensive documentation for WebVitals.com - an AI-powered web performance analysis platform that transforms Core Web Vitals from confusing metrics into clear, actionable insights.

## Documentation Index

### Getting Started
- [Project Overview](./overview.md) - Vision, features, and architecture
- [Quick Start](./development/quick-start.md) - Get up and running in 5 minutes

### Development
- [Architecture](./development/architecture.md) - Technical architecture overview
- [Contributing Guide](./contributing/guide.md) - How to contribute

### API & AI
- [API Overview](./api/overview.md) - API architecture and patterns
- [AI Architecture](./ai/overview.md) - AI system design and components

### Deployment
- [Deployment Guide](./deployment/guide.md) - Production deployment
- [Environment Variables](./deployment/environment.md) - Configuration reference

## What is WebVitals.com?

WebVitals.com is an intelligent web performance analysis platform that combines:

- **Real User Data**: Chrome User Experience Report (CrUX) metrics from actual visitors
- **AI-Powered Analysis**: OpenAI-driven insights tailored to your technology stack
- **Technology Detection**: Automated framework and platform identification
- **Actionable Recommendations**: Context-aware suggestions with implementation guides

## Core Value Proposition

**"From Score to Solution"** - The only web vitals tool that tells you exactly what to fix, how to fix it, and why it matters for your specific site.

## Architecture Overview

```
Frontend (Next.js 15)
├── Landing Page & Hero Section
├── AI Chat Interface
├── Performance Dashboard
└── Interactive Components

Backend Services
├── Google PageSpeed Insights API
├── Cloudflare Technology Detection
├── OpenAI Streaming Analysis
└── Sentry Real User Monitoring

AI System
├── Performance Analysis Tools
├── Technology Detection Tools
├── Streaming Artifacts
└── Context Management
```

## Quick Links

- **Live Site**: [webvitals.com](https://webvitals.com)
- **Repository**: [github.com/getsentry/webvitals.com](https://github.com/getsentry/webvitals.com)
- **Issues**: [GitHub Issues](https://github.com/getsentry/webvitals.com/issues)

## Getting Help

- Check the [FAQ](./faq.md) for common questions
- Open [GitHub Issues](https://github.com/getsentry/webvitals.com/issues) for bugs and feature requests
- See [Contributing Guide](./contributing/guide.md) for how to contribute

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](../LICENSE) file for details.
