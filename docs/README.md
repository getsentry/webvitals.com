# WebVitals.com Documentation

Welcome to the comprehensive documentation for WebVitals.com - an AI-powered web performance analysis platform that transforms Core Web Vitals from confusing metrics into clear, actionable insights.

## 📚 Documentation Index

### Getting Started
- [Project Overview](./overview.md) - Vision, features, and architecture
- [Quick Start](./development/quick-start.md) - Get up and running in 5 minutes
- [Installation](./development/installation.md) - Detailed setup instructions

### Features & Functionality
- [Core Features](./features/core-features.md) - Main platform capabilities
- [AI Analysis](./features/ai-analysis.md) - AI-powered insights and recommendations
- [Performance Monitoring](./features/performance-monitoring.md) - Real user metrics and CrUX data
- [Technology Detection](./features/technology-detection.md) - Tech stack identification

### Development
- [Development Guide](./development/guide.md) - Local development workflow
- [Architecture](./development/architecture.md) - Technical architecture overview
- [Component Library](./development/components.md) - UI components and patterns
- [Testing](./development/testing.md) - Testing strategies and tools

### API Reference
- [API Overview](./api/overview.md) - API architecture and patterns
- [Chat API](./api/chat.md) - AI analysis endpoint
- [Performance API](./api/performance.md) - Performance data retrieval
- [Technology Detection API](./api/technology.md) - Tech stack detection

### AI System
- [AI Architecture](./ai/overview.md) - AI system design and components
- [Tools](./ai/tools.md) - AI analysis tools
- [Artifacts](./ai/artifacts.md) - Streaming data components
- [Context Management](./ai/context.md) - Session and state management

### Deployment & Operations
- [Deployment Guide](./deployment/guide.md) - Production deployment
- [Environment Variables](./deployment/environment.md) - Configuration reference
- [Monitoring](./deployment/monitoring.md) - Sentry integration and observability
- [Performance](./deployment/performance.md) - Optimization and scaling

### Contributing
- [Contributing Guide](./contributing/guide.md) - How to contribute
- [Code Standards](./contributing/standards.md) - Coding conventions
- [UI Guidelines](./contributing/ui-guidelines.md) - Design system and patterns

## 🚀 What is WebVitals.com?

WebVitals.com is an intelligent web performance analysis platform that combines:

- **Real User Data**: Chrome User Experience Report (CrUX) metrics from actual visitors
- **AI-Powered Analysis**: OpenAI-driven insights tailored to your technology stack
- **Technology Detection**: Automated framework and platform identification
- **Actionable Recommendations**: Context-aware suggestions with implementation guides
- **Real User Monitoring**: Sentry integration for ongoing performance tracking

## 🎯 Core Value Proposition

**"From Score to Solution"** - The only web vitals tool that tells you exactly what to fix, how to fix it, and why it matters for your specific site.

## 🏗️ Architecture Overview

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

## 🔗 Quick Links

- **Live Demo**: [webvitals.com](https://webvitals.com)
- **Repository**: [GitHub (Sentry Internal)](https://github.com/getsentry/webvitals.com)
- **Internal Issues**: Use GitHub Issues for bug reports and feature requests
- **Sentry Slack**: #webvitals channel for internal discussions

## 📖 Getting Help

- Check the [FAQ](./faq.md) for common questions
- Browse [examples](./examples/) for implementation patterns
- Use Sentry Slack #webvitals channel for internal support
- Open GitHub issues for bugs and feature requests

## 📜 Project Info

This is an internal Sentry project. For external inquiries, please contact the Sentry team through official channels.
