# API Overview

WebVitals.com provides a clean, RESTful API built on Next.js App Router for web performance analysis and AI-powered insights.

## 🏗️ Architecture

### API Structure
```
app/api/
└── chat/
    └── route.ts      # Main AI analysis endpoint
```

### Technology Stack
- **Framework**: Next.js 15 App Router
- **Runtime**: Node.js 22.x
- **Streaming**: AI SDK with OpenAI integration
- **Validation**: Zod schema validation
- **Monitoring**: Sentry error tracking and performance monitoring

## 🚀 Core Endpoint

### POST `/api/chat`

The primary endpoint for AI-powered web performance analysis.

#### Request Format

```typescript
interface ChatRequest {
  messages: UIMessage[];           // Conversation history
  performanceConfig?: {            // Analysis configuration
    devices: Array<'mobile' | 'desktop'>;
    includeOriginData?: boolean;
  };
}
```

#### Example Request

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'user',
        parts: [{ type: 'text', text: 'Please analyze vercel.com' }],
      }
    ],
    performanceConfig: {
      devices: ['mobile', 'desktop'],
      includeOriginData: true,
    }
  }),
});
```

#### Response Format

The endpoint returns a streaming response using the AI SDK's `UIMessageStreamResponse` format:

```typescript
interface StreamingResponse {
  // Streaming text analysis
  text: string;                    // AI analysis content
  
  // Tool executions
  toolCalls?: Array<{
    toolName: 'getRealWorldPerformance' | 'detectTechnologies';
    args: Record<string, unknown>;
    result: unknown;
  }>;
  
  // Follow-up artifacts (streamed after main response)
  artifacts?: Array<{
    type: 'follow-up-actions';
    data: FollowUpActionsData;
  }>;
}
```

#### Response Flow

1. **Initial Response**: Starts streaming immediately
2. **Tool Execution**: Runs performance and technology analysis in parallel
3. **Text Analysis**: AI streams analysis based on tool results
4. **Artifact Generation**: Follow-up actions streamed after main response
5. **Completion**: Stream ends with complete analysis

## 🔧 Tool Integration

### Real World Performance Tool

Fetches Chrome User Experience Report data:

```typescript
// Tool input
{
  url: string;                           // Domain to analyze
  devices?: Array<'mobile' | 'desktop'>; // Device configuration
}

// Tool output
{
  url: string;
  hasData: boolean;
  mobile?: PerformanceData;
  desktop?: PerformanceData;
}
```

### Technology Detection Tool

Identifies website technologies via Cloudflare:

```typescript
// Tool input
{
  url: string;  // Domain to analyze
}

// Tool output
{
  technologies: Array<{
    name: string;        // Technology name
    confidence: number;  // 0-100
    categories: string[]; // Technology categories
  }>;
}
```

## 📡 Streaming Implementation

### Server-Side Streaming

```typescript
// Using AI SDK's createUIMessageStream
const stream = createUIMessageStream({
  execute: ({ writer }) => {
    // Set up context for artifacts
    setContext({ writer, sessionId, analyzeUrl });

    // Execute main analysis with streaming
    const result = streamText({
      model: openai("gpt-4o"),
      tools: { getRealWorldPerformance, detectTechnologies },
      onFinish: async ({ steps }) => {
        // Generate follow-up artifacts after main response
        await generateFollowUpArtifacts(steps);
      }
    });

    writer.merge(result.toUIMessageStream());
  },
});

return createUIMessageStreamResponse({ stream });
```

### Client-Side Consumption

```typescript
import { useChat } from '@ai-sdk-tools/store';
import { useArtifact } from '@ai-sdk-tools/artifacts/client';

// Chat messages and streaming
const { messages, sendMessage, status } = useChat({
  api: '/api/chat',
});

// Follow-up artifacts
const followUpData = useArtifact(followUpActionsArtifact);
```

## 🛡️ Security & Validation

### Input Validation

```typescript
// Request validation using Zod
const requestSchema = z.object({
  messages: z.array(messageSchema),
  performanceConfig: z.object({
    devices: z.array(z.enum(['mobile', 'desktop'])),
    includeOriginData: z.boolean().optional(),
  }).optional(),
});
```

### Rate Limiting

- **API Key Management**: Secure handling of third-party API keys
- **Request Throttling**: Built-in rate limiting for external API calls
- **Error Boundaries**: Graceful degradation when APIs are unavailable

### Environment Security

```typescript
// Secure environment variable handling
const apiKeys = {
  google: process.env.GOOGLE_API_KEY,
  cloudflare: process.env.CLOUDFLARE_API_TOKEN,
  openai: process.env.OPENAI_API_KEY,
};

// Validation of required keys
if (!apiKeys.google) {
  throw new Error('Google API key is required');
}
```

## 📊 Error Handling

### Structured Error Responses

```typescript
// Error response format
{
  error: string;          // Human-readable error message
  details?: string;       // Technical error details
  code?: string;          // Error code for programmatic handling
  timestamp: string;      // ISO timestamp
}
```

### Common Error Scenarios

**Missing API Keys**
```json
{
  "error": "Configuration error",
  "details": "Google API key is required for performance analysis",
  "code": "MISSING_API_KEY"
}
```

**Invalid URL**
```json
{
  "error": "Invalid request",
  "details": "URL must be a valid domain or HTTP(S) URL",
  "code": "INVALID_URL"
}
```

**Tool Execution Failure**
```json
{
  "error": "Analysis failed",
  "details": "Unable to fetch performance data from Google PageSpeed API",
  "code": "TOOL_EXECUTION_FAILED"
}
```

## 📈 Monitoring & Observability

### Sentry Integration

```typescript
// Comprehensive error tracking
Sentry.captureException(error, {
  tags: {
    area: 'api-chat',
    endpoint: '/api/chat',
    tool: toolName,
  },
  contexts: {
    request: { method: 'POST', endpoint: '/api/chat' },
    ai: { model: 'gpt-4o', tool: toolName },
  },
});
```

### Performance Tracking

```typescript
// AI SDK telemetry
experimental_telemetry: {
  isEnabled: true,
  functionId: 'pagespeed-analysis-chat',
  recordInputs: true,
  recordOutputs: true,
}
```

### Logging Strategy

```typescript
// Structured logging with Sentry
Sentry.logger.info('Chat request received', {
  messageCount: messages.length,
  hasPerformanceConfig: !!performanceConfig,
  devices: performanceConfig?.devices,
});
```

## 🔄 API Versioning

### Current Version
- **Version**: v1 (implicit)
- **Stability**: Beta
- **Breaking Changes**: Communicated via changelog

### Future Versioning Strategy
- **Semantic Versioning**: Major.Minor.Patch
- **Backward Compatibility**: Maintained for at least 6 months
- **Deprecation Notices**: 3-month advance notice for breaking changes

## 🚀 Performance Optimization

### Caching Strategy

```typescript
// Response caching
const response = await fetch(apiUrl, {
  next: {
    revalidate: 3600, // 1 hour cache
    tags: [`crux:${strategy}:${url}`],
  },
});
```

### Parallel Execution

```typescript
// Concurrent tool execution
const result = streamText({
  tools: {
    getRealWorldPerformance: realWorldPerformanceTool,
    detectTechnologies: techDetectionTool,
  },
  // Tools execute in parallel automatically
});
```

### Response Optimization

- **Streaming**: Real-time response delivery
- **Compression**: Automatic response compression
- **CDN Integration**: Static asset optimization via Vercel Edge Network

