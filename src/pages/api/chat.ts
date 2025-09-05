import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/astro";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import type { APIRoute } from "astro";
import { pageSpeedTool } from "@/tools/pagespeed-tool";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages, pageSpeedConfig } = body;

    // Set process.env for AI SDK compatibility
    if (import.meta.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
      process.env.OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    Sentry.logger.info("Chat request received", {
      messageCount: messages.length,
      hasPageSpeedConfig: !!pageSpeedConfig,
      strategy: pageSpeedConfig?.strategy,
      categories: pageSpeedConfig?.categories,
    });

    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o"),
      messages: modelMessages,
      tools: {
        analyzePageSpeed: pageSpeedTool,
      },
      stopWhen: stepCountIs(2),
      experimental_telemetry: {
        isEnabled: true,
        functionId: "pagespeed-analysis-chat",
      },
      onStepFinish: (step) => {
        Sentry.logger.debug("AI step finished", {
          toolCalls: step.toolCalls?.length || 0,
          toolResults: step.toolResults?.length || 0,
          hasToolCalls: !!step.toolCalls?.length,
          hasToolResults: !!step.toolResults?.length,
        });

        if (step.toolResults) {
          step.toolResults.forEach((result, index) => {
            if ("error" in result) {

              Sentry.captureException(
                new Error(`Tool execution failed: ${result.error}`),
                {
                  tags: {
                    area: "ai-tool-execution",
                    function: "pagespeed-analysis-chat",
                    tool: step.toolCalls?.[index]?.toolName,
                  },
                  contexts: {
                    ai: {
                      model: "gpt-4o",
                      tool: step.toolCalls?.[index]?.toolName,
                      toolError: step.toolCalls?.[index]?.error,
                    },
                  },
                }
              );
            }
          });
        }
      },
      system: `You are a web performance expert assistant specializing in Google PageSpeed Insights analysis. When a user asks you to analyze a website:

1. Extract the domain/URL from their message
2. Use the analyzePageSpeed tool ONCE with the extracted URL and appropriate strategy (mobile/desktop)  
3. After receiving the tool result, analyze ALL THREE types of data provided by PageSpeed Insights:

   **FIELD DATA (Real Users - Most Important!):**
   - Real user experience from Chrome UX Report
   - Actual performance as experienced by users
   - Core Web Vitals categories (GOOD, NEEDS_IMPROVEMENT, POOR)

   **ORIGIN DATA (Domain-wide):**
   - Performance across the entire domain/origin
   - Broader context of site-wide performance patterns

   **LAB DATA (Synthetic Testing):**
   - Lighthouse scores and metrics
   - Controlled environment testing results
   - Specific optimization opportunities

4. Structure your response with these sections:
   - **Real User Experience** (field data) - prioritize this as most valuable
   - **Domain Performance Overview** (origin data) if available
   - **Lab Testing Results** (synthetic data)
   - **Key Recommendations** based on all data types
   - **Core Web Vitals Explanation** in user-friendly terms

5. Prioritize insights from real user data over lab data when they differ
6. Explain the difference between real user experience and lab testing
7. Provide actionable recommendations based on the comprehensive analysis

IMPORTANT: Only call the analyzePageSpeed tool ONCE per analysis request. Do not make multiple tool calls.

Configuration: ${JSON.stringify(pageSpeedConfig || {})}`,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    Sentry.logger.error("Chat API error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    Sentry.captureException(error, {
      tags: {
        area: "api-chat",
        endpoint: "/api/chat",
      },
      contexts: {
        request: {
          method: "POST",
          endpoint: "/api/chat",
        },
      },
    });

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
