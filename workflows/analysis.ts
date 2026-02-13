import { DurableAgent } from "@workflow/ai/agent";
import { anthropic } from "@workflow/ai/anthropic";
import * as Sentry from "@sentry/nextjs";
import {
  convertToModelMessages,
  stepCountIs,
  type StepResult,
  type ToolSet,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { getWritable } from "workflow";
import { webAnalysisSystemPrompt } from "@/ai";
import {
  analysisBreakdownTool,
  realWorldPerformanceTool,
  techDetectionTool,
} from "@/ai/tools";

const tools = {
  getRealWorldPerformance: realWorldPerformanceTool,
  detectTechnologies: techDetectionTool,
  generateAnalysisBreakdown: analysisBreakdownTool,
} satisfies ToolSet;

function hasValidPerformanceData<T extends ToolSet>(
  step: StepResult<T>,
): boolean {
  const performanceCall = step.toolCalls?.find(
    (call) => call.toolName === "getRealWorldPerformance",
  );
  if (!performanceCall) return false;

  const performanceResult = step.toolResults?.find(
    (result) => result.toolCallId === performanceCall.toolCallId,
  );
  if (!performanceResult) return false;

  if ("error" in performanceResult) return false;

  const output = performanceResult.output as
    | { hasData?: boolean }
    | undefined;
  return output?.hasData === true;
}

export async function analysisWorkflow(
  sanitizedMessages: UIMessage[],
  performanceConfig?: { devices?: string[] },
) {
  "use workflow";

  const writable = getWritable<UIMessageChunk>();

  let hasPerformanceData = false;
  let hasTechData = false;

  const agent = new DurableAgent({
    model: anthropic("claude-sonnet-4-5-20250929"),
    system: `${webAnalysisSystemPrompt}\n\nConfiguration: ${JSON.stringify(performanceConfig || {})}`,
    tools,
    experimental_telemetry: {
      isEnabled: true,
      functionId: "pagespeed-analysis-chat",
    },
  });

  await agent.stream({
    messages: await convertToModelMessages(sanitizedMessages),
    writable,
    stopWhen: [
      stepCountIs(2),
      ({ steps }) => {
        const firstStep = steps[0];
        return firstStep ? !hasValidPerformanceData(firstStep) : false;
      },
    ],
    prepareStep: ({ stepNumber, steps }) => {
      if (stepNumber === 0) {
        return {
          activeTools: [
            "getRealWorldPerformance",
            "detectTechnologies",
          ] as Array<keyof typeof tools>,
        };
      }

      if (stepNumber === 1 && steps[0]) {
        if (!hasValidPerformanceData(steps[0])) {
          return { activeTools: [] as Array<keyof typeof tools> };
        }
        return {
          activeTools: [
            "generateAnalysisBreakdown",
          ] as Array<keyof typeof tools>,
        };
      }

      return {};
    },
    onStepFinish: (step) => {
      Sentry.logger.debug("AI step finished", {
        toolCalls: step.toolCalls?.length || 0,
        toolResults: step.toolResults?.length || 0,
        toolNames: step.toolCalls?.map((call) => call.toolName) || [],
      });

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
              },
            );
          }
        });
      }
    },
    onFinish: () => {
      const outcome = hasPerformanceData
        ? hasTechData
          ? "success"
          : "partial"
        : "no_data";

      Sentry.metrics.count("webvitals.analysis.completed", 1, {
        attributes: { outcome },
      });

      Sentry.logger.info("Chat analysis completed (workflow)", {
        outcome,
        hasPerformanceData,
        hasTechData,
      });
    },
  });
}
