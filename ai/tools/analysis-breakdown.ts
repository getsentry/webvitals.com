import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { generateObject, tool } from "ai";
import { z } from "zod";
import { AnalysisBreakdownSchema } from "@/types/analysis-breakdown";
import type { RealWorldPerformanceOutput } from "@/types/real-world-performance";
import type { TechnologyDetectionOutput } from "@/types/web-vitals";

const analysisBreakdownInputSchema = z.object({
  performanceData: z
    .any()
    .describe("Real-world performance data from getRealWorldPerformance"),
  technologyData: z
    .any()
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

    try {
      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: AnalysisBreakdownSchema,
        prompt: `You are an expert web performance consultant. Analyze the performance and technology data to create a structured breakdown.

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Technology Data:
${JSON.stringify(technologyData, null, 2)}

Create a structured analysis with:
- Brief overall assessment (1-2 sentences)
- 2-5 main points, each MUST have: title, summary, details, and severity
- Severity levels: "critical" for major user impact, "warning" for moderate issues, "info" for optimizations
- Focus on user experience impact, not just technical metrics
- One clear next step recommendation

IMPORTANT: Every point must have a severity field set to exactly "critical", "warning", or "info".

Guidelines:
- Don't repeat raw numbers - focus on what they mean for users
- Categorize performance as "fast", "average", or "slow" 
- Connect issues to user frustrations and business impact
- Consider mobile vs desktop differences when significant
- Focus on performance-relevant technologies (React, CDNs, tag managers)
- Suggest specific, actionable improvements`,
      });

      Sentry.logger.debug("Analysis breakdown generated", {
        hasPerformanceData: !!performanceData?.hasData,
        hasTechnologyData: !!technologyData,
        pointsGenerated: result.object.points.length,
      });

      return result.object;
    } catch (error) {
      Sentry.logger.error("Analysis breakdown generation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      Sentry.captureException(error, {
        tags: {
          component: "analysis-breakdown-tool",
          operation: "generateObject",
        },
        extra: {
          hasPerformanceData: !!performanceData?.hasData,
          hasTechnologyData: !!technologyData,
        },
      });

      // Return a fallback structure
      return {
        overview:
          "Unable to generate detailed analysis due to processing error.",
        points: [
          {
            title: "Analysis Error",
            summary: "There was an issue generating the performance breakdown.",
            details:
              "Please try again or contact support if the issue persists.",
            severity: "warning" as const,
          },
        ],
        nextStep:
          "Retry the analysis or use monitoring tools like Sentry for detailed insights.",
      };
    }
  },
});
