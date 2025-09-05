# WebVitals.com - Product Specification

## Vision Statement
Create the most actionable web performance analysis tool that goes beyond scores to provide contextual, AI-powered recommendations for real improvement. Transform web vitals from confusing metrics into clear, implementable action items.

## Problem Statement
Current web performance tools (Lighthouse, Pingdom, GTMetrix) suffer from:
- **Score without substance**: Users get ratings but don't understand what to fix
- **Generic recommendations**: One-size-fits-all advice that doesn't consider tech stack
- **Analysis paralysis**: Too much data, not enough actionable insights
- **Disconnect from reality**: Synthetic testing vs. real user experience data
- **Educational gap**: Most developers don't deeply understand web vitals impact

## Core Value Proposition
**"From Score to Solution"** - The only web vitals tool that tells you exactly what to fix, how to fix it, and why it matters for your specific site.

---

## MVP Feature Set

### 1. Intelligent Site Analysis
**Input**: Domain URL  
**Output**: Comprehensive performance profile

#### Technical Components:
- **Google PageSpeed Insights**: Comprehensive performance analysis with real user data
- **Real User Experience**: Chrome UX Report field data from actual visitors
- **Lab Testing**: Synthetic analysis for controlled insights
- **Tech Stack Detection**: Framework, CMS, hosting platform identification
- **Architecture Analysis**: SPA vs MPA, SSR/SSG detection
- **Asset Analysis**: Bundle sizes, image optimization, third-party scripts
- **Performance Budget Assessment**: Against industry benchmarks

### 2. AI-Powered Contextual Recommendations
**Core Innovation**: Recommendations tailored to detected tech stack and site architecture

#### Recommendation Engine:
- **Framework-specific advice**: React vs Vue vs vanilla JS optimizations
- **Hosting-aware suggestions**: Vercel vs Netlify vs traditional hosting
- **Business context**: E-commerce vs content site vs SaaS priorities
- **Impact scoring**: High/Medium/Low effort vs impact matrix
- **Implementation guides**: Step-by-step instructions with code examples

### 3. Sentry Integration Pipeline
**Goal**: Bridge static analysis with real user monitoring

#### Workflow:
1. **Analysis Phase**: PageSpeed Insights + tech detection (real user + lab data)
2. **Integration Offer**: "Enhance monitoring with Sentry integration"
3. **Code Generation**: Custom Sentry snippet for their tech stack
4. **Monitoring Setup**: Web vitals tracking configuration
5. **Ongoing Insights**: Enhanced real user monitoring with Sentry

### 4. Educational Content System
**Concept**: Revive "Sentry Answers" for web performance

#### Content Strategy:
- **Problem-solution mapping**: Each detected issue links to fix guides
- **Tech stack specific tutorials**: "Optimizing Next.js for Core Web Vitals"
- **Case studies**: Before/after examples with real metrics
- **Interactive examples**: CodeSandbox demos of optimizations
- **Video walkthroughs**: Visual implementation guides

---

## User Journey

### Phase 1: Discovery
1. User enters domain on webvitals.com
2. Loading state with educational content about what's being analyzed
3. Results page with performance score + detected tech stack

### Phase 2: Understanding
1. **Performance Overview**: Visual dashboard of Core Web Vitals
2. **Issue Prioritization**: Top 3-5 most impactful problems
3. **Context Panel**: "Why this matters for your [detected site type]"

### Phase 3: Action
1. **Recommendation Cards**: Specific, implementable fixes
2. **Difficulty Rating**: Technical complexity assessment
3. **Expected Impact**: Predicted score improvements
4. **Implementation Guides**: Step-by-step instructions

### Phase 4: Monitoring (Sentry Integration)
1. **Real Data Offer**: "See how real users experience your site"
2. **One-click Setup**: Generated integration code
3. **Ongoing Dashboard**: Synthetic vs RUM comparison
4. **Alert System**: Performance regression notifications

---

## Technical Architecture

