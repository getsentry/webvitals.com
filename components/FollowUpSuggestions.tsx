"use client";

import { useArtifact } from "@ai-sdk-tools/artifacts/client";
import { useChatMessages, useChatStore } from "@ai-sdk-tools/store";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useEffect, useState } from "react";
import { followUpActionsArtifact } from "@/ai/artifacts";
import {
  Suggestion,
  Suggestions,
} from "@/components/ui/ai-elements/suggestion";
import { Skeleton } from "@/components/ui/skeleton";

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
  // Consume the follow-up artifact directly
  const messages = useChatMessages();
  const { sendMessage } = useChatStore();
  const followUpArtifact = useArtifact(followUpActionsArtifact);

  const actions = followUpArtifact?.data?.actions || [];

  // Use a simple delay-based approach to detect when assistant is done streaming
  const [assistantDoneStreaming, setAssistantDoneStreaming] = useState(false);

  // Simple logic for when to show follow-ups - only show after first analysis
  const shouldShow = useMemo(() => {
    // Only show after assistant messages
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") {
      return false;
    }

    // Only show after the FIRST user message (initial analysis)
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    if (userMessageCount !== 1) {
      return false;
    }

    // Must have artifact with actions and be in complete status
    const hasActions = followUpArtifact?.data?.actions?.length > 0;
    const isComplete = followUpArtifact?.status === "complete";

    return hasActions && isComplete;
  }, [messages, followUpArtifact?.data, followUpArtifact?.status]);

  // Show Sentry docs link after follow-up questions are used
  const shouldShowSentryLink = useMemo(() => {
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    const lastMessage = messages[messages.length - 1];
    
    return userMessageCount >= 2 && lastMessage?.role === "assistant" && assistantDoneStreaming;
  }, [messages, assistantDoneStreaming]);
  
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      // Reset the flag when new assistant message appears
      setAssistantDoneStreaming(false);
      
      // Set a short delay to allow streaming to complete
      const timer = setTimeout(() => {
        setAssistantDoneStreaming(true);
      }, 1000); // 1 second delay after last message update
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Determine if we should show loading indicators
  const shouldShowLoading = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    const userMessageCount = messages.filter((m) => m.role === "user").length;

    // Show loading ONLY after the initial analysis (first user message)
    // when assistant is done streaming but we don't have suggestions yet
    if (
      lastMessage?.role === "assistant" && 
      assistantDoneStreaming &&
      userMessageCount === 1 &&
      !shouldShow
    ) {
      return true;
    }

    return false;
  }, [messages, assistantDoneStreaming, shouldShow]);

  // Determine if we should render (show follow-ups OR loading state OR sentry link)
  const shouldRender = shouldShow || shouldShowLoading || shouldShowSentryLink;


  if (!shouldRender) {
    return null;
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage?.({
      role: "user",
      parts: [{ type: "text", text: suggestion }],
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
        {shouldShowSentryLink ? (
          <>
            <h4 className="text-sm font-medium text-muted-foreground">
              Learn more about performance monitoring
            </h4>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-3">
                To learn more about performance monitoring and how you can use Sentry to track real user metrics:
              </p>
              <a
                href="https://docs.sentry.io/product/sentry-basics/performance-monitoring/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sentry Performance Monitoring Guide
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </>
        ) : (
          <>
            <h4 className="text-sm font-medium text-muted-foreground">
              {shouldShowLoading
                ? "Generating follow-up suggestions..."
                : "Explore these follow-up questions:"}
            </h4>
            <Suggestions className="gap-2">
              {shouldShowLoading
                ? [0, 1, 2].map((index) => (
                    <SuggestionSkeleton key={index} index={index} />
                  ))
                : actions.map((action, index) => (
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
                  ))}
            </Suggestions>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
