# AI System

This directory contains the AI-powered components for web performance analysis.

## Structure

- **`artifacts/`** - Artifact definitions for streaming data to the UI
  - `follow-up-actions.ts` - Follow-up question generation artifact
  - `index.ts` - Exports all artifacts

- **`tools/`** - AI tools for data collection and analysis
  - `real-world-performance.ts` - CrUX real user metrics analysis
  - `tech-detection.ts` - Technology stack detection via Cloudflare
  - `index.ts` - Exports all tools

- **`context.ts`** - Typed context management for artifacts and tools
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

### Artifacts
Artifacts stream structured data to the UI after conversations complete:

```typescript
import { followUpActionsArtifact } from "@/ai/artifacts";

// In your client components
const followUpData = useArtifact(followUpActionsArtifact);
```

### Context
Context provides session information to tools and artifacts:

```typescript
import { setContext, getCurrentSession } from "@/ai/context";

// Set context in your API route
setContext({
  writer,
  sessionId: "session-123",
  analyzeUrl: "https://example.com",
});
```

## Architecture

The AI system follows a clean separation of concerns:

1. **Tools** collect raw data during conversations
2. **Artifacts** process and stream structured data to the UI
3. **Context** provides shared state across the system

This enables progressive enhancement where the main analysis completes first, followed by contextual enhancements like follow-up suggestions.

