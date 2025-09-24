import { type BaseContext, createTypedContext } from "@ai-sdk-tools/artifacts";

// Define custom context type for our chat system
interface WebVitalsChatContext extends BaseContext {
  sessionId: string;
  analyzeUrl?: string;
}

// Create typed context helpers
const { setContext, getContext } = createTypedContext<WebVitalsChatContext>();

// Helper function to get current session context (can be used in artifacts)
export function getCurrentSession() {
  const context = getContext();
  return {
    sessionId: context.sessionId,
    analyzeUrl: context.analyzeUrl,
  };
}

export { setContext, getContext };
