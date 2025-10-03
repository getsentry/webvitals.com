# AI System

This directory contains the AI-powered components for web performance analysis.

## Structure

- **`tools/`** - AI tools for data collection and analysis
  - `real-world-performance.ts` - CrUX real user metrics analysis
  - `tech-detection.ts` - Technology stack detection via Cloudflare
  - `index.ts` - Exports all tools

- **`system-prompts.ts`** - System prompts for AI agent behavior
- **`index.ts`** - Main exports for the AI system

## Usage

### Tools
Tools are used by the AI agent to gather data during conversations:

```typescript
import { realWorldPerformanceTool, techDetectionTool } from "@/ai/tools";

// In your streamText configuration
tools: {
  getRealWorldPerformance: realWorldPerformanceTool,
  detectTechnologies: techDetectionTool,
}
```

### System Prompts
Use consistent system prompts for AI agent behavior:

```typescript
import { webAnalysisSystemPrompt } from "@/ai/system-prompts";

// In your streamText configuration
system: webAnalysisSystemPrompt,
```

### Follow-up Suggestions
Follow-up suggestions are generated via a dedicated API endpoint after analysis completes:

```typescript
// POST /api/follow-up-suggestions
{
  performanceData,
  technologyData, 
  conversationHistory,
  url
}
```

The component automatically calls this endpoint when analysis data becomes available.

## Architecture

The AI system follows a clean separation of concerns:

1. **Tools** collect raw data during conversations
2. **Follow-up API** generates contextual questions via separate endpoint
3. **System Prompts** provide consistent AI behavior

This enables a clean chat experience where analysis completes first, followed by contextual follow-up suggestions generated separately.

## Chat Flow

1. User submits URL for analysis
2. AI agent runs performance and technology tools
3. Agent provides analysis text response
4. Frontend component detects completed tools and calls follow-up API
5. Follow-up suggestions appear after analysis is complete