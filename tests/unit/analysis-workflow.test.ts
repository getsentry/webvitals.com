import { describe, expect, it } from "vitest";
import type { StepResult, ToolSet } from "ai";
import { hasValidPerformanceData } from "@/workflows/analysis";

/**
 * Minimal StepResult factory — only the fields hasValidPerformanceData inspects.
 * Uses `as unknown as StepResult<ToolSet>` to avoid strict structural typing
 * since we only need toolCalls + toolResults for these tests.
 */
function fakeStep(
  overrides: {
    toolCalls?: Array<{
      type: "tool-call";
      toolCallId: string;
      toolName: string;
      input: unknown;
    }>;
    toolResults?: Array<{
      type: "tool-result";
      toolCallId: string;
      toolName: string;
      input: unknown;
      output: unknown;
    }>;
  } = {},
) {
  return {
    content: [],
    text: "",
    reasoning: [],
    reasoningText: undefined,
    files: [],
    sources: [],
    toolCalls: [],
    staticToolCalls: [],
    dynamicToolCalls: [],
    toolResults: [],
    staticToolResults: [],
    dynamicToolResults: [],
    finishReason: "stop",
    rawFinishReason: undefined,
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    warnings: [],
    providerMetadata: undefined,
    request: {},
    response: {},
    ...overrides,
  } as unknown as StepResult<ToolSet>;
}

describe("hasValidPerformanceData", () => {
  it("returns false when toolResults is empty (DurableAgent shape)", () => {
    const step = fakeStep({
      toolCalls: [
        {
          type: "tool-call",
          toolCallId: "call-1",
          toolName: "getRealWorldPerformance",
          input: { url: "https://sentry.io" },
        },
      ],
      toolResults: [], // DurableAgent bug: always empty
    });

    expect(hasValidPerformanceData(step)).toBe(false);
  });

  it("returns true when toolResults has performance data with hasData: true", () => {
    const step = fakeStep({
      toolCalls: [
        {
          type: "tool-call",
          toolCallId: "call-1",
          toolName: "getRealWorldPerformance",
          input: { url: "https://sentry.io" },
        },
      ],
      toolResults: [
        {
          type: "tool-result",
          toolCallId: "call-1",
          toolName: "getRealWorldPerformance",
          input: { url: "https://sentry.io" },
          output: {
            url: "https://sentry.io",
            hasData: true,
            mobile: { fieldData: { metrics: { lcp: 2500 } } },
            desktop: {},
          },
        },
      ],
    });

    expect(hasValidPerformanceData(step)).toBe(true);
  });

  it("returns false when performance result has hasData: false", () => {
    const step = fakeStep({
      toolCalls: [
        {
          type: "tool-call",
          toolCallId: "call-1",
          toolName: "getRealWorldPerformance",
          input: { url: "https://localhost" },
        },
      ],
      toolResults: [
        {
          type: "tool-result",
          toolCallId: "call-1",
          toolName: "getRealWorldPerformance",
          input: { url: "https://localhost" },
          output: {
            url: "https://localhost",
            hasData: false,
            mobile: {},
            desktop: {},
          },
        },
      ],
    });

    expect(hasValidPerformanceData(step)).toBe(false);
  });

  it("returns false when no getRealWorldPerformance tool call exists", () => {
    const step = fakeStep({
      toolCalls: [
        {
          type: "tool-call",
          toolCallId: "call-1",
          toolName: "detectTechnologies",
          input: { url: "https://sentry.io" },
        },
      ],
      toolResults: [
        {
          type: "tool-result",
          toolCallId: "call-1",
          toolName: "detectTechnologies",
          input: { url: "https://sentry.io" },
          output: { technologies: [] },
        },
      ],
    });

    expect(hasValidPerformanceData(step)).toBe(false);
  });
});
