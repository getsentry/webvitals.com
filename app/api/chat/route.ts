import * as Sentry from "@sentry/nextjs";
import { anthropic } from "@ai-sdk/anthropic";
import type { StepResult } from "ai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type StopCondition,
  stepCountIs,
  streamText,
  type ToolSet,
  type UIMessage,
} from "ai";
import { checkBotId } from "botid/server";
import { webAnalysisSystemPrompt } from "@/ai";
import {
  analysisBreakdownTool,
  realWorldPerformanceTool,
  techDetectionTool,
} from "@/ai/tools";

export async function POST(request: Request) {
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

  const analysisStartTime = Date.now();

  // Extract domain from first message for span attributes
  let analyzedDomain = "unknown";
  let devices = "unknown";

  return Sentry.startSpan(
    {
      name: "webvitals.analysis",
      op: "analysis.request",
      attributes: {
        "http.method": "POST",
        "http.route": "/api/chat",
      },
    },
    async (span) => {
      let outcome: "success" | "partial" | "no_data" | "failed" = "failed";

      try {
        const body = await request.json();
        const {
          messages,
          performanceConfig,
        }: {
          messages: UIMessage[];
          performanceConfig?: { devices?: string[] };
        } = body;

        if (!messages || messages.length === 0) {
          return Response.json(
            { error: "No messages provided" },
            { status: 400 },
          );
        }

        // Extract domain from first user message
        const firstUserMessage = messages.find((m) => m.role === "user");
        if (firstUserMessage?.parts) {
          const textPart = firstUserMessage.parts.find(
            (p) => p.type === "text" && "text" in p,
          );
          if (textPart && "text" in textPart) {
            // Try to extract domain from message
            const domainMatch = (textPart.text as string).match(
              /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+)/,
            );
            if (domainMatch) {
              analyzedDomain = domainMatch[1];
            }
          }
        }

        devices = performanceConfig?.devices?.join(",") || "mobile,desktop";

        span.setAttributes({
          "webvitals.domain": analyzedDomain,
          "webvitals.devices": devices,
          "webvitals.message_count": messages.length,
        });

        // Sanitize messages to prevent prompt injection
        const sanitizedMessages = messages.map((msg) => ({
          ...msg,
          parts: msg.parts?.map((part) => {
            if (part.type === "text" && "text" in part) {
              return {
                ...part,
                text:
                  typeof part.text === "string"
                    ? part.text
                        // biome-ignore lint/suspicious/noControlCharactersInRegex: Intentionally removing control characters for security
                        .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
                        .slice(0, 5000) // Limit to reasonable length
                        .trim()
                    : part.text,
              };
            }
            return part;
          }),
        }));

        Sentry.logger.info("Chat analysis started", {
          domain: analyzedDomain,
          devices,
          messageCount: sanitizedMessages.length,
          hasPerformanceConfig: !!performanceConfig,
        });

        const tools = {
          getRealWorldPerformance: realWorldPerformanceTool,
          detectTechnologies: techDetectionTool,
          generateAnalysisBreakdown: analysisBreakdownTool,
        } satisfies ToolSet;

        // Track if we got valid performance data
        let hasPerformanceData = false;
        let hasTechData = false;

        // Check if performance data is valid (not errored and has data)
        const hasValidPerformanceData = (step: StepResult<typeof tools>) => {
          const performanceCall = step.toolCalls?.find(
            (call) => call.toolName === "getRealWorldPerformance",
          );
          if (!performanceCall) return false;

          const performanceResult = step.toolResults?.find(
            (result) => result.toolCallId === performanceCall.toolCallId,
          );
          if (!performanceResult) return false;

          // Check if tool errored
          if ("error" in performanceResult) return false;

          // Check if has performance data
          const output = performanceResult.output as
            | { hasData?: boolean }
            | undefined;
          return output?.hasData === true;
        };

        const stopWhenNoData: StopCondition<typeof tools> = ({ steps }) => {
          // Stop after step 0 completes if performance tool errored or has no data
          const firstStep = steps[0];
          if (firstStep) {
            return !hasValidPerformanceData(firstStep);
          }
          return false;
        };

        const stream = createUIMessageStream({
          execute: async ({ writer }) => {
            const result = streamText({
              model: anthropic("claude-sonnet-4-5-20250929"),
              messages: await convertToModelMessages(sanitizedMessages),
              stopWhen: [stepCountIs(2), stopWhenNoData],
              tools,
              prepareStep: ({ stepNumber, steps }) => {
                // Step 0: Only allow data collection tools
                if (stepNumber === 0) {
                  return {
                    activeTools: [
                      "getRealWorldPerformance",
                      "detectTechnologies",
                    ],
                  };
                }

                // Step 1: Only allow analysis breakdown if we have performance data (tech detection is optional)
                if (stepNumber === 1 && steps[0]) {
                  if (!hasValidPerformanceData(steps[0])) {
                    return { activeTools: [] };
                  }
                  return { activeTools: ["generateAnalysisBreakdown"] };
                }

                return {};
              },
              experimental_telemetry: {
                isEnabled: true,
                functionId: "pagespeed-analysis-chat",
                recordInputs: true,
                recordOutputs: true,
              },
              onStepFinish: (step) => {
                Sentry.logger.debug("AI step finished", {
                  toolCalls: step.toolCalls?.length || 0,
                  toolResults: step.toolResults?.length || 0,
                  toolNames: step.toolCalls?.map((call) => call.toolName) || [],
                });

                // Track data collection outcomes
                if (step.toolCalls) {
                  for (const call of step.toolCalls) {
                    if (call.toolName === "getRealWorldPerformance") {
                      const result = step.toolResults?.find(
                        (r) => r.toolCallId === call.toolCallId,
                      );
                      if (result && !("error" in result)) {
                        const output = result.output as
                          | { hasData?: boolean }
                          | undefined;
                        hasPerformanceData = output?.hasData === true;
                      }
                    }
                    if (call.toolName === "detectTechnologies") {
                      const result = step.toolResults?.find(
                        (r) => r.toolCallId === call.toolCallId,
                      );
                      hasTechData = !!(result && !("error" in result));
                    }
                  }
                }

                if (step.toolResults) {
                  step.toolResults.forEach((result: unknown, index) => {
                    const toolName = step.toolCalls?.[index]?.toolName;

                    Sentry.logger.debug("Tool result", {
                      toolName,
                      result,
                    });

                    if (
                      result &&
                      typeof result === "object" &&
                      "error" in result
                    ) {
                      const errorResult = result as { error: unknown };
                      Sentry.captureException(
                        new Error(
                          `Tool execution failed: ${String(errorResult.error)}`,
                        ),
                        {
                          tags: {
                            area: "ai-tool-execution",
                            function: "pagespeed-analysis-chat",
                            tool: toolName,
                          },
                          contexts: {
                            ai: {
                              model: "gpt-4o",
                              tool: toolName,
                              toolError: step.toolCalls?.[index]?.error,
                            },
                          },
                        },
                      );
                    }
                  });
                }
              },
              onFinish: () => {
                // Determine outcome based on what data we collected
                if (hasPerformanceData) {
                  outcome = hasTechData ? "success" : "partial";
                } else {
                  outcome = "no_data";
                }

                const durationMs = Date.now() - analysisStartTime;

                span.setAttributes({
                  "webvitals.outcome": outcome,
                  "webvitals.has_performance_data": hasPerformanceData,
                  "webvitals.has_tech_data": hasTechData,
                  "webvitals.duration_ms": durationMs,
                });

                // Track analysis completion metrics
                Sentry.metrics.count("webvitals.analysis.completed", 1, {
                  attributes: {
                    domain: analyzedDomain,
                    devices,
                    outcome,
                  },
                });

                Sentry.metrics.distribution(
                  "webvitals.analysis.duration_ms",
                  durationMs,
                  {
                    unit: "millisecond",
                    attributes: {
                      outcome,
                      has_performance_data: String(hasPerformanceData),
                      has_tech_data: String(hasTechData),
                    },
                  },
                );

                Sentry.logger.info("Chat analysis completed", {
                  domain: analyzedDomain,
                  devices,
                  outcome,
                  durationMs,
                  hasPerformanceData,
                  hasTechData,
                });
              },
              system: `${webAnalysisSystemPrompt}

Configuration: ${JSON.stringify(performanceConfig || {})}`,
            });

            writer.merge(result.toUIMessageStream());
          },
        });

        return createUIMessageStreamResponse({ stream });
      } catch (error) {
        const durationMs = Date.now() - analysisStartTime;

        span.setAttributes({
          "webvitals.outcome": "failed",
          "webvitals.duration_ms": durationMs,
          "webvitals.error": error instanceof Error ? error.message : "Unknown",
        });

        Sentry.metrics.count("webvitals.analysis.completed", 1, {
          attributes: {
            domain: analyzedDomain,
            devices,
            outcome: "failed",
          },
        });

        Sentry.metrics.distribution(
          "webvitals.analysis.duration_ms",
          durationMs,
          {
            unit: "millisecond",
            attributes: {
              outcome: "failed",
            },
          },
        );

        Sentry.logger.error("Chat API error", {
          error: error instanceof Error ? error.message : "Unknown error",
          domain: analyzedDomain,
          durationMs,
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

        return Response.json(
          {
            error: "Failed to process chat request",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    },
  );
}
