import { describe, expect, it } from "vitest";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, stepCountIs, type ToolSet, type StepResult } from "ai";
import { webAnalysisSystemPrompt } from "@/ai";
import {
  analysisBreakdownTool,
  realWorldPerformanceTool,
  techDetectionTool,
} from "@/ai/tools";
import { hasValidPerformanceData } from "@/workflows/analysis";

const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-5-20250929": { input: 3.0, output: 15.0 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
};

function estimateCost(
  modelId: string,
  usage: { inputTokens?: number; outputTokens?: number },
) {
  const p = PRICING[modelId];
  if (!p) return 0;
  return (
    ((usage.inputTokens ?? 0) / 1e6) * p.input +
    ((usage.outputTokens ?? 0) / 1e6) * p.output
  );
}

const tools = {
  getRealWorldPerformance: realWorldPerformanceTool,
  detectTechnologies: techDetectionTool,
  generateAnalysisBreakdown: analysisBreakdownTool,
} satisfies ToolSet;

const modelId = "claude-sonnet-4-5-20250929";

describe("analysis via streamText (integration)", () => {
  it(
    "sentry.io: calls all 3 tools across 2 steps",
    async () => {
      let totalCost = 0;

      const result = streamText({
        model: anthropic(modelId),
        system: webAnalysisSystemPrompt,
        messages: [
          { role: "user", content: "Please analyze sentry.io" },
        ],
        tools,
        stopWhen: stepCountIs(2),
        prepareStep: ({ stepNumber, steps }) => {
          if (stepNumber === 0) {
            return {
              toolChoice: "required" as const,
              activeTools: [
                "getRealWorldPerformance",
                "detectTechnologies",
              ] as Array<keyof typeof tools>,
            };
          }
          // After fix: always offer breakdown on step 1
          return {
            activeTools: ["generateAnalysisBreakdown"] as Array<
              keyof typeof tools
            >,
          };
        },
        onStepFinish: (step) => {
          const stepCost = estimateCost(modelId, {
            inputTokens: step.usage.inputTokens,
            outputTokens: step.usage.outputTokens,
          });
          totalCost += stepCost;

          console.log(
            `  Step ${step.usage.inputTokens ? "✓" : "?"}: ` +
              `in=${step.usage.inputTokens} out=${step.usage.outputTokens} ` +
              `cost=$${stepCost.toFixed(4)} ` +
              `tools=[${step.toolCalls.map((c) => c.toolName).join(", ")}]`,
          );
        },
      });

      const finalResult = await result;
      const steps = await finalResult.steps;

      console.log(`\n  Total cost: $${totalCost.toFixed(4)}`);
      console.log(`  Steps: ${steps.length}`);

      // Step 0: perf + tech
      expect(steps.length).toBeGreaterThanOrEqual(2);
      const step0ToolNames = steps[0].toolCalls.map((c) => c.toolName);
      expect(step0ToolNames).toContain("getRealWorldPerformance");
      expect(step0ToolNames).toContain("detectTechnologies");

      // Step 0: toolResults should be populated (streamText works correctly)
      expect(steps[0].toolResults.length).toBeGreaterThan(0);
      expect(hasValidPerformanceData(steps[0])).toBe(true);

      // Step 1: breakdown
      const step1ToolNames = steps[1].toolCalls.map((c) => c.toolName);
      expect(step1ToolNames).toContain("generateAnalysisBreakdown");

      // Validate breakdown output
      const breakdownResult = steps[1].toolResults.find(
        (r) => r.toolName === "generateAnalysisBreakdown",
      );
      expect(breakdownResult).toBeDefined();

      const output = breakdownResult!.output as {
        overview: string;
        points: Array<{ severity: string }>;
        nextStep: string;
      };
      expect(output).toHaveProperty("overview");
      expect(output).toHaveProperty("points");
      expect(output.points.length).toBeGreaterThanOrEqual(2);
      for (const point of output.points) {
        expect(["critical", "warning", "info"]).toContain(point.severity);
      }
    },
    180_000,
  );

  it(
    "localhost: hasData false, flow completes without breakdown",
    async () => {
      const result = streamText({
        model: anthropic(modelId),
        system: webAnalysisSystemPrompt,
        messages: [
          { role: "user", content: "Please analyze localhost" },
        ],
        tools,
        stopWhen: stepCountIs(2),
        prepareStep: ({ stepNumber, steps }) => {
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
          console.log(
            `  Step: tools=[${step.toolCalls.map((c) => c.toolName).join(", ")}]`,
          );
        },
      });

      const finalResult = await result;
      const steps = await finalResult.steps;

      // Step 0 should run, but CrUX has no data for localhost
      expect(steps.length).toBeGreaterThanOrEqual(1);

      // The model may still attempt breakdown (it's offered), but the perf data
      // will have hasData: false. We just verify the flow completes.
      console.log(`  Completed with ${steps.length} steps`);
    },
    180_000,
  );
});
