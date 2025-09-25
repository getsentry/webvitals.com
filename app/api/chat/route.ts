import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { generateFollowUpActions, webAnalysisSystemPrompt } from "@/ai";
import { followUpActionsArtifact } from "@/ai/artifacts";
import { setContext } from "@/ai/context";
import { realWorldPerformanceTool, techDetectionTool } from "@/ai/tools";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messages,
      performanceConfig,
    }: { messages: UIMessage[]; performanceConfig?: unknown } = body;

    if (!messages || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    Sentry.logger.info("Chat request received", {
      messageCount: messages.length,
      hasPerformanceConfig: !!performanceConfig,
    });

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        // Set up context with writer for artifacts
        setContext({
          writer,
          sessionId: `session-${Date.now()}`,
          analyzeUrl: performanceConfig ? "analysis-session" : undefined,
        });

        const result = streamText({
          model: openai("gpt-4o"),
          messages: convertToModelMessages(messages),
          stopWhen: [stepCountIs(10)], // Safety limit
          tools: {
            getRealWorldPerformance: realWorldPerformanceTool,
            detectTechnologies: techDetectionTool,
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: "pagespeed-analysis-chat",
          },

          onStepFinish: (step) => {
            Sentry.logger.debug("AI step finished", {
              toolCalls: step.toolCalls?.length || 0,
              toolResults: step.toolResults?.length || 0,
              toolNames: step.toolCalls?.map((call) => call.toolName) || [],
            });

            if (step.toolResults) {
              step.toolResults.forEach((result: unknown, index) => {
                const toolName = step.toolCalls?.[index]?.toolName;

                Sentry.logger.debug("Tool result", {
                  toolName,
                  result,
                });

                if (result && typeof result === "object" && "error" in result) {
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
                      contexts: {
                        ai: {
                          model: "gpt-4o",
                          tool: toolName,
                          toolError: step.toolCalls?.[index]?.error,
                        },
                      },
                    },
                  );
                }
              });
            }
          },
          system: `${webAnalysisSystemPrompt}

Configuration: ${JSON.stringify(performanceConfig || {})}`,
          async onFinish({ steps }) {
            // After the main conversation finishes, generate and stream follow-up actions
            const debugContext = {
              timestamp: new Date().toISOString(),
              messagesLength: messages.length,
              stepsCount: steps.length,
              messagesBreakdown: messages.map((m) => ({
                role: m.role,
                contentType: typeof m.content,
              })),
            };

            console.log("[SERVER] 🏁 onFinish triggered:", debugContext);

            try {
              // Extract performance and technology data from the completed steps
              let performanceData: unknown = null;
              let technologyData: unknown = null;

              console.log("[SERVER] 🔍 Processing steps for tool data:", {
                stepsWithToolResults: steps.filter(
                  (s) => s.toolResults?.length > 0,
                ).length,
                allToolCalls: steps.flatMap(
                  (s) => s.toolCalls?.map((tc) => tc.toolName) || [],
                ),
              });

              for (const step of steps) {
                if (step.toolResults) {
                  step.toolResults.forEach((result, index) => {
                    const toolName = step.toolCalls?.[index]?.toolName;
                    console.log("[SERVER] 🔧 Processing tool result:", {
                      toolName,
                      hasResult: !!result,
                      resultType: typeof result,
                    });

                    if (toolName === "getRealWorldPerformance") {
                      performanceData = result;
                      console.log("[SERVER] 📊 Performance data found:", {
                        url:
                          (result as any)?.output?.url || (result as any)?.url,
                        hasData: !!result,
                        fullResult: result,
                      });
                    } else if (toolName === "detectTechnologies") {
                      technologyData = result;
                      console.log("[SERVER] 🔧 Technology data found:", {
                        hasData: !!result,
                        techCount: Array.isArray(
                          (result as { technologies?: unknown[] })
                            ?.technologies,
                        )
                          ? (result as { technologies: unknown[] }).technologies
                              .length
                          : 0,
                      });
                    }
                  });
                }
              }

              // Build conversation history for context
              const conversationHistory = messages.map((msg) => {
                let content = "";

                // Extract text content from message parts
                if (msg.parts) {
                  const textParts = msg.parts
                    .filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .filter(Boolean);
                  content = textParts.join(" ");
                }

                return {
                  role: msg.role as "user" | "assistant",
                  content: content || "[no text content]",
                };
              });

              // Count user messages to determine if we should generate follow-ups
              const userMessageCount = messages.filter(
                (msg) => msg.role === "user",
              ).length;

              console.log("[SERVER] 📊 Follow-up decision factors:", {
                hasPerformanceData: !!performanceData,
                hasTechnologyData: !!technologyData,
                userMessageCount,
                conversationLength: conversationHistory.length,
                messagesRoles: messages.map((m) => m.role),
              });

              // Generate follow-ups only after the initial analysis (first user message)
              const shouldGenerateFollowUps =
                userMessageCount === 1 && (performanceData || technologyData);

              console.log("[SERVER] 🤔 Should generate follow-ups?", {
                shouldGenerateFollowUps,
                reason: shouldGenerateFollowUps
                  ? "initial_analysis_with_tool_data"
                  : "not_initial_analysis_or_no_tool_data",
                conditions: {
                  isFirstUserMessage: userMessageCount === 1,
                  hasPerformanceData: !!performanceData,
                  hasTechnologyData: !!technologyData,
                },
              });

              if (shouldGenerateFollowUps) {
                console.log("[SERVER] ✅ Generating follow-up actions");
                Sentry.logger.debug("Generating follow-up actions", {
                  hasPerformanceData: !!performanceData,
                  hasTechnologyData: !!technologyData,
                  userMessageCount,
                  conversationLength: conversationHistory.length,
                });

                // Clear any previous artifact state and start fresh
                // Start streaming the follow-up actions artifact
                const expectedConversationLength = messages.length + 1; // Account for new assistant message

                // Extract URL from tool output
                const performanceUrl =
                  (performanceData as any)?.output?.url ||
                  (performanceData as any)?.url ||
                  "";

                console.log("[SERVER] 🎯 Starting artifact stream:", {
                  expectedConversationLength,
                  currentMessagesLength: messages.length,
                  url: performanceUrl,
                });

                const followUpStream = followUpActionsArtifact.stream({
                  status: "loading",
                  progress: 0,
                  url: performanceUrl,
                  actions: [],
                  context: {
                    generatedAt: new Date().toISOString(),
                    basedOnTools: [],
                    conversationLength: expectedConversationLength,
                  },
                });

                try {
                  console.log("[SERVER] 🔄 Updating to generating status");
                  // Update to generating status
                  await followUpStream.update({
                    status: "generating",
                    progress: 0.3,
                  });

                  console.log(
                    "[SERVER] 🤖 Calling generateFollowUpActions with:",
                    {
                      hasPerformanceData: !!performanceData,
                      hasTechnologyData: !!technologyData,
                      conversationHistoryLength: conversationHistory.length,
                      lastUserMessage: conversationHistory
                        .filter((m) => m.role === "user")
                        .slice(-1)[0]
                        ?.content?.substring(0, 100),
                      conversationSummary: conversationHistory.map(
                        (m) =>
                          `${m.role}: ${m.content?.substring(0, 50) || "[no content]"}...`,
                      ),
                    },
                  );

                  // Generate the follow-up actions
                  const followUpData = await generateFollowUpActions({
                    performanceData: performanceData
                      ? {
                          ...performanceData,
                          url: performanceUrl, // Ensure URL is included
                        }
                      : null,
                    technologyData,
                    conversationHistory,
                  });

                  console.log("[SERVER] ✅ Follow-up generation complete:", {
                    actionsCount: followUpData.actions.length,
                    url: followUpData.url,
                    basedOnTools: followUpData.basedOnTools,
                    actions: followUpData.actions.map((a) => a.title),
                  });

                  // Complete the artifact with final data
                  // Include the new assistant message in the count (messages.length + 1)
                  await followUpStream.complete({
                    status: "complete",
                    progress: 1,
                    url: followUpData.url,
                    actions: followUpData.actions,
                    context: {
                      generatedAt: followUpData.generatedAt,
                      basedOnTools: followUpData.basedOnTools,
                      conversationLength: expectedConversationLength,
                    },
                  });

                  console.log("[SERVER] 🎉 Artifact stream completed:", {
                    conversationLength: expectedConversationLength,
                    actionsCount: followUpData.actions.length,
                  });

                  Sentry.logger.info(
                    "Follow-up actions generated successfully",
                    {
                      actionsCount: followUpData.actions.length,
                      url: followUpData.url,
                    },
                  );
                } catch (generationError) {
                  console.error(
                    "[SERVER] ❌ Follow-up generation failed:",
                    generationError,
                  );
                  Sentry.logger.error("Follow-up generation failed", {
                    error: generationError,
                  });

                  console.log(
                    "[SERVER] 🔄 Using fallback actions due to error",
                  );
                  // Still complete the artifact but with error state or fallback
                  await followUpStream.complete({
                    status: "complete",
                    progress: 1,
                    url: performanceUrl,
                    actions: [
                      {
                        id: "sentry-rum-setup",
                        title:
                          "How do I set up Sentry to track Real User Metrics for Core Web Vitals?",
                      },
                      {
                        id: "performance-basics",
                        title:
                          "What are Core Web Vitals and why do they matter?",
                      },
                      {
                        id: "optimization-tips",
                        title:
                          "What are the most important performance optimizations?",
                      },
                    ],
                    context: {
                      generatedAt: new Date().toISOString(),
                      basedOnTools: ["fallback"],
                      conversationLength: expectedConversationLength,
                    },
                  });

                  console.log("[SERVER] 🎉 Fallback artifact completed");
                }
              } else {
                console.log("[SERVER] ❌ Skipping follow-up generation:", {
                  reason:
                    userMessageCount !== 1
                      ? "not_initial_analysis"
                      : "no_tool_data",
                  details: {
                    userMessageCount,
                    isFirstUserMessage: userMessageCount === 1,
                    hasPerformanceData: !!performanceData,
                    hasTechnologyData: !!technologyData,
                  },
                });

                Sentry.logger.debug("Skipping follow-up generation", {
                  userMessageCount,
                  isFirstUserMessage: userMessageCount === 1,
                  hasPerformanceData: !!performanceData,
                  hasTechnologyData: !!technologyData,
                  reason:
                    userMessageCount !== 1
                      ? "not_initial_analysis"
                      : "no_tool_data",
                });
              }
            } catch (error) {
              Sentry.logger.error("Follow-up artifact creation failed", {
                error,
              });
              Sentry.captureException(error, {
                tags: {
                  area: "follow-up-generation",
                  function: "pagespeed-analysis-chat",
                },
              });
            }
          },
        });

        writer.merge(result.toUIMessageStream());
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    Sentry.logger.error("Chat API error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    Sentry.captureException(error, {
      tags: {
        area: "api-chat",
        endpoint: "/api/chat",
      },
      contexts: {
        request: {
          method: "POST",
          endpoint: "/api/chat",
        },
      },
    });

    return Response.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
