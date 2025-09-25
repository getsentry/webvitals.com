# Frequently Asked Questions

Common questions about WebVitals.com and web performance analysis.

## 🚀 Getting Started

### What is WebVitals.com?

WebVitals.com is an AI-powered web performance analysis platform that provides actionable insights for improving Core Web Vitals. Unlike traditional performance tools that just give you scores, we combine real user data with AI analysis to tell you exactly what to fix and how to fix it.

### How is this different from Google PageSpeed Insights?

While PageSpeed Insights provides raw performance data, WebVitals.com adds:

- **AI-Powered Analysis**: Contextual insights tailored to your technology stack
- **Technology Detection**: Automatic identification of frameworks and platforms
- **Implementation Guides**: Step-by-step instructions for fixing issues
- **Conversational Interface**: Ask follow-up questions and get specific advice
- **Real User Monitoring**: Sentry integration for ongoing performance tracking

### What data sources do you use?

We combine multiple authoritative data sources:

- **Chrome User Experience Report (CrUX)**: Real user performance data from Chrome
- **Cloudflare URL Scanner**: Technology detection and security analysis
- **OpenAI GPT-4o**: AI-powered analysis and recommendations
- **Sentry**: Real user monitoring integration (optional)

## 🤖 Web Performance in the AI Era

### Do web vitals still matter in the age of AI?

More than ever. While AI tools generate code faster, they often create performance-heavy applications. AI-generated sites frequently have:
- Excessive JavaScript bundles
- Unoptimized images and assets
- Poor loading strategies
- Inefficient rendering patterns

Fast sites convert better, rank higher in search, and provide better user experience regardless of how they're built.

### Why not just let AI handle performance optimization?

Current AI coding assistants lack real-world performance context. They can't:
- Access your site's actual user data
- Understand your specific performance bottlenecks
- Provide technology-specific optimizations
- Monitor performance over time

WebVitals.com bridges this gap by providing contextual performance analysis that you can share with AI tools.

### How will WebVitals.com work with AI coding assistants?

We're developing MCP (Model Context Protocol) integration to flow performance insights directly into Claude, Cursor, and other AI tools, enabling them to:
- Generate optimizations based on your actual performance data
- Suggest framework-specific improvements
- Prioritize fixes by user impact
- Write code that addresses real bottlenecks

## 📊 Core Web Vitals

### What are Core Web Vitals?

Core Web Vitals are three key metrics that measure real user experience:

1. **Largest Contentful Paint (LCP)**: Loading performance - when the largest content element becomes visible
2. **Interaction to Next Paint (INP)**: Interactivity - time between user interaction and browser response  
3. **Cumulative Layout Shift (CLS)**: Visual stability - unexpected layout shifts during page load

### What are good Core Web Vitals scores?

**Good thresholds (75th percentile of real users):**
- **LCP**: ≤ 2.5 seconds
- **INP**: ≤ 200 milliseconds  
- **CLS**: ≤ 0.1

**Needs Improvement:**
- **LCP**: 2.5s - 4.0s
- **INP**: 200ms - 500ms
- **CLS**: 0.1 - 0.25

**Poor:**
- **LCP**: > 4.0 seconds
- **INP**: > 500 milliseconds
- **CLS**: > 0.25

### Why do my scores differ from other tools?

Different tools use different data sources:

- **WebVitals.com**: Real user data from Chrome User Experience Report (28-day rolling average)
- **PageSpeed Insights Lab Data**: Synthetic testing in controlled environment
- **GTMetrix/Pingdom**: Synthetic testing from specific locations

Real user data (RUM) is more accurate for understanding actual user experience.

## 🔧 Technical Questions

### Why can't you analyze my website?

Common reasons analysis might fail:

1. **No CrUX Data**: Your site needs sufficient Chrome users to appear in CrUX dataset
2. **New Domain**: Recently launched sites may not have data yet
3. **Low Traffic**: Sites with minimal traffic may not meet CrUX thresholds
4. **Blocked by robots.txt**: Site blocks automated analysis tools
5. **Authentication Required**: Login-protected pages can't be analyzed

### How current is the performance data?

- **CrUX Data**: 28-day rolling average, updated daily
- **Technology Detection**: Real-time analysis using latest Cloudflare data
- **AI Analysis**: Generated fresh for each request

### Can I analyze password-protected sites?

No, we can only analyze publicly accessible websites. For internal sites, consider:

1. Creating a staging environment that's publicly accessible
2. Using Sentry Real User Monitoring for private site analysis
3. Running lighthouse audits locally and asking for general optimization advice

### How accurate is technology detection?

Our technology detection uses Cloudflare's Wappa fingerprinting, which typically achieves:

- **90%+ accuracy** for major frameworks (React, Vue, Angular)
- **85%+ accuracy** for hosting platforms (Vercel, Netlify, AWS)
- **80%+ accuracy** for CMS platforms (WordPress, Shopify)

