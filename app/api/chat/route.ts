import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
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

// Extract domain from user message for instrumentation
function extractDomainFromMessages(messages: UIMessage[]): string | null {
  const userMessage = messages.find((m) => m.role === "user");
  if (!userMessage?.parts) return null;

  const textPart = userMessage.parts.find(
    (p) => p.type === "text" && "text" in p
  );
  if (!textPart || !("text" in textPart)) return null;

  // Extract domain from "Please analyze <domain>" pattern
  const match = (textPart.text as string).match(
    /analyze\s+(?:https?:\/\/)?([^\s/]+)/i
  );
  return match?.[1] || null;
}

export async function POST(request: Request) {
  const analysisStartTime = Date.now();

  // Only check BotId when running on Vercel (OIDC tokens are only available there)
  if (process.env.VERCEL) {
    const { isBot } = await checkBotId();
    if (isBot) {
      return new Response("Access Denied", { status: 403 });
    }
  }

  return Sentry.startSpan(
    {
      name: "webvitals.analysis",
      op: "http.server",
      attributes: {
        "http.method": "POST",
        "http.route": "/api/chat",
      },
    },
    async (span) => {
      // Track tool execution results for completion metrics
      let hasPerformanceData = false;
      let hasTechData = false;
      let hasBreakdown = false;
      let analysisOutcome: "success" | "partial" | "no_data" | "failed" =
        "failed";

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
            { status: 400 }
          );
        }

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

        // Extract domain for instrumentation
        const analyzedDomain = extractDomainFromMessages(sanitizedMessages);
        const devices =
          performanceConfig?.devices?.join(",") || "mobile,desktop";

        // Set span attributes
        span.setAttributes({
          "webvitals.domain": analyzedDomain || "unknown",
          "webvitals.devices": devices,
          "webvitals.message_count": sanitizedMessages.length,
        });

        // Track analysis started
        Sentry.metrics.count("webvitals.analysis.started", 1, {
          attributes: {
            has_config: String(!!performanceConfig),
            devices,
          },
        });

        Sentry.logger.info("Analysis pipeline started", {
          messageCount: sanitizedMessages.length,
          hasPerformanceConfig: !!performanceConfig,
          domain: analyzedDomain,
          devices,
        });

        const tools = {
          getRealWorldPerformance: realWorldPerformanceTool,
          detectTechnologies: techDetectionTool,
          generateAnalysisBreakdown: analysisBreakdownTool,
        } satisfies ToolSet;

        // Check if performance data is valid (not errored and has data)
        const hasValidPerformanceData = (step: StepResult<typeof tools>) => {
          const performanceCall = step.toolCalls?.find(
            (call) => call.toolName === "getRealWorldPerformance"
          );
          if (!performanceCall) return false;

          const performanceResult = step.toolResults?.find(
            (result) => result.toolCallId === performanceCall.toolCallId
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
          execute: ({ writer }) => {
            const result = streamText({
              model: openai("gpt-4o"),
              messages: convertToModelMessages(sanitizedMessages),
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

                if (step.toolResults) {
                  step.toolResults.forEach((result: unknown, index) => {
                    const toolName = step.toolCalls?.[index]?.toolName;

                    // Track which tools completed successfully
                    if (
                      result &&
                      typeof result === "object" &&
                      !("error" in result)
                    ) {
                      if (toolName === "getRealWorldPerformance") {
                        const perfResult = result as { hasData?: boolean };
                        hasPerformanceData = perfResult.hasData === true;
                      } else if (toolName === "detectTechnologies") {
                        hasTechData = true;
                      } else if (toolName === "generateAnalysisBreakdown") {
                        hasBreakdown = true;
                      }
                    }

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
                          `Tool execution failed: ${String(errorResult.error)}`
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
                        }
                      );
                    }
                  });
                }
              },
              onFinish: () => {
                const durationMs = Date.now() - analysisStartTime;

                // Determine outcome
                if (hasPerformanceData && hasBreakdown) {
                  analysisOutcome = "success";
                } else if (hasPerformanceData || hasTechData) {
                  analysisOutcome = "partial";
                } else {
                  analysisOutcome = "no_data";
                }

                // Log completion
                Sentry.logger.info("Analysis pipeline completed", {
                  domain: analyzedDomain,
                  durationMs,
                  outcome: analysisOutcome,
                  hasPerformanceData,
                  hasTechData,
                  hasBreakdown,
                });

                // Track completion metric
                Sentry.metrics.count("webvitals.analysis.completed", 1, {
                  attributes: {
                    outcome: analysisOutcome,
                    devices,
                    has_performance_data: String(hasPerformanceData),
                    has_tech_data: String(hasTechData),
                  },
                });

                // Track duration distribution
                Sentry.metrics.distribution(
                  "webvitals.analysis.duration_ms",
                  durationMs,
                  {
                    unit: "millisecond",
                    attributes: {
                      outcome: analysisOutcome,
                    },
                  }
                );

                span.setAttributes({
                  "webvitals.outcome": analysisOutcome,
                  "webvitals.has_performance_data": hasPerformanceData,
                  "webvitals.has_tech_data": hasTechData,
                  "webvitals.duration_ms": durationMs,
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
        analysisOutcome = "failed";

        Sentry.logger.error("Chat API error", {
          error: error instanceof Error ? error.message : "Unknown error",
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

        // Track failed analysis
        Sentry.metrics.count("webvitals.analysis.completed", 1, {
          attributes: {
            outcome: "failed",
          },
        });

        span.setAttributes({
          "webvitals.outcome": "failed",
          "webvitals.duration_ms": durationMs,
        });

        return Response.json(
          {
            error: "Failed to process chat request",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }
  );
}