### Frontend (Astro + React) ✅ IMPLEMENTED
- [x] **Landing Page**: Hero section with gradient background and feature highlights
- [x] **Analysis Form**: Advanced input with PageSpeed Insights configuration options
- [x] **Component System**: shadcn/ui + custom components (Background, ThemeToggle)
- [x] **Interactive Elements**: React components with motion animations
- [x] **Responsive Design**: Mobile-first approach with TailwindCSS
- [ ] **Results Dashboard**: Interactive performance breakdown
- [ ] **Recommendation Engine**: Filterable, sortable improvement suggestions
- [ ] **Integration Guides**: Step-by-step implementation flows

### Backend Services ⏳ PARTIALLY IMPLEMENTED
- [x] **Analysis Engine**: Google PageSpeed Insights API integration with real user data
- [x] **AI Infrastructure**: OpenAI SDK integrated with comprehensive PageSpeed Insights support
- [ ] **Tech Stack Detection**: Framework and platform identification
- [ ] **AI Recommendation Service**: Context-aware suggestion generation
- [ ] **Sentry Integration API**: Custom snippet generation
- [ ] **Content Management**: Educational article system
- [x] **User Analytics**: Sentry tracking and profiling enabled

### Data Pipeline
```
Domain Input → PageSpeed Insights API → Real User Data + Lab Data → AI Processing → Recommendations → Sentry Setup → Enhanced Monitoring
```

---

## MVP Development Phases

### Phase 1: Foundation (Weeks 1-2) ✅ COMPLETED
**Goal**: Basic analysis and recommendation engine

#### Deliverables:
- [x] **Frontend Architecture**: Astro + React + TailwindCSS setup complete
- [x] **UI Foundation**: shadcn/ui components integrated with theme support
- [x] **PageSpeed Types**: Comprehensive TypeScript definitions for PageSpeed Insights API
- [x] **Input Interface**: Advanced prompt input with PageSpeed Insights configuration options
- [x] **Sentry Integration**: Error monitoring and analytics setup complete
- [x] **PageSpeed Integration**: Google PageSpeed Insights API with real user data extraction
- [ ] Tech stack detection (Wappalyzer integration)
- [ ] Basic recommendation engine
- [ ] Results dashboard UI
- [ ] 20 high-impact recommendation templates

#### Success Metrics:
- ✅ Modern frontend architecture established
- ✅ User input interface with PageSpeed Insights configuration complete
- ✅ Google PageSpeed Insights API integration with real user data
- ⏳ Analyze any domain and return actionable recommendations
- ⏳ Detect top 10 web frameworks/platforms accurately

### Phase 2: Intelligence (Weeks 3-4) 🔄 IN PROGRESS
**Goal**: AI-powered contextual recommendations with real user data

#### Deliverables:
- [x] **AI SDK Integration**: OpenAI integration ready via @ai-sdk/openai
- [x] **PageSpeed AI Integration**: Comprehensive analysis of field data, origin data, and lab data
- [ ] LLM integration for context-aware suggestions
- [ ] Framework-specific recommendation logic
- [ ] Impact/effort scoring system
- [ ] Implementation guide generation
- [ ] Educational content system

#### Success Metrics:
- ✅ AI infrastructure established
- ✅ Real user data analysis capabilities integrated
- ⏳ 90%+ relevant recommendations for detected tech stacks
- ⏳ Clear implementation instructions for all suggestions

### Phase 3: Integration (Weeks 5-6) 🟡 PARTIAL PROGRESS
**Goal**: Sentry integration and real user monitoring

#### Deliverables:
- [x] **Sentry Infrastructure**: @sentry/astro integration with client/server config
- [x] **Error Tracking**: Browser tracing and profiling enabled
- [ ] Sentry snippet generation for analyzed sites
- [ ] RUM vs synthetic data comparison
- [ ] Performance monitoring dashboard
- [ ] Alert system for regressions
- [ ] User account system

#### Success Metrics:
- ✅ Sentry monitoring infrastructure complete
- ⏳ One-click Sentry integration working for analyzed sites
- ⏳ Real user data flowing into dashboard

---

## Success Metrics

### User Engagement
- **Analysis Conversion**: % of visitors who analyze a domain
- **Recommendation Adoption**: % who implement suggested fixes
- **Sentry Integration**: % who set up monitoring
- **Return Usage**: % who re-analyze after changes

