import { describe, expect, it } from "vitest";
import { DurableAgent } from "@workflow/ai/agent";
import { anthropic } from "@workflow/ai/anthropic";
import {
  convertToModelMessages,
  stepCountIs,
  type ToolSet,
  type UIMessageChunk,
} from "ai";
import { webAnalysisSystemPrompt } from "@/ai";
import {
  analysisBreakdownTool,
  realWorldPerformanceTool,
  techDetectionTool,
} from "@/ai/tools";
import { hasValidPerformanceData } from "@/workflows/analysis";

const tools = {
  getRealWorldPerformance: realWorldPerformanceTool,
  detectTechnologies: techDetectionTool,
  generateAnalysisBreakdown: analysisBreakdownTool,
} satisfies ToolSet;

/**
 * Collect UIMessageChunks from a DurableAgent into a WritableStream.
 */
function createChunkCollector() {
  const chunks: UIMessageChunk[] = [];
  const writable = new WritableStream<UIMessageChunk>({
    write(chunk) {
      chunks.push(chunk);
    },
  });
  return { chunks, writable };
}

describe("DurableAgent analysis workflow (E2E)", () => {
  /**
   * BUG DOCUMENTATION: With the original prepareStep that checks
   * hasValidPerformanceData(steps[0]), DurableAgent never calls breakdown.
   *
   * Root cause: DurableAgent's StepResult.toolResults is always [],
   * so hasValidPerformanceData() always returns false, disabling the breakdown tool.
   *
   * This test uses the FIXED prepareStep (no hasValidPerformanceData check),
   * verifying the model calls all 3 tools.
   */
  it(
    "calls all 3 tools and streams outputs for sentry.io",
    async () => {
      const { chunks, writable } = createChunkCollector();

      const agent = new DurableAgent({
        model: anthropic("claude-sonnet-4-5-20250929"),
        system: webAnalysisSystemPrompt,
        tools,
        experimental_telemetry: {
          isEnabled: true,
          functionId: "pagespeed-analysis-e2e-test",
        },
      });

      const result = await agent.stream({
        messages: await convertToModelMessages([
          {
            role: "user" as const,
            parts: [{ type: "text" as const, text: "Please analyze sentry.io" }],
          },
        ]),
        writable,
        stopWhen: stepCountIs(2),
        prepareStep: ({ stepNumber }) => {
          // FIXED: no hasValidPerformanceData check
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
        onStepFinish: (step) => {
          const toolNames = step.toolCalls.map((c) => c.toolName);
          console.log(
            `  Step: tools=[${toolNames.join(", ")}] ` +
              `toolResults=${step.toolResults.length} ` +
              `in=${step.usage.inputTokens} out=${step.usage.outputTokens}`,
          );

          // Document the DurableAgent behavior
          if (step.toolResults.length === 0 && step.toolCalls.length > 0) {
            console.log(
              "  ⚠ DurableAgent toolResults is empty (expected in workflow runtime)",
            );
          }
        },
      });

      // Verify steps ran
      expect(result.steps.length).toBeGreaterThanOrEqual(2);

      // Step 0: perf + tech
      const step0Tools = result.steps[0].toolCalls.map((c) => c.toolName);
      expect(step0Tools).toContain("getRealWorldPerformance");
      expect(step0Tools).toContain("detectTechnologies");

      // Step 1: breakdown (KEY assertion — this fails with the old prepareStep)
      const step1Tools = result.steps[1].toolCalls.map((c) => c.toolName);
      expect(step1Tools).toContain("generateAnalysisBreakdown");

      // Verify chunks were streamed
      const toolInputChunks = chunks.filter(
        (c) => c.type === "tool-input-available",
      );
      const toolNames = toolInputChunks.map(
        (c) => (c as { toolName: string }).toolName,
      );
      expect(toolNames).toContain("getRealWorldPerformance");
      expect(toolNames).toContain("detectTechnologies");
      expect(toolNames).toContain("generateAnalysisBreakdown");

      // Validate breakdown output from chunks
      const toolOutputChunks = chunks.filter(
        (c) => c.type === "tool-output-available",
      );
      const breakdownInput = toolInputChunks.find(
        (c) => (c as { toolName: string }).toolName === "generateAnalysisBreakdown",
      );
      const breakdownOutput = toolOutputChunks.find(
        (c) =>
          (c as { toolCallId: string }).toolCallId ===
          (breakdownInput as { toolCallId: string })?.toolCallId,
      );
      expect(breakdownOutput).toBeDefined();

      const output = (breakdownOutput as { output: Record<string, unknown> })
        .output;
      expect(output).toHaveProperty("overview");
      expect(output).toHaveProperty("points");
      expect(
        (output.points as Array<{ severity: string }>).length,
      ).toBeGreaterThanOrEqual(2);
      for (const point of output.points as Array<{ severity: string }>) {
        expect(["critical", "warning", "info"]).toContain(point.severity);
      }

      // Log text output length
      const textLength = chunks
        .filter((c) => c.type === "text-delta")
        .map((c) => (c as { delta: string }).delta)
        .join("").length;
      console.log(`  Text output: ${textLength} chars`);
    },
    180_000,
  );

  /**
   * Demonstrate that the old prepareStep logic fails when toolResults is empty.
   * This is a unit-level assertion proving the root cause.
   */
  it("documents bug: hasValidPerformanceData returns false with empty toolResults", () => {
    // Simulate what DurableAgent produces: toolCalls present, toolResults empty
    const fakeStep = {
      content: [],
      text: "",
      reasoning: [],
      reasoningText: undefined,
      files: [],
      sources: [],
      toolCalls: [
        {
          type: "tool-call" as const,
          toolCallId: "call-1",
          toolName: "getRealWorldPerformance",
          input: { url: "https://sentry.io" },
        },
      ],
      staticToolCalls: [],
      dynamicToolCalls: [],
      toolResults: [], // DurableAgent bug: always empty
      staticToolResults: [],
      dynamicToolResults: [],
      finishReason: "stop" as const,
      rawFinishReason: undefined,
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      warnings: [],
      providerMetadata: undefined,
      request: {},
      response: {},
    };

    // This proves the bug: even though toolCalls has the performance call,
    // toolResults is empty so hasValidPerformanceData returns false
    expect(hasValidPerformanceData(fakeStep as any)).toBe(false);
  });
});
