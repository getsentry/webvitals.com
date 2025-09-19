import { openai } from "@ai-sdk/openai";
import { generateObject, tool } from "ai";
import { z } from "zod";
import type { RealWorldPerformanceOutput } from "@/types/real-world-performance";

const followUpActionSchema = z.object({
  id: z.string().describe("Unique identifier for the action"),
  title: z.string().describe("Simple question or action title for follow-up"),
});

const followUpActionsInputSchema = z.object({
  performanceData: z
    .any()
    .describe("Real-world performance data from getRealWorldPerformance tool"),
  technologyData: z
    .any()
    .describe("Technology detection data from detectTechnologies tool"),
});

const followUpActionsOutputSchema = z.object({
  actions: z
    .array(followUpActionSchema)
    .min(3)
    .max(6)
    .describe("3-6 simple follow-up questions or actions"),
});

export const followUpActionsTool = tool({
  description:
    "Generate simple follow-up questions based on the performance analysis",
  inputSchema: followUpActionsInputSchema,
  execute: async (input) => {
    const { performanceData, technologyData } = input;

    const perfData = performanceData as RealWorldPerformanceOutput;
    const techData = technologyData as {
      technologies: Array<{ name: string }>;
    };

    const technologies = techData?.technologies?.map((t) => t.name) || [];
    const hasPerformanceData = perfData?.hasData;

    // Check for performance issues
    const mobileIssues = [];
    const desktopIssues = [];

    if (perfData?.mobile?.fieldData?.metrics) {
      const mobile = perfData.mobile.fieldData.metrics;
      if (mobile.largest_contentful_paint?.category !== "GOOD") {
        mobileIssues.push("LCP");
      }
      if (mobile.interaction_to_next_paint?.category !== "GOOD") {
        mobileIssues.push("INP");
      }
      if (mobile.cumulative_layout_shift?.category !== "GOOD") {
        mobileIssues.push("CLS");
      }
    }

    try {
      const result = await generateObject({
        model: openai("gpt-4o"),
        schema: followUpActionsOutputSchema,
        prompt: `Generate 3-6 simple follow-up questions based on this website analysis.

CONTEXT:
- URL: ${perfData?.url || "the website"}
- Has Performance Data: ${hasPerformanceData ? "Yes" : "No"}
- Technologies: ${technologies.slice(0, 3).join(", ") || "Unknown"}
- Mobile Issues: ${mobileIssues.length > 0 ? mobileIssues.join(", ") : "None detected"}

Generate practical follow-up questions that a user might want to ask, such as:
- "How can I improve my LCP score?"
- "What is CrUX data vs real user monitoring?"
- "How do I optimize for mobile performance?"
- "What tools should I use to monitor performance?"
- "How can I reduce my JavaScript bundle size?"

Make them conversational and actionable. Focus on the most relevant issues found.`,
      });

      if (!result.object?.actions) {
        throw new Error("No actions generated");
      }

      return {
        url: perfData?.url || "",
        actions: result.object.actions,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("AI generation failed, using fallback:", error);

      // Simple fallback based on analysis
      const fallbackActions = [
        {
          id: "crux-vs-rum",
          title: "What's the difference between CrUX and real user monitoring?",
        },
        {
          id: "monitoring-setup",
          title: "How do I set up performance monitoring?",
        },
      ];

      // Add specific suggestions based on what we found
      if (mobileIssues.length > 0) {
        fallbackActions.push({
          id: "mobile-optimization",
          title: `How can I improve mobile ${mobileIssues[0]}?`,
        });
      }

      if (technologies.includes("Next.js")) {
        fallbackActions.push({
          id: "nextjs-optimization",
          title: "How do I optimize Next.js performance?",
        });
      } else if (technologies.includes("React")) {
        fallbackActions.push({
          id: "react-optimization",
          title: "How do I optimize React performance?",
        });
      }

      return {
        url: perfData?.url || "",
        actions: fallbackActions.slice(0, 4),
        generatedAt: new Date().toISOString(),
      };
    }
  },
});