### Business Impact
- **Sentry Lead Generation**: Qualified prospects from integration flow
- **Content Engagement**: Educational article consumption
- **Community Building**: Social shares, bookmarks, references
- **Thought Leadership**: Industry recognition and citations

### Technical Excellence
- **Analysis Accuracy**: Precision of recommendations
- **Performance Impact**: Measured improvements from suggestions  
- **User Satisfaction**: NPS/feedback scores
- **System Reliability**: Uptime and analysis success rates

---

## Competitive Differentiation

| Feature | WebVitals.com | PageSpeed Insights | GTMetrix | Pingdom |
|---------|---------------|-------------------|----------|---------|
| Tech-aware recommendations | ✅ | ❌ | ❌ | ❌ |
| AI-powered insights | ✅ | ❌ | ❌ | ❌ |
| Implementation guides | ✅ | Limited | Limited | ❌ |
| Real user monitoring | ✅ | ❌ | Limited | ✅ |
| Framework-specific advice | ✅ | ❌ | ❌ | ❌ |
| Educational content | ✅ | Limited | ❌ | ❌ |

---

## Technical Considerations

### Performance Requirements
- **Analysis Speed**: < 30 seconds for complete site analysis
- **Scalability**: Handle 1000+ concurrent analyses
- **Reliability**: 99.9% uptime for critical analysis pipeline
- **Cost Efficiency**: Optimize Google API usage and caching strategies

### Security & Privacy
- **Data Handling**: No storage of sensitive site data
- **Sentry Integration**: Secure token generation and management
- **User Privacy**: GDPR compliance for EU users
- **Rate Limiting**: Prevent abuse of analysis endpoints

### Content Strategy
- **SEO Optimization**: Educational content drives organic traffic
- **Technical Accuracy**: Expert review of all recommendations
- **Framework Coverage**: Support for top 20 web technologies
- **Maintenance**: Regular updates for new web standards

---

## Current Implementation Status (Updated)

### ✅ Completed Features
1. **Modern Frontend Stack**
   - Astro 5.x with React 19 integration
   - TailwindCSS 4.x with utility-first styling
   - TypeScript with strict configuration
   - Biome for code formatting and linting

2. **UI Foundation**
   - Complete shadcn/ui component library
   - Theme system with dark/light mode support
   - Responsive design patterns
   - Motion animations for enhanced UX

3. **PageSpeed Insights Integration**
   - Comprehensive TypeScript types for PageSpeed Insights API
   - Configuration system for mobile/desktop strategies and analysis categories
   - Advanced input interface with visual configuration
   - URL validation and suggested domains
   - Real user experience data extraction from Chrome UX Report

4. **Monitoring Infrastructure**
   - Sentry integration for error tracking
   - Client-side browser tracing and session replay
   - Server-side error monitoring
   - Source map upload configuration

5. **Developer Experience**
   - Path mapping (@/* imports)
   - Vercel deployment adapter
   - Development command scripts
   - Git integration with proper .gitignore

### ✅ Recently Completed
1. **PageSpeed Insights API Integration**
   - Google PageSpeed Insights API implementation
   - Real user experience data extraction (field data)
   - Origin-wide performance data processing
   - Lab data integration for synthetic testing insights
   - Comprehensive data transformation and error handling

### ⏳ Upcoming Features
1. **Results Dashboard**
   - Interactive Core Web Vitals visualization
   - Performance score breakdown
   - Issue prioritization interface

2. **AI Recommendation Engine**
   - OpenAI integration for contextual suggestions
   - Framework-specific optimization advice
   - Implementation guides with code examples

3. **Tech Stack Detection**
   - Automated framework and platform identification
   - Architecture analysis (SPA/MPA, SSR/SSG)
   - Third-party script detection

---

This specification provides a roadmap for building a genuinely useful web performance tool that bridges the gap between analysis and action. The key innovation is combining static analysis with AI-powered contextual recommendations and seamless integration with real user monitoring through Sentry.

**Current Status**: Strong foundation established with modern frontend architecture, comprehensive UI components, and monitoring infrastructure. Ready for backend API implementation and AI-powered analysis features.