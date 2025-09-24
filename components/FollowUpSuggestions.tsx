"use client";

import { useArtifact } from "@ai-sdk-tools/artifacts/client";
import { useChatMessages, useChatStore } from "@ai-sdk-tools/store";

import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
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

  // Simple logic for when to show follow-ups
  const shouldShow = useMemo(() => {
    // Only show after assistant messages
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") {
      return false;
    }

    // Limit to 3 user messages max
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    if (userMessageCount >= 3) {
      return false;
    }

    // Must have artifact with actions
    const hasActions = followUpArtifact?.data?.actions?.length > 0;

    // Check if artifact is for current conversation state
    // Artifact should be for messages.length (current state) not older
    const artifactConversationLength =
      followUpArtifact?.data?.context?.conversationLength || 0;
    const isArtifactCurrent = artifactConversationLength === messages.length;

    return hasActions && isArtifactCurrent;
  }, [messages, followUpArtifact?.data]);

  const isLoading =
    followUpArtifact?.status === "loading" ||
    followUpArtifact?.status === "generating";
  const actions = followUpArtifact?.data?.actions || [];

  console.log("[FOLLOW_UP_UI] FollowUpSuggestions state:", {
    timestamp: new Date().toISOString(),
    shouldShow,
    isLoading,
    artifactStatus: followUpArtifact?.status,
    actionsCount: actions.length,
    messagesLength: messages.length,
    artifactConversationLength:
      followUpArtifact?.data?.context?.conversationLength,
    isArtifactCurrent:
      followUpArtifact?.data?.context?.conversationLength === messages.length,
    lastMessageRole: messages[messages.length - 1]?.role,
    userMessageCount: messages.filter((m) => m.role === "user").length,
    artifactUrl: followUpArtifact?.data?.url,
  });

  // Determine if we should render (show follow-ups OR loading state)
  const shouldRender = useMemo(() => {
    // Always show during loading/generating
    if (isLoading) return true;

    // Show if should show follow-ups
    if (shouldShow) return true;

    // Check if we're waiting for new follow-ups after a user message
    const lastMessage = messages[messages.length - 1];
    const secondLastMessage = messages[messages.length - 2];

    // If last message is user and second last is assistant, we're waiting for new follow-ups
    if (
      lastMessage?.role === "user" &&
      secondLastMessage?.role === "assistant"
    ) {
      const userMessageCount = messages.filter((m) => m.role === "user").length;
      return userMessageCount < 3; // Still within conversation limit
    }

    return false;
  }, [messages, isLoading, shouldShow]);

  if (!shouldRender) {
    return null;
  }

  const handleSuggestionClick = (suggestion: string) => {
    console.log("[CLIENT] 📤 Sending follow-up as user message:", {
      timestamp: new Date().toISOString(),
      suggestion: suggestion.substring(0, 100),
      currentMessagesLength: messages.length,
    });
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
        <h4 className="text-sm font-medium text-muted-foreground">
          {isLoading || !shouldShow
            ? "Generating follow-up suggestions..."
            : "Explore these follow-up questions:"}
        </h4>
        <Suggestions className="gap-2">
          {isLoading || !shouldShow
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
      </motion.div>
    </AnimatePresence>
  );
}
