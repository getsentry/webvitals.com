import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

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

  console.log("[GENERATOR] 🚀 Starting follow-up generation:", {
    timestamp: new Date().toISOString(),
    hasPerformanceData: !!performanceData,
    hasTechnologyData: !!technologyData,
    conversationHistoryLength: conversationHistory?.length || 0,
    performanceUrl:
      (performanceData as any)?.url || (performanceData as any)?.output?.url,
    lastUserMessage: conversationHistory
      ?.filter((m) => m.role === "user")
      .slice(-1)[0]
      ?.content?.substring(0, 150),
    fullConversationPreview: conversationHistory?.map(
      (m) => `${m.role}: ${m.content?.substring(0, 50) || "[no content]"}...`,
    ),
  });

  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
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

Based on this data and conversation context, generate 3-6 SHORT, actionable follow-up questions that would be most valuable for the user to explore next. 

Guidelines:
- Keep titles under 8-12 words maximum
- Be specific to actual performance issues found
- Consider the detected technology stack
- Avoid repeating covered topics
- Include one Sentry/RUM suggestion if not discussed
- Use simple, direct language

Examples of CONCISE follow-ups:
- "Fix slow mobile LCP?"
- "Reduce high CLS?"
- "Set up Sentry RUM tracking?"
- "Optimize React performance?"
- "Implement performance budgets?"
- "Track business impact?"
- "Compare RUM vs CrUX data?"`,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
        functionId: "follow-up-actions-generator",
      },
    });

    console.log("[GENERATOR] 🤖 AI generation result:", {
      hasResult: !!result.object,
      hasActions: !!result.object?.actions,
      actionsCount: result.object?.actions?.length || 0,
      usage: result.usage,
    });

    if (!result.object?.actions) {
      console.error("[GENERATOR] ❌ No actions generated from AI");
      throw new Error("No actions generated");
    }

    const finalResult = {
      url:
        (performanceData as any)?.url ||
        (performanceData as any)?.output?.url ||
        "",
      actions: result.object.actions,
      generatedAt: new Date().toISOString(),
      basedOnTools: ["getRealWorldPerformance", "detectTechnologies"],
    };

    console.log("[GENERATOR] ✅ Follow-up generation successful:", {
      actionsCount: finalResult.actions.length,
      url: finalResult.url,
      actions: finalResult.actions.map((a) => ({
        id: a.id,
        title: a.title.substring(0, 80),
      })),
    });

    return finalResult;
  } catch (error) {
    console.error(
      "[GENERATOR] ❌ AI generation failed, using fallback:",
      error,
    );

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

    const fallbackResult = {
      url:
        (performanceData as any)?.url ||
        (performanceData as any)?.output?.url ||
        "",
      actions: fallbackActions,
      generatedAt: new Date().toISOString(),
      basedOnTools: ["fallback"],
    };

    console.log("[GENERATOR] 🔄 Using fallback actions:", {
      actionsCount: fallbackResult.actions.length,
      url: fallbackResult.url,
      actions: fallbackResult.actions.map((a) => a.title),
    });

    return fallbackResult;
  }
}
