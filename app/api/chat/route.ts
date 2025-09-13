import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { webAnalysisSystemPrompt } from "@/lib/system-prompts";
import {
  cloudflareSearchTool,
  cloudflareUrlScannerTool,
} from "@/tools/cloudflare-scanner-tool";
import { pageSpeedTool } from "@/tools/pagespeed-tool";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, pageSpeedConfig } = body;

    if (!messages || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    Sentry.logger.info("Chat request received", {
      messageCount: messages.length,
      hasPageSpeedConfig: !!pageSpeedConfig,
      strategy: pageSpeedConfig?.strategy,
      categories: pageSpeedConfig?.categories,
    });

    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o"),
      messages: modelMessages,
      stopWhen: stepCountIs(5),
      tools: {
        analyzePageSpeed: pageSpeedTool,
        scanUrlSecurity: cloudflareUrlScannerTool,
        searchSecurityScans: cloudflareSearchTool,
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: "pagespeed-analysis-chat",
      },
      onStepFinish: (step) => {
        Sentry.logger.debug("AI step finished", {
          toolCalls: step.toolCalls?.length || 0,
          toolResults: step.toolResults?.length || 0,
          hasToolCalls: !!step.toolCalls?.length,
          hasToolResults: !!step.toolResults?.length,
        });

        if (step.toolResults) {
          step.toolResults.forEach((result, index) => {
            if ("error" in result) {
              Sentry.captureException(
                new Error(`Tool execution failed: ${result.error}`),
                {
                  tags: {
                    area: "ai-tool-execution",
                    function: "pagespeed-analysis-chat",
                    tool: step.toolCalls?.[index]?.toolName,
                  },
                  contexts: {
                    ai: {
                      model: "gpt-4o",
                      tool: step.toolCalls?.[index]?.toolName,
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

Configuration: ${JSON.stringify(pageSpeedConfig || {})}`,
    });

    return result.toUIMessageStreamResponse();
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
