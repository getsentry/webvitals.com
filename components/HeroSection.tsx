"use client";

import { useChat } from "@ai-sdk-tools/store";
import * as Sentry from "@sentry/nextjs";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import useMeasure from "react-use-measure";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PerformanceConfig } from "@/types/performance-config";
import Background from "./Background";
import ChatInterface from "./ChatInterface";
import FeatureHighlights from "./FeatureHighlights";
import Heading from "./ui/heading";
import PageSpeedPromptInputWrapper from "./PageSpeedPromptInputWrapper";

export default function HeroSection() {
  const router = useRouter();
  const [ref, bounds] = useMeasure();
  const isMobile = useIsMobile();

  const { messages, sendMessage, status } = useChat({
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

    router.push(`/?domain=${domain}`);

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
    <section className="relative min-h-[70vh] flex flex-col">
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
                Analyze. Optimize. Ship.
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
