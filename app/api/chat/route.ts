import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { webAnalysisSystemPrompt } from "@/ai";
import {
  analysisBreakdownTool,
  realWorldPerformanceTool,
  techDetectionTool,
} from "@/ai/tools";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messages,
      performanceConfig,
    }: { messages: UIMessage[]; performanceConfig?: unknown } = body;

    if (!messages || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    Sentry.logger.info("Chat request received", {
      messageCount: messages.length,
      hasPerformanceConfig: !!performanceConfig,
    });

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const result = streamText({
          model: openai("gpt-4o"),
          messages: convertToModelMessages(messages),
          stopWhen: [stepCountIs(2)], // analysis breakdown tool is called after the initial tools and needs another step to complete.
          tools: {
            getRealWorldPerformance: realWorldPerformanceTool,
            detectTechnologies: techDetectionTool,
            generateAnalysisBreakdown: analysisBreakdownTool,
          },
          prepareStep: ({ steps }) => {
            // For step 2, check if we have meaningful performance data
            if (steps.length === 1) {
              const performanceResult = steps[0].toolResults?.find(
                (result, index) => {
                  const toolName = steps[0].toolCalls?.[index]?.toolName;
                  return toolName === "getRealWorldPerformance";
                },
              );

              // If no performance data available, disable the analysis breakdown tool
              if (
                performanceResult &&
                typeof performanceResult === "object" &&
                "hasData" in performanceResult &&
                !performanceResult.hasData
              ) {
                return {
                  activeTools: [
                    "getRealWorldPerformance",
                    "detectTechnologies",
                  ], // exclude generateAnalysisBreakdown
                };
              }
            }

            return {}; // Use default settings
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

                Sentry.logger.debug("Tool result", {
                  toolName,
                  result,
                });

                if (result && typeof result === "object" && "error" in result) {
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
          system: `${webAnalysisSystemPrompt}

Configuration: ${JSON.stringify(performanceConfig || {})}`,
        });

        writer.merge(result.toUIMessageStream());
      },
    });

    return createUIMessageStreamResponse({ stream });
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

    return Response.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
