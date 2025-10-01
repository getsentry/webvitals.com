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

    const tools = {
      getRealWorldPerformance: realWorldPerformanceTool,
      detectTechnologies: techDetectionTool,
      generateAnalysisBreakdown: analysisBreakdownTool,
    } satisfies ToolSet;

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
      execute: ({ writer }) => {
        const result = streamText({
          model: openai("gpt-4o"),
          messages: convertToModelMessages(messages),
          stopWhen: [stepCountIs(2), stopWhenNoData],
          tools,
          prepareStep: ({ stepNumber, steps }) => {
            // Step 0: Only allow data collection tools
            if (stepNumber === 0) {
              return {
                activeTools: ["getRealWorldPerformance", "detectTechnologies"],
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
