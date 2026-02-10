import * as Sentry from "@sentry/nextjs";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output, tool } from "ai";
import { z } from "zod";
import { AnalysisBreakdownSchema } from "@/types/analysis-breakdown";
import type { RealWorldPerformanceOutput } from "@/types/real-world-performance";
import type { TechnologyDetectionOutput } from "@/types/web-vitals";

const analysisBreakdownInputSchema = z.object({
  performanceData: z
    .unknown()
    .describe("Real-world performance data from getRealWorldPerformance"),
  technologyData: z
    .unknown()
    .describe("Technology detection data from detectTechnologies"),
});

export const analysisBreakdownTool = tool({
  description:
    "Generate structured analysis breakdown with main points and supporting details based on performance and technology data",
  inputSchema: analysisBreakdownInputSchema,
  execute: async (input) => {
    const { performanceData, technologyData } = input as {
      performanceData: RealWorldPerformanceOutput;
      technologyData: TechnologyDetectionOutput;
    };

    const startTime = Date.now();

    return Sentry.startSpan(
      {
        name: "webvitals.ai.generate_breakdown",
        op: "function",
        attributes: {
          "webvitals.ai.model": "claude-haiku-4-5",
          "webvitals.ai.has_performance_data": !!performanceData?.hasData,
          "webvitals.ai.has_technology_data": !!technologyData,
        },
      },
      async (span) => {
        try {
          const result = await generateText({
            model: anthropic("claude-haiku-4-5-20251001"),
            output: Output.object({ schema: AnalysisBreakdownSchema }),
            prompt: `You are an expert web performance consultant. Analyze the performance and technology data to create a structured breakdown.

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Technology Data:
${JSON.stringify(technologyData, null, 2)}

You must return a JSON object with this exact structure:
{
  "overview": "Brief overall assessment (1-2 sentences)",
  "points": [
    {
      "title": "Main point title (5-8 words)",
      "summary": "Brief summary (1-2 sentences)",
      "details": "Supporting details (2-3 sentences)",
      "severity": "critical" | "warning" | "info"
    }
  ],
  "nextStep": "Key next step or recommendation (1 sentence)"
}

CRITICAL REQUIREMENTS:
- Include exactly 2-5 points (no more, no less)
- Every point MUST have all 4 fields: title, summary, details, severity
- Severity MUST be exactly one of: "critical", "warning", "info"
- All fields must be non-empty strings
- Use "critical" for major user impact, "warning" for moderate issues, "info" for optimizations

Guidelines:
- Focus on user experience impact, not just technical metrics
- Categorize timing metrics (LCP, FCP, INP, TTFB) as "fast", "average", or "slow"
- For CLS (Cumulative Layout Shift): describe as "stable", "needs improvement", or "poor" (NOT slow/fast)
- CLS measures layout stability (0-1 scale), not speed - never use time units for CLS
- Connect issues to user frustrations and business impact
- Consider mobile vs desktop differences when significant
- Suggest specific, actionable improvements`,
            experimental_telemetry: {
              isEnabled: true,
              recordInputs: true,
              recordOutputs: true,
              functionId: "analysis-breakdown-tool",
            },
          });

          const durationMs = Date.now() - startTime;

          if (!result.output) {
            throw new Error("AI model did not produce structured output");
          }

          const validationResult = AnalysisBreakdownSchema.safeParse(
            result.output,
          );
          if (!validationResult.success) {
            Sentry.logger.error("Schema validation failed", {
              error: validationResult.error,
              rawObject: result.output,
            });
            throw new Error(
              `Schema validation failed: ${JSON.stringify(
                validationResult.error.issues,
              )}`,
            );
          }

          span.setAttributes({
            "webvitals.ai.points_generated": result.output.points.length,
            "webvitals.ai.duration_ms": durationMs,
            "webvitals.ai.success": true,
          });

          // Track AI generation latency
          Sentry.metrics.distribution(
            "webvitals.ai.breakdown_duration_ms",
            durationMs,
            {
              unit: "millisecond",
              attributes: {
                success: "true",
                points_count: String(result.output.points.length),
              },
            },
          );

          Sentry.logger.info("Analysis breakdown generated", {
            hasPerformanceData: !!performanceData?.hasData,
            hasTechnologyData: !!technologyData,
            pointsGenerated: result.output.points.length,
            durationMs,
          });

          return result.output;
        } catch (error) {
          const durationMs = Date.now() - startTime;

          span.setAttributes({
            "webvitals.ai.success": false,
            "webvitals.ai.duration_ms": durationMs,
            "webvitals.ai.error":
              error instanceof Error ? error.message : "Unknown",
          });

          // Track failed AI generation
          Sentry.metrics.distribution(
            "webvitals.ai.breakdown_duration_ms",
            durationMs,
            {
              unit: "millisecond",
              attributes: {
                success: "false",
              },
            },
          );

          Sentry.logger.error("Analysis breakdown generation failed", {
            error: error instanceof Error ? error.message : "Unknown error",
            durationMs,
          });

          Sentry.captureException(error, {
            tags: {
              component: "analysis-breakdown-tool",
              operation: "generateText",
            },
            extra: {
              hasPerformanceData: !!performanceData?.hasData,
              hasTechnologyData: !!technologyData,
            },
          });

          throw error;
        }
      },
    );
  },
});
