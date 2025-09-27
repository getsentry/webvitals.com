"use client";

import { useChatMessages, useChatStore } from "@ai-sdk-tools/store";
import type { UIMessage } from "ai";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  Suggestion,
  Suggestions,
} from "@/components/ui/ai-elements/suggestion";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollFade } from "@/hooks/useScrollFade";
import type { RealWorldPerformanceOutput } from "@/types/real-world-performance";

interface FollowUpAction {
  id: string;
  title: string;
}

interface FollowUpSuggestionsData {
  success: boolean;
  actions: FollowUpAction[];
  url?: string;
  basedOnTools: string[];
  generatedAt: string;
  error?: string;
}

// Type guards for tool parts
function isToolPart(part: UIMessage["parts"][0], toolType: string) {
  return (
    part.type === `tool-${toolType}` &&
    "state" in part &&
    part.state === "output-available" &&
    "output" in part &&
    "toolCallId" in part
  );
}

function isRealWorldPerformanceOutput(
  output: unknown,
): output is RealWorldPerformanceOutput {
  return (
    typeof output === "object" &&
    output !== null &&
    "url" in output &&
    "hasData" in output
  );
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

function SuggestionSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Skeleton className="h-9 w-32 rounded-full" />
    </motion.div>
  );
}

export default function FollowUpSuggestions() {
  const messages = useChatMessages();
  const { sendMessage, status } = useChatStore();
  const [followUpData, setFollowUpData] =
    useState<FollowUpSuggestionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { scrollRef, showLeftFade, showRightFade } =
    useScrollFade(followUpData);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isStreaming = status === "streaming" || status === "submitted";

  const analysisData = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      let performanceData: RealWorldPerformanceOutput | null = null;
      let technologyData: unknown = null;
      let url: string | null = null;

      for (const part of lastMessage.parts) {
        if (isToolPart(part, "getRealWorldPerformance")) {
          const output = (part as any).output;
          if (isRealWorldPerformanceOutput(output)) {
            performanceData = output;
            url = output.url;
          }
        } else if (isToolPart(part, "detectTechnologies")) {
          technologyData = (part as any).output;
        }
      }

      return { performanceData, technologyData, url };
    }
    return { performanceData: null, technologyData: null, url: null };
  }, [messages]);

  // Generate follow-up suggestions when analysis data is available AND streaming is complete
  useEffect(() => {
    const { performanceData, technologyData, url } = analysisData;

    // Check if performance data has meaningful metrics
    const hasPerformanceMetrics =
      performanceData?.hasData &&
      ((performanceData?.mobile?.fieldData?.metrics &&
        Object.keys(performanceData.mobile.fieldData.metrics).length > 0) ||
        (performanceData?.desktop?.fieldData?.metrics &&
          Object.keys(performanceData.desktop.fieldData.metrics).length > 0));

    if (
      userMessageCount === 1 && // Only for initial analysis
      hasPerformanceMetrics && // Only show when we have meaningful performance data
      !followUpData && // Haven't generated suggestions yet
      !isLoading && // Not currently loading
      !isStreaming // Wait for streaming to complete
    ) {
      setIsLoading(true);

      const conversationHistory: ConversationMessage[] = messages.map((msg) => {
        const textParts = msg.parts
          .filter(
            (part): part is { type: "text"; text: string } =>
              part.type === "text",
          )
          .map((part) => part.text)
          .filter(Boolean);

        return {
          role: msg.role as "user" | "assistant",
          content: textParts.join(" ") || "[no text content]",
        };
      });

      fetch("/api/follow-up-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performanceData,
          technologyData,
          conversationHistory,
          url,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setFollowUpData(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to generate follow-up suggestions:", error);
          setIsLoading(false);
        });
    }
  }, [
    analysisData,
    userMessageCount,
    followUpData,
    isLoading,
    isStreaming,
    messages,
  ]);

  // Clear follow-up data if we don't have meaningful performance metrics
  useEffect(() => {
    const { performanceData } = analysisData;
    const hasPerformanceMetrics =
      performanceData?.hasData &&
      ((performanceData?.mobile?.fieldData?.metrics &&
        Object.keys(performanceData.mobile.fieldData.metrics).length > 0) ||
        (performanceData?.desktop?.fieldData?.metrics &&
          Object.keys(performanceData.desktop.fieldData.metrics).length > 0));

    if (userMessageCount === 1 && !hasPerformanceMetrics && followUpData) {
      setFollowUpData(null);
    }

    // Also clear if performanceData exists but hasData is false
    if (
      userMessageCount === 1 &&
      performanceData &&
      !performanceData.hasData &&
      followUpData
    ) {
      setFollowUpData(null);
    }
  }, [analysisData, userMessageCount, followUpData]);

  // Simple state-based rendering
  const shouldShowLoading = isLoading;
  const shouldShowSuggestions = followUpData && userMessageCount === 1;
  const shouldShowSentryLink = userMessageCount >= 2 && !isStreaming;

  if (!shouldShowLoading && !shouldShowSuggestions && !shouldShowSentryLink) {
    return null;
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage?.({
      role: "user" as const,
      parts: [{ type: "text" as const, text: suggestion }],
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="follow-up-suggestions"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
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
        className="mt-4 space-y-3"
      >
        {shouldShowSentryLink && (
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-3">
              To learn more about performance monitoring and how you can use
              Sentry to track real user metrics:
            </p>
            <a
              href="https://docs.sentry.io/product/insights/frontend/web-vitals/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sentry Web Vitals Monitoring Guide
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}

        {(shouldShowLoading || shouldShowSuggestions) && (
          <>
            <h4 className="text-sm font-medium text-muted-foreground">
              {shouldShowLoading
                ? "Generating follow-up suggestions..."
                : "Explore these follow-up questions:"}
            </h4>
            {shouldShowLoading ? (
              <Suggestions className="gap-2">
                {[0, 1, 2].map((index) => (
                  <SuggestionSkeleton key={index} index={index} />
                ))}
              </Suggestions>
            ) : (
              <div className="relative grid w-full">
                <AnimatePresence>
                  {showLeftFade && (
                    <motion.div
                      key="left-fade"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"
                    />
                  )}
                  {showRightFade && (
                    <motion.div
                      key="right-fade"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"
                    />
                  )}
                </AnimatePresence>
                <Suggestions ref={scrollRef} className="gap-2">
                  {followUpData?.actions?.map((action, index) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <Suggestion
                        suggestion={action.title}
                        onClick={handleSuggestionClick}
                      />
                    </motion.div>
                  )) || []}
                </Suggestions>
              </div>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
