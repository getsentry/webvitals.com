"use client";

import { useChat } from "@ai-sdk/react";
import * as Sentry from "@sentry/nextjs";
import { AnimatePresence, motion } from "motion/react";
import type { PageSpeedConfig } from "@/types/pagespeed";
import Background from "./Background";
import ChatInterface from "./ChatInterface";
import HeroLanding from "./HeroLanding";

export default function HeroSection() {
  const { messages, sendMessage, status, error } = useChat({
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

  const handlePageSpeedSubmit = async (
    domain: string,
    config: PageSpeedConfig,
  ) => {
    Sentry.setTag("analysis.domain", domain);
    Sentry.setTag("analysis.strategy", config.strategy);

    Sentry.logger.info("PageSpeed analysis initiated", {
      domain,
      strategy: config.strategy,
      categories: config.categories,
      timestamp: new Date().toISOString(),
    });

    sendMessage(
      {
        role: "user",
        parts: [
          { type: "text", text: `Please analyze the website: ${domain}` },
        ],
      },
      {
        body: {
          pageSpeedConfig: config,
        },
      },
    );
  };

  const hasMessages = messages.length > 0;

  return (
    <section className="relative md:h-[70vh] h-full flex flex-col">
      <Background />

      <div className="relative z-10 flex-1 flex flex-col h-full">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <motion.div
              key="hero"
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                y: -20,
                transition: {
                  duration: 0.3,
                  ease: [0.55, 0.085, 0.68, 0.53],
                },
              }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <HeroLanding
                onSubmit={handlePageSpeedSubmit}
                disabled={status !== "ready"}
              />
            </motion.div>
          ) : (
            <motion.div
              key="conversation"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.3,
                  delay: 0.15,
                  ease: [0.215, 0.61, 0.355, 1],
                },
              }}
              exit={{
                opacity: 0,
                y: -10,
                transition: {
                  duration: 0.2,
                  ease: [0.55, 0.085, 0.68, 0.53],
                },
              }}
              className="flex-1"
            >
              <ChatInterface
                messages={messages}
                status={status}
                error={error}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
