import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import {
  convertToModelMessages,
  hasToolCall,
  stepCountIs,
  streamText,
} from "ai";
import { webAnalysisSystemPrompt } from "@/lib/system-prompts";
import { followUpActionsTool } from "@/tools/follow-up-actions-tool";
import { realWorldPerformanceTool } from "@/tools/real-world-performance-tool";
import { techDetectionTool } from "@/tools/tech-detection-tool";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, performanceConfig } = body;

    if (!messages || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    Sentry.logger.info("Chat request received", {
      messageCount: messages.length,
      hasPerformanceConfig: !!performanceConfig,
      devices: performanceConfig?.devices,
    });

    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o"),
      messages: modelMessages,
      stopWhen: [
        stepCountIs(10), // Safety limit
        ({ steps }) => {
          // Only stop after generateFollowUpActions is called in the CURRENT turn
          const lastStep = steps[steps.length - 1];
          const isCurrentStep = lastStep && steps.length > 0;
          const hasJustCalledFollowUp = lastStep?.toolCalls?.some(
            (call) => call.toolName === "generateFollowUpActions"
          );

          return isCurrentStep && hasJustCalledFollowUp;
        },
      ],
      tools: {
        getRealWorldPerformance: realWorldPerformanceTool,
        detectTechnologies: techDetectionTool,
        generateFollowUpActions: followUpActionsTool,
      },

      experimental_telemetry: {
        isEnabled: true,
        functionId: "pagespeed-analysis-chat",
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
      system: `${webAnalysisSystemPrompt}

Configuration: ${JSON.stringify(performanceConfig || {})}`,
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

    return Response.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
