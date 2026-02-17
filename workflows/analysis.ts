import { DurableAgent } from "@workflow/ai/agent";
import { anthropic } from "@workflow/ai/anthropic";
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

export function hasValidPerformanceData<T extends ToolSet>(
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

  const output = performanceResult.output as { hasData?: boolean } | undefined;
  return output?.hasData === true;
}

export async function analysisWorkflow(
  sanitizedMessages: UIMessage[],
  performanceConfig?: { devices?: string[] },
) {
  "use workflow";

  const writable = getWritable<UIMessageChunk>();

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
    stopWhen: stepCountIs(2),
    prepareStep: ({ stepNumber }) => {
      if (stepNumber === 0) {
        return {
          toolChoice: "required" as const,
          activeTools: [
            "getRealWorldPerformance",
            "detectTechnologies",
          ] as Array<keyof typeof tools>,
        };
      }
      return {
        activeTools: ["generateAnalysisBreakdown"] as Array<
          keyof typeof tools
        >,
      };
    },
  });
}
