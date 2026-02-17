"use client";

import * as Sentry from "@sentry/nextjs";
import { useChat } from "@ai-sdk-tools/store";
import { WorkflowChatTransport } from "@workflow/ai";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import useMeasure from "react-use-measure";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLoadState } from "@/hooks/useLoadState";
import type { PerformanceConfig } from "@/types/performance-config";
import Background from "./Background";
import ChatInterface from "./ChatInterface";
import FeatureHighlights from "./FeatureHighlights";
import PageSpeedPromptInputWrapper from "./PageSpeedPromptInputWrapper";
import Heading from "./ui/heading";

export default function HeroSection() {
  const { setLoading } = useLoadState();
  const [ref, bounds] = useMeasure();
  const isMobile = useIsMobile();

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  const activeRunId = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    try {
      return localStorage.getItem("webvitals-run-id") ?? undefined;
    } catch {
      return undefined;
    }
  }, []);

  const hasResumedRef = useRef(false);

  const { messages, sendMessage, status, resumeStream } = useChat({
    transport: new WorkflowChatTransport({
      api: "/api/chat",
      onChatSendMessage: (response) => {
        const runId = response.headers.get("x-workflow-run-id");
        if (runId) {
          try {
            localStorage.setItem("webvitals-run-id", runId);
          } catch {
            // localStorage unavailable (e.g. Safari private browsing)
          }
        }
      },
      prepareReconnectToStreamRequest: ({ api, ...rest }) => {
        let runId: string | null = null;
        try {
          runId = localStorage.getItem("webvitals-run-id");
        } catch {
          // localStorage unavailable
        }
        if (!runId) throw new Error("No active workflow run ID");
        return {
          ...rest,
          api: `/api/chat/${encodeURIComponent(runId)}/stream`,
        };
      },
    }),
    onFinish: (message) => {
      Sentry.logger.info("Chat analysis completed", {
        messageCount: messages.length + 1,
        hasToolCalls: message.message.parts?.some((part) =>
          part.type?.includes("tool"),
        ),
        messageId: message.message.id,
        role: message.message.role,
      });
    },
    onError: (error) => {
      Sentry.captureException(error, {
        tags: {
          area: "frontend-chat",
          component: "HeroSection",
        },
        contexts: {
          chat: {
            messageCount: messages.length,
            status,
          },
        },
      });
    },
  });

  // Clear run ID only when analysis completes while component is mounted.
  // If the user navigated away mid-stream, this effect won't exist,
  // so the run ID persists for resumeStream on return.
  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      try {
        localStorage.removeItem("webvitals-run-id");
      } catch {}
    }
  }, [status, messages.length]);


  useEffect(() => {
    if (activeRunId && !hasResumedRef.current) {
      hasResumedRef.current = true;
      resumeStream();
    }
  }, [activeRunId, resumeStream]);

  const handlePerformanceSubmit = async (
    domain: string,
    config: PerformanceConfig,
  ) => {
    Sentry.setTag("analysis.domain", domain);
    Sentry.setTag("analysis.devices", config.devices.join(","));

    Sentry.logger.info("Performance analysis initiated", {
      domain,
      devices: config.devices,
      timestamp: new Date().toISOString(),
    });

    // Set domain in URL using History API
    const url = new URL(window.location.href);
    url.searchParams.set("domain", domain);
    window.history.replaceState(null, "", url.toString());

    sendMessage(
      {
        role: "user",
        parts: [{ type: "text", text: `Please analyze ${domain}` }],
      },
      {
        body: {
          performanceConfig: config,
        },
      },
    );
  };

  const hasMessages = messages.length > 0;

  return (
    <section className="relative min-h-screen lg:min-h-[70vh] flex flex-col">
      <Background />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="z-10"
          animate={{
            height: bounds.height,
            translateY: hasMessages ? 0 : "min(300px, 20vh)",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div ref={ref} className="px-4 py-12">
            <motion.div
              animate={{
                scale: hasMessages ? (isMobile ? 1 : 0.5) : 1,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Heading
                level={1}
                size="4xl"
                className="bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent text-center mb-8"
              >
                Core Web Vitals Analysis Tool
              </Heading>
            </motion.div>
            {!hasMessages ? (
              <motion.div
                key="hero-content"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="max-w-4xl mx-auto text-center space-y-8">
                  <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Unlock your website's potential with real-world performance
                    analysis from actual user experiences
                  </p>

                  <div className="max-w-2xl mx-auto">
                    <PageSpeedPromptInputWrapper
                      onSubmit={handlePerformanceSubmit}
                      disabled={status !== "ready"}
                      className="max-w-2xl"
                    />
                  </div>

                  <FeatureHighlights />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex-1"
              >
                <ChatInterface />
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
