import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { generateObject } from "ai";
import { checkBotId } from "botid/server";
import { z } from "zod";

const followUpSuggestionsSchema = z.object({
  actions: z
    .array(
      z.object({
        id: z.string().describe("Unique identifier for the action"),
        title: z.string().describe("Clear, actionable follow-up question"),
      })
    )
    .min(3)
    .max(6)
    .describe("Array of 3-6 follow-up questions"),
  url: z.string().optional().describe("The analyzed URL if available"),
  basedOnTools: z
    .array(z.string())
    .optional()
    .default(["performance", "technology"])
    .describe("Tools used for analysis"),
});

export async function POST(request: Request) {
  const startTime = Date.now();

  // Only check BotId when running on Vercel (OIDC tokens are only available there)
  if (process.env.VERCEL_ENV === "production") {
    const botIdResult = await checkBotId();
    Sentry.logger.debug("BotID check result", {
      isBot: botIdResult.isBot,
      userAgent: request.headers.get("user-agent"),
    });
    if (botIdResult.isBot) {
      Sentry.logger.warn("BotID check failed", {
        isBot: botIdResult.isBot,
        userAgent: request.headers.get("user-agent"),
      });
      return new Response("Access Denied", { status: 403 });
    }
  }

  let requestData: {
    performanceData?: any;
    technologyData?: any;
    conversationHistory?: Array<{
      role: "user" | "assistant";
      content: string;
    }>;
    url?: string;
  } = {};

  return Sentry.startSpan(
    {
      name: "webvitals.ai.follow_up_suggestions",
      op: "function",
      attributes: {
        "webvitals.ai.model": "gpt-4o-mini",
        "http.method": "POST",
        "http.route": "/api/follow-up-suggestions",
      },
    },
    async (span) => {
      try {
        requestData = await request.json();
        const { performanceData, technologyData, conversationHistory, url } =
          requestData;

        span.setAttributes({
          "webvitals.ai.has_performance_data": !!performanceData,
          "webvitals.ai.has_technology_data": !!technologyData,
          "webvitals.ai.conversation_length": conversationHistory?.length || 0,
        });

        Sentry.logger.info("Follow-up suggestions request received", {
          hasPerformanceData: !!performanceData,
          hasTechnologyData: !!technologyData,
          conversationLength: conversationHistory?.length || 0,
          url,
        });

        // Sanitize conversation history to prevent prompt injection
        const sanitizedHistory = conversationHistory?.map((msg) => ({
          role: msg.role,
          // Remove control characters, limit length, trim whitespace
          content: msg.content
            // biome-ignore lint/suspicious/noControlCharactersInRegex: Intentionally removing control characters for security
            .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
            .slice(0, 2000)
            .trim(),
        }));

        // Build structured messages for better prompt isolation
        const systemPrompt = `You are analyzing web performance data and generating contextual follow-up questions.

Based on the provided performance data, technology stack, and conversation history, generate 3-6 SHORT, actionable follow-up questions that would be most valuable for the user to explore next.

Guidelines:
- Keep titles under 8-12 words maximum
- Be specific to actual performance issues found
- Consider the detected technology stack
- Avoid repeating covered topics from the conversation history
- Include one Sentry/RUM suggestion if not discussed
- Use simple, direct language

Examples of CONCISE follow-ups:
- "Fix slow mobile LCP?"
- "Reduce high CLS?"
- "Set up Sentry RUM tracking?"
- "Optimize React performance?"
- "Implement performance budgets?"
- "Track business impact?"
- "Compare RUM vs CrUX data?"`;

        const userPrompt = `PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

TECHNOLOGY DATA:
${JSON.stringify(technologyData, null, 2)}

${
  sanitizedHistory && sanitizedHistory.length > 0
    ? `CONVERSATION HISTORY:
${sanitizedHistory
  .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
  .join("\n\n")}

IMPORTANT: Review the conversation history carefully. DO NOT suggest topics that have already been discussed or questions that have been answered. Generate new, relevant follow-up questions that build on what hasn't been covered yet.`
    : ""
}`;

        const result = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: followUpSuggestionsSchema,
          system: systemPrompt,
          prompt: userPrompt,
          experimental_telemetry: {
            isEnabled: true,
            recordInputs: true,
            recordOutputs: true,
            functionId: "follow-up-suggestions-api",
          },
        });

        const durationMs = Date.now() - startTime;

        span.setAttributes({
          "webvitals.ai.actions_generated": result.object.actions.length,
          "webvitals.ai.duration_ms": durationMs,
          "webvitals.ai.success": true,
        });

        // Track AI generation latency
        Sentry.metrics.distribution(
          "webvitals.ai.followup_duration_ms",
          durationMs,
          {
            unit: "millisecond",
            attributes: {
              success: "true",
              actions_count: String(result.object.actions.length),
            },
          }
        );

        Sentry.logger.info("Follow-up suggestions generated successfully", {
          actionsCount: result.object.actions.length,
          url: result.object.url,
          durationMs,
        });

        return Response.json({
          success: true,
          ...result.object,
          generatedAt: new Date().toISOString(),
        });
      } catch (error) {
        const durationMs = Date.now() - startTime;

        span.setAttributes({
          "webvitals.ai.success": false,
          "webvitals.ai.duration_ms": durationMs,
          "webvitals.ai.error":
            error instanceof Error ? error.message : "Unknown",
        });

        // Track failed AI generation
        Sentry.metrics.distribution(
          "webvitals.ai.followup_duration_ms",
          durationMs,
          {
            unit: "millisecond",
            attributes: {
              success: "false",
            },
          }
        );

        Sentry.logger.error("Follow-up suggestions generation failed", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          errorType: error?.constructor?.name,
          durationMs,
        });

        Sentry.captureException(error, {
          tags: {
            area: "follow-up-suggestions",
            endpoint: "/api/follow-up-suggestions",
          },
          extra: {
            hasPerformanceData: !!requestData.performanceData,
            hasTechnologyData: !!requestData.technologyData,
            errorDetails:
              error instanceof Error ? error.message : String(error),
          },
        });

        // Return fallback suggestions (matching the original style)
        return Response.json({
          success: false,
          actions: [
            {
              id: "sentry-rum-setup",
              title:
                "How do I set up Sentry to track Real User Metrics for Core Web Vitals?",
            },
            {
              id: "performance-basics",
              title: "What are Core Web Vitals and why do they matter?",
            },
            {
              id: "optimization-tips",
              title: "What are the most important performance optimizations?",
            },
            {
              id: "business-impact",
              title: "What's the business impact of slow performance?",
            },
          ],
          url: requestData.url || "",
          basedOnTools: ["fallback"],
          generatedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}