Confidence scores are provided for each detected technology.

## 🤖 AI Analysis

### How does the AI analysis work?

Our AI system:

1. **Collects Data**: Fetches real user performance data and technology stack
2. **Contextual Analysis**: Uses OpenAI GPT-4o to analyze data in context of your tech stack
3. **Generates Insights**: Provides actionable recommendations specific to your situation
4. **Follow-up Questions**: Offers relevant next steps based on the analysis

### Can I trust the AI recommendations?

Our AI recommendations are:

- **Data-Driven**: Based on real user performance data, not synthetic tests
- **Framework-Aware**: Tailored to your specific technology stack
- **Best Practice Aligned**: Following established web performance optimization principles
- **Human-Reviewed**: System prompts and recommendations are reviewed by performance experts

However, always test recommendations in a staging environment before applying to production.

### Why does the AI recommend Sentry?

Sentry provides Real User Monitoring (RUM) capabilities that complement our static analysis:

- **Continuous Monitoring**: Track performance over time vs one-time analysis
- **Real User Data**: See how actual users experience your site
- **Performance Regression Alerts**: Get notified when performance degrades
- **Error Correlation**: Understand how errors affect performance

We're not affiliated with Sentry - we recommend it because RUM is essential for ongoing performance monitoring.

## 🔒 Privacy & Security

### What data do you collect?

We only collect:

- **Publicly Available Data**: Performance metrics from Google's CrUX dataset
- **Technology Information**: Framework and platform detection via Cloudflare
- **Analysis History**: Conversation history for generating follow-up suggestions (not stored permanently)

We **do not** collect:
- Personal information from analyzed websites
- Private content or data
- User tracking across analyzed sites

### Do you store analyzed website data?

No, we don't permanently store website data. Analysis results are:

- **Generated Fresh**: Each analysis fetches current data
- **Temporarily Cached**: Google API responses cached for 1 hour for performance
- **Not Persisted**: No long-term storage of analysis results

### Is my API usage secure?

Yes:
- **Environment Variables**: API keys stored securely as environment variables
- **Rate Limiting**: Built-in protection against API abuse
- **Error Handling**: Graceful degradation when APIs are unavailable
- **Monitoring**: Comprehensive error tracking and alerting

## 💰 Usage & Limits

### Is WebVitals.com available publicly?

