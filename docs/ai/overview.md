# AI System Overview

WebVitals.com's AI system provides intelligent, context-aware web performance analysis using the Vercel AI SDK with OpenAI.

## 🏗️ Architecture

```
ai/
├── tools/              # Data collection and analysis tools
│   ├── real-world-performance.ts
│   ├── tech-detection.ts
│   └── analysis-breakdown.ts
├── system-prompts.ts   # AI system prompts
└── index.ts            # Exports

app/api/
├── chat/               # Main analysis endpoint
└── follow-up-suggestions/  # Follow-up question generation
```

### Design Philosophy

- **Tool-First Analysis**: AI tools gather raw performance and technology data
- **Step-Based Orchestration**: Tools execute in controlled steps with conditional logic
- **Streaming Responses**: Real-time delivery for better UX
- **Graceful Degradation**: Fallbacks when data is unavailable

## 🔧 AI Tools

### Real World Performance Tool

Analyzes actual user performance using Chrome User Experience Report (CrUX):

```typescript
getRealWorldPerformance({
  url: string;
  devices?: Array<'mobile' | 'desktop'>;
}) → RealWorldPerformanceOutput
```

**Capabilities:**
- Fetches 28-day rolling CrUX data from Google PageSpeed Insights API
- Supports configurable device analysis (mobile, desktop, or both)
- Provides Sentry-style performance categorization (Good/Needs Improvement/Poor)
- Handles missing data gracefully

### Technology Detection Tool

Identifies website technologies using Cloudflare URL Scanner:

```typescript
detectTechnologies({
  url: string;
}) → TechDetectionOutput
```

**Capabilities:**
- Leverages Cloudflare's Wappa technology fingerprinting
- Detects frameworks, CMS, hosting, CDN, analytics, and more
- Provides confidence scores for each detected technology

### Analysis Breakdown Tool

Generates structured analysis from collected data:

```typescript
generateAnalysisBreakdown({
  performanceData: RealWorldPerformanceOutput;
  technologyData: TechDetectionOutput;
}) → AnalysisBreakdown
```

**Output:**
- Overview summary
- 2-5 prioritized analysis points with severity levels
- Recommended next step

## 🔄 Tool Orchestration

Tools execute in a step-based flow controlled by `prepareStep`:

```typescript
const stream = createUIMessageStream({
  execute: async ({ writer }) => {
    const result = streamText({
      model: openai("gpt-4o"),
      messages: await convertToModelMessages(messages),
      stopWhen: [stepCountIs(2), stopWhenNoData],
      tools,
      prepareStep: ({ stepNumber, steps }) => {
        // Step 0: Data collection tools only
        if (stepNumber === 0) {
          return {
            activeTools: ["getRealWorldPerformance", "detectTechnologies"],
          };
        }
        // Step 1: Analysis breakdown (only if performance data exists)
        if (stepNumber === 1 && steps[0]) {
          if (!hasValidPerformanceData(steps[0])) {
            return { activeTools: [] };
          }
          return { activeTools: ["generateAnalysisBreakdown"] };
        }
        return {};
      },
    });
    writer.merge(result.toUIMessageStream());
  },
});
```

**Step Flow:**
1. **Step 0**: `getRealWorldPerformance` and `detectTechnologies` run in parallel
2. **Step 1**: `generateAnalysisBreakdown` runs only if performance data exists
3. **Stop Conditions**: Stops after 2 steps OR if no performance data available

## 🎯 Follow-up Suggestions

A separate endpoint generates contextual follow-up questions:

**Endpoint:** `POST /api/follow-up-suggestions`

**Request:**
```typescript
{
  performanceData: RealWorldPerformanceOutput;
  technologyData: TechDetectionOutput;
  conversationHistory: Array<{ role: string; content: string }>;
  url?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  actions: Array<{
    id: string;
    title: string;
  }>;
  url: string | null;
  generatedAt: string;
}
```

Uses OpenAI's Structured Outputs via `generateObject` with a Zod schema.

## 🔍 Error Handling

### Tool Failures
- Performance and tech detection run via `Promise.allSettled`
- Individual failures don't block the entire analysis
- `hasData: false` signals when CrUX data is unavailable

### Follow-up Fallbacks
If AI generation fails, returns static fallback suggestions:
```typescript
const fallbackActions = [
  { id: "sentry-rum-setup", title: "How do I set up Sentry RUM?" },
  { id: "performance-basics", title: "What are Core Web Vitals?" },
  // ...
];
```

## 📊 Monitoring

### Sentry Integration
- Tool execution tracking with custom spans
- Performance metrics via `Sentry.metrics`
- Structured logging via `Sentry.logger`
- Error capture with rich context

### AI SDK Telemetry
```typescript
experimental_telemetry: {
  isEnabled: true,
  functionId: "pagespeed-analysis-chat",
  recordInputs: true,
  recordOutputs: true,
}
```
