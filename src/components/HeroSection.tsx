"use client";

import { useChat } from "@ai-sdk/react";
import * as Sentry from "@sentry/astro";
import type { ToolUIPart } from "ai";
import { AnimatePresence, motion } from "motion/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ui/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ui/ai-elements/message";
import { Response } from "@/components/ui/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ui/ai-elements/tool";
import type { PageSpeedConfig } from "@/types/pagespeed";
import Background from "./Background";
import PageSpeedPromptInput from "./PageSpeedPromptInput";
import WebVitalsFacts from "./WebVitalsFacts";

type PageSpeedToolInput = {
  url: string;
  strategy: "mobile" | "desktop";
  categories: (
    | "performance"
    | "accessibility"
    | "best-practices"
    | "seo"
    | "pwa"
  )[];
};

type PageSpeedToolOutput = {
  url: string;
  strategy: "mobile" | "desktop";
  timestamp: string;
  fieldData: any;
  originData: any;
  labData: any;
  captchaResult: string;
  version: string;
};

type PageSpeedToolUIPart = ToolUIPart<{
  analyzePageSpeed: {
    input: PageSpeedToolInput;
    output: PageSpeedToolOutput;
  };
}>;

export default function HeroSection() {
  const { messages, sendMessage, status, error } = useChat({
    onFinish: (message) => {
      console.log("Chat finished:", message);
      Sentry.logger.info("Chat analysis completed", {
        messageCount: messages.length + 1,
        hasToolCalls: message.message.parts?.some((part) =>
          part.type?.includes("tool"),
        ),
        messageId: message.id,
        role: message.role,
      });
    },
    onError: (error) => {
      console.log("Chat error:", error);
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

  // Debug logging for messages
  console.log("Current messages:", messages);
  console.log("Current status:", status);

  const handlePageSpeedSubmit = async (
    domain: string,
    config: PageSpeedConfig,
  ) => {
    // Enhanced Sentry tracking for analysis requests
    Sentry.setTag("analysis.domain", domain);
    Sentry.setTag("analysis.strategy", config.strategy);

    Sentry.logger.info("PageSpeed analysis initiated", {
      domain,
      strategy: config.strategy,
      categories: config.categories,
      timestamp: new Date().toISOString(),
    });

    // Send message with config in the request body
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
    <section className="relative min-h-screen flex flex-col">
      <Background />

      <div className="relative z-10 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            /* Initial Hero State */
            <motion.div
              key="hero"
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                y: -20,
                transition: {
                  duration: 0.3,
                  ease: [0.55, 0.085, 0.68, 0.53], // ease-in-quad
                },
              }}
              className="flex-1 flex flex-col items-center justify-center px-4 py-20"
            >
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                    Analyze. Optimize. Ship.
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Unlock your website's potential with comprehensive
                    performance analysis powered by Google PageSpeed Insights
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <PageSpeedPromptInput
                    onSubmit={handlePageSpeedSubmit}
                    disabled={status !== "ready"}
                    className="max-w-2xl"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <title>Performance insights</title>
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                    <span>Real user data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <title>Speed optimization</title>
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    <span>Speed optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <title>Real-time metrics</title>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    <span>Real-time metrics</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground/60"
                >
                  <title>Scroll down</title>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </motion.div>
          ) : (
            /* Conversation State */
            <motion.div
              key="conversation"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.3,
                  delay: 0.15, // Wait for hero exit to complete
                  ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic
                },
              }}
              exit={{
                opacity: 0,
                y: -10,
                transition: {
                  duration: 0.2,
                  ease: [0.55, 0.085, 0.68, 0.53], // ease-in-quad
                },
              }}
              className="flex-1 flex flex-col items-center justify-center px-4 py-8"
            >
              {/* Conversation Container - Fixed Height */}
              <div className="max-w-4xl w-full h-[80vh] bg-card rounded-xl border shadow-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b bg-muted/30">
                  <h2 className="text-lg font-semibold">
                    Performance Analysis
                  </h2>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1">
                  <Conversation className="h-full">
                    <ConversationContent>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: {
                              duration: 0.2,
                              ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                            },
                          }}
                          className="space-y-4"
                        >
                          {message.parts?.map((part, i) => {
                            if (part.type === "text") {
                              return (
                                <Message
                                  key={`${message.id}-${i}`}
                                  from={message.role}
                                >
                                  <MessageContent>
                                    {message.role === "user" ? (
                                      // Plain text for user messages - no auto-linking
                                      <div className="whitespace-pre-wrap">
                                        {part.text}
                                      </div>
                                    ) : (
                                      // Rich formatting for assistant messages
                                      <Response>{part.text}</Response>
                                    )}
                                  </MessageContent>
                                </Message>
                              );
                            }

                            if (part.type === "tool-analyzePageSpeed") {
                              const pageSpeedTool = part as PageSpeedToolUIPart;
                              return (
                                <Tool
                                  key={`${message.id}-${i}`}
                                  defaultOpen={
                                    pageSpeedTool.state === "output-available"
                                  }
                                >
                                  <ToolHeader
                                    type="tool-analyzePageSpeed"
                                    state={pageSpeedTool.state}
                                  />
                                  <ToolContent>
                                    <ToolInput input={pageSpeedTool.input} />
                                    <ToolOutput
                                      output={
                                        pageSpeedTool.output ? (
                                          <pre className="text-xs overflow-auto p-4 font-mono">
                                            {JSON.stringify(
                                              pageSpeedTool.output,
                                              null,
                                              2,
                                            )}
                                          </pre>
                                        ) : null
                                      }
                                      errorText={pageSpeedTool.errorText}
                                    />
                                  </ToolContent>
                                </Tool>
                              );
                            }

                            return null;
                          })}
                        </motion.div>
                      ))}

                      {status === "streaming" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 1,
                            transition: {
                              duration: 0.2,
                              ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                            },
                          }}
                          className="p-4 bg-muted/30 rounded-lg border"
                        >
                          <WebVitalsFacts />
                        </motion.div>
                      )}

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {
                              duration: 0.2,
                              ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                            },
                          }}
                          className="text-center text-sm text-red-500 py-4"
                        >
                          Analysis failed: {error.message}
                        </motion.div>
                      )}
                    </ConversationContent>
                    <ConversationScrollButton />
                  </Conversation>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