WebVitals.com is a Sentry-hosted service available at [webvitals.com](https://webvitals.com). It's built and maintained by the Sentry team as part of our performance monitoring ecosystem.

### Are there usage limits?

Current operational limits:
- **Analysis Requests**: Reasonable usage expected, monitored for abuse
- **API Rate Limits**: Automatically handled with external API rate limiting
- **Conversation Length**: No limits on follow-up questions

### Can businesses use this for their websites?

Yes! Any publicly accessible website can be analyzed. The platform provides valuable insights for businesses looking to improve their Core Web Vitals and user experience.

### Is there API access for integration?

The current API is designed for the WebVitals.com interface. For enterprise integration needs or Sentry customer integration, contact the Sentry team to discuss requirements.

## 🐛 Troubleshooting

### Analysis is taking too long

If analysis seems stuck:

1. **Refresh the page** and try again
2. **Check your internet connection**
3. **Try a different website** to see if it's site-specific
4. **Wait a few minutes** - sometimes external APIs are slow

### I'm getting strange recommendations

If recommendations seem off:

1. **Check the detected technology stack** - incorrect detection leads to wrong advice
2. **Ask follow-up questions** for clarification
3. **Report the issue** on GitHub with the analyzed domain

### The website shows I have good performance but users complain

This can happen because:

1. **CrUX data is aggregated** across all users and may not reflect specific user segments
2. **Geographic differences** - CrUX is global, your users might be in slower regions
3. **Device differences** - your users might use older/slower devices
4. **Time periods** - CrUX is 28-day average, recent changes might not be reflected

Consider setting up Sentry Real User Monitoring for more detailed, real-time insights.

## 🤝 Contributing

### How can I contribute?

We welcome contributions:

- **Report Issues**: Found a bug? Report it on GitHub
- **Suggest Features**: Have ideas? Share them in GitHub Discussions
- **Improve Documentation**: Help make these docs even better
- **Code Contributions**: Check our contributing guide for technical contributions

### Can I add support for more technologies?

Technology detection is handled by Cloudflare's Wappa system. For specific framework support:

1. **Check if it's already detected** - we support 1000+ technologies
2. **Submit to Wappa** - contribute to the underlying detection system
3. **Improve AI prompts** - help make recommendations more framework-specific

### I found incorrect information

Please help us improve:

1. **GitHub Issues**: Report factual errors or outdated information
2. **Community Discussions**: Discuss best practices and recommendations
3. **Documentation PRs**: Submit corrections directly

## 📞 Getting Help

### Where can I get support?

- **Documentation**: Check these docs first
- **Sentry Slack**: #webvitals channel for internal team support
- **GitHub Issues**: For bugs and technical problems
- **Team Sync**: Weekly engineering meetings for broader discussions

### How do I report a bug?

1. **Reproduce the issue** with specific steps
2. **Gather information**: browser, analyzed domain, error messages
3. **Check existing issues** to avoid duplicates
4. **Create a detailed GitHub issue** with reproduction steps
5. **Notify in Slack**: Tag the team in #webvitals for urgent issues

### Can I request new features?

Yes! Feature requests are handled internally:

1. **Create a GitHub issue** with the feature request template
2. **Describe the business case** - how does it support Sentry's goals?
3. **Provide technical details** - implementation considerations
4. **Discuss in team sync** - get engineering team input

Feature development is prioritized based on business impact and technical feasibility.

## 🗺️ Roadmap & Future Features

### What's on the development roadmap?

We're actively building several exciting features to make WebVitals.com the most comprehensive web performance platform:

#### **🔬 Enhanced Analysis**
- **In-depth Lighthouse Analysis**: Full synthetic testing with actionable recommendations beyond Core Web Vitals
- **Multi-page Site Analysis**: Scan entire sites, not just individual pages
- **Competitive Benchmarking**: Compare your performance against similar sites in your industry
- **Custom Performance Thresholds**: Set organization-specific targets beyond Google's recommendations

#### **📊 Data & Tracking**
- **Historical Data Tracking**: Monitor performance trends over time with charts and analytics
- **Performance Budgets**: Set limits with automated alerts when thresholds are exceeded
- **Regression Detection**: AI-powered alerts when performance significantly degrades
- **A/B Testing Integration**: Compare performance between different versions

#### **👥 Collaboration Features**
- **User Accounts**: Persist and track results across sessions
- **Team Collaboration**: Share analyses and track improvements across team members
- **Unique Shareable URLs**: Easy collaboration with stakeholders
- **Exportable PDF Reports**: Professional reports for presentations and documentation

#### **🔧 Developer Integration**
- **CI/CD Integration**: Automated performance checks in your deployment pipeline
- **GitHub Actions**: Pre-built workflows for continuous performance monitoring
- **API Access**: Full REST API for automation and custom integrations
- **AI Assistant Integration**: Planned MCP (Model Context Protocol) support for Claude, Cursor, and other AI coding assistants
- **Webhook Support**: Real-time notifications for performance changes

#### **🏢 Enterprise Features**
- **SSO Integration**: Enterprise authentication and user management
- **Custom Branding**: White-label reports and interface customization
- **Advanced Analytics**: Custom dashboards and detailed performance insights
- **SLA Monitoring**: Track performance against service level agreements

#### **🔌 Platform Integrations**
- **Sentry Deep Integration**: Seamless connection with Sentry performance monitoring
- **Slack Notifications**: Performance alerts and reports in team channels
- **Jira Integration**: Automatic ticket creation for performance issues
- **Popular Tool Integrations**: Connect with your existing development workflow

#### **📱 Mobile & Advanced Analysis**
- **Mobile-First Analysis**: Specialized insights for mobile performance optimization
- **Core Web Vitals Forecasting**: Predict future performance based on current trends
- **Resource Analysis**: Deep dive into asset optimization and third-party impact
- **Advanced Diagnostics**: Performance waterfall analysis and bottleneck identification

### When will these features be available?

We're following an iterative development approach:

- **Q1 2024**: Historical tracking, user accounts, enhanced Lighthouse analysis
- **Q2 2024**: Team collaboration, CI/CD integration, API access
- **Q3 2024**: Advanced analytics, competitive benchmarking, enterprise features
- **Q4 2024**: Mobile optimization, forecasting, advanced diagnostics

### How can I influence the roadmap?

We prioritize features based on:

1. **User Feedback**: Share your needs through GitHub issues or team discussions
2. **Business Impact**: Features that drive Sentry's performance monitoring goals
3. **Technical Feasibility**: Engineering effort and infrastructure requirements
4. **Market Demand**: Most requested features from the community

### Will existing features remain free?

Our goal is to keep core analysis features available while adding value through premium capabilities:

- **Always Free**: Basic Core Web Vitals analysis, AI recommendations, technology detection
- **Enhanced Features**: Historical data, team collaboration, advanced analytics
- **Enterprise**: Custom branding, SSO, advanced integrations, SLA monitoring

### How does this align with Sentry's vision?

WebVitals.com serves as the entry point for performance optimization, naturally leading to Sentry's comprehensive Real User Monitoring platform. This creates a complete performance monitoring ecosystem from initial analysis to ongoing production monitoring.
