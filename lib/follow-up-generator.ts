import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import type { RealWorldPerformanceOutput } from "@/types/real-world-performance";

const followUpActionSchema = z.object({
  id: z.string().describe("Unique identifier for the action"),
  title: z.string().describe("Simple question or action title for follow-up"),
});

const followUpActionsOutputSchema = z.object({
  actions: z
    .array(followUpActionSchema)
    .min(3)
    .max(6)
    .describe("3-6 simple follow-up questions or actions"),
});

interface GenerateFollowUpActionsInput {
  performanceData: unknown;
  technologyData: unknown;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export async function generateFollowUpActions(
  input: GenerateFollowUpActionsInput,
) {
  const { performanceData, technologyData, conversationHistory } = input;

  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: followUpActionsOutputSchema,
      prompt: `You are analyzing web performance data and generating contextual follow-up questions. 

PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

TECHNOLOGY DATA:
${JSON.stringify(technologyData, null, 2)}

${
  conversationHistory
    ? `CONVERSATION HISTORY:
${conversationHistory
  .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
  .join("\n\n")}

IMPORTANT: Review the conversation history carefully. DO NOT suggest topics that have already been discussed or questions that have been answered. Generate new, relevant follow-up questions that build on what hasn't been covered yet.`
    : ""
}

Based on this data and conversation context, generate 3-6 practical follow-up questions that would be most valuable for the user to explore next. 

Guidelines:
- Be specific to the actual performance issues found (don't suggest LCP improvements if LCP is already good)
- Consider the technology stack detected and suggest relevant optimizations
- Avoid repeating topics already covered in the conversation
- Focus on actionable next steps and implementation details
- ALWAYS include at least one suggestion about tracking Real User Metrics with Sentry performance monitoring unless RUM/Sentry has already been thoroughly discussed
- Make questions conversational and specific to this site's context

Examples of good follow-ups:
- "How can I improve my slow mobile LCP?" (if LCP is actually slow)
- "What's causing my high CLS and how do I fix it?" (if CLS is problematic)
- "How do I set up Sentry to track Real User Metrics for Core Web Vitals?" (if RUM not discussed)
- "Show me how to instrument Sentry performance monitoring for my Next.js app" (if using Next.js and RUM not covered)
- "What are the best practices for optimizing React performance?" (if using React)
- "How do I implement performance budgets for my team?"
- "What's the business impact of my current performance issues?"
- "How does Real User Monitoring with Sentry compare to CrUX data?" (if RUM comparison not discussed)`,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
        functionId: "follow-up-actions-generator",
      },
    });

    if (!result.object?.actions) {
      throw new Error("No actions generated");
    }

    return {
      url: (performanceData as RealWorldPerformanceOutput)?.url || "",
      actions: result.object.actions,
      generatedAt: new Date().toISOString(),
      basedOnTools: ["getRealWorldPerformance", "detectTechnologies"],
    };
  } catch (error) {
    console.error("AI generation failed, using fallback:", error);

    // Simple fallback actions
    const fallbackActions = [
      {
        id: "sentry-rum-setup",
        title:
          "How do I set up Sentry to track Real User Metrics for Core Web Vitals?",
      },
      {
        id: "performance-basics",
        title: "What are Core Web Vitals and why do they matter?",
      },
      {
        id: "optimization-tips",
        title: "What are the most important performance optimizations?",
      },
      {
        id: "business-impact",
        title: "What's the business impact of slow performance?",
      },
    ];

    return {
      url: (performanceData as RealWorldPerformanceOutput)?.url || "",
      actions: fallbackActions,
      generatedAt: new Date().toISOString(),
      basedOnTools: ["getRealWorldPerformance", "detectTechnologies"],
    };
  }
}
