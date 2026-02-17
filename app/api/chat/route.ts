import * as Sentry from "@sentry/nextjs";
import { createUIMessageStreamResponse, type UIMessage } from "ai";
import { checkBotId } from "botid/server";
import { start } from "workflow/api";
import { analysisWorkflow } from "@/workflows/analysis";

export async function POST(request: Request) {
  const botIdResult = await checkBotId();
  Sentry.logger.debug("BotID check result", {
    isBot: botIdResult.isBot,
    userAgent: request.headers.get("user-agent"),
  });
  if (botIdResult.isBot) {
    Sentry.logger.warn("BotID check failed", {
      isBot: botIdResult.isBot,
      userAgent: request.headers.get("user-agent"),
    });
    return new Response("Access Denied", { status: 403 });
  }

  const analysisStartTime = Date.now();

  let analyzedDomain = "unknown";
  let devices = "unknown";

  return Sentry.startSpan(
    {
      name: "webvitals.analysis",
      op: "analysis.request",
      attributes: {
        "http.method": "POST",
        "http.route": "/api/chat",
      },
    },
    async (span) => {
      try {
        const body = await request.json();
        const {
          messages,
          performanceConfig,
        }: {
          messages: UIMessage[];
          performanceConfig?: { devices?: string[] };
        } = body;

        if (!messages || messages.length === 0) {
          return Response.json(
            { error: "No messages provided" },
            { status: 400 },
          );
        }

        // Extract domain from first user message
        const firstUserMessage = messages.find((m) => m.role === "user");
        if (firstUserMessage?.parts) {
          const textPart = firstUserMessage.parts.find(
            (p) => p.type === "text" && "text" in p,
          );
          if (textPart && "text" in textPart) {
            const domainMatch = (textPart.text as string).match(
              /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+)/,
            );
            if (domainMatch) {
              analyzedDomain = domainMatch[1];
            }
          }
        }

        devices = performanceConfig?.devices?.join(",") || "mobile,desktop";

        span.setAttributes({
          "webvitals.domain": analyzedDomain,
          "webvitals.devices": devices,
          "webvitals.message_count": messages.length,
        });

        // Sanitize messages to prevent prompt injection
        const sanitizedMessages = messages.map((msg) => ({
          ...msg,
          parts: msg.parts?.map((part) => {
            if (part.type === "text" && "text" in part) {
              return {
                ...part,
                text:
                  typeof part.text === "string"
                    ? part.text
                        // biome-ignore lint/suspicious/noControlCharactersInRegex: Intentionally removing control characters for security
                        .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
                        .slice(0, 5000)
                        .trim()
                    : part.text,
              };
            }
            return part;
          }),
        }));

        Sentry.logger.info("Chat analysis started", {
          domain: analyzedDomain,
          devices,
          messageCount: sanitizedMessages.length,
          hasPerformanceConfig: !!performanceConfig,
        });

        const run = await start(analysisWorkflow, [
          sanitizedMessages,
          performanceConfig,
        ]);

        const durationMs = Date.now() - analysisStartTime;
        span.setAttributes({
          "webvitals.duration_ms": durationMs,
          "webvitals.run_id": run.runId,
        });

        const response = createUIMessageStreamResponse({
          stream: run.readable,
        });
        response.headers.set("x-workflow-run-id", run.runId);
        return response;
      } catch (error) {
        const durationMs = Date.now() - analysisStartTime;

        span.setAttributes({
          "webvitals.outcome": "failed",
          "webvitals.duration_ms": durationMs,
          "webvitals.error":
            error instanceof Error ? error.message : "Unknown",
        });

        Sentry.metrics.count("webvitals.analysis.completed", 1, {
          attributes: {
            domain: analyzedDomain,
            devices,
            outcome: "failed",
          },
        });

        Sentry.metrics.distribution(
          "webvitals.analysis.duration_ms",
          durationMs,
          {
            unit: "millisecond",
            attributes: {
              outcome: "failed",
            },
          },
        );

        Sentry.logger.error("Chat API error", {
          error: error instanceof Error ? error.message : "Unknown error",
          domain: analyzedDomain,
          durationMs,
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
            details:
              error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    },
  );
}
