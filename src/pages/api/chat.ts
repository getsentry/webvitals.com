import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  InvalidToolInputError,
  NoSuchToolError,
  stepCountIs,
  streamText,
  ToolCallRepairError,
} from "ai";
import type { APIRoute } from "astro";
import { pageSpeedTool } from "@/tools/pagespeed-tool";

// Allow streaming responses up to 60 seconds for Lighthouse analysis
export const maxDuration = 60;

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

    console.log("Chat request received with config:", pageSpeedConfig);
    console.log("Received messages:", JSON.stringify(messages, null, 2));

    // Convert UI messages to model messages
    const modelMessages = convertToModelMessages(messages);
    console.log(
      "Converted model messages:",
      JSON.stringify(modelMessages, null, 2)
    );

    const result = streamText({
      model: openai("gpt-4o"),
      messages: modelMessages,
      tools: {
        analyzePageSpeed: pageSpeedTool,
      },
      stopWhen: stepCountIs(2), // Tool call + analysis response
      onStepFinish: (step) => {
        console.log("Step finished:", {
          toolCalls: step.toolCalls?.length || 0,
          toolResults: step.toolResults?.length || 0,
          text: `${step.text?.slice(0, 100)}...`,
          hasToolCalls: !!step.toolCalls?.length,
          hasToolResults: !!step.toolResults?.length,
        });
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

    // Return streaming response that can handle tool calls and results
    // Try multiple methods for AI SDK compatibility
    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("Streaming error:", error);

        if (NoSuchToolError.isInstance(error)) {
          return "The model tried to call an unknown tool. Please try again.";
        }

        if (InvalidToolInputError.isInstance(error)) {
          return "The model called a tool with invalid inputs. Please provide a valid URL.";
        }

        if (ToolCallRepairError.isInstance(error)) {
          return "There was an error repairing the tool call. Please try again.";
        }

        return "An error occurred during analysis. Please try again.";
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

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
