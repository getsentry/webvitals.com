"use client";

import {
  useChatError,
  useChatMessages,
  useChatStatus,
  useChatStore,
} from "@ai-sdk-tools/store";
import { RotateCcwIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ui/ai-elements/conversation";
import { Loader } from "@/components/ui/ai-elements/loader";
import { Button } from "@/components/ui/button";
import FollowUpSuggestions from "./FollowUpSuggestions";
import MessageRenderer from "./MessageRenderer";
import WebVitalsFacts from "./WebVitalsFacts";

export default function ChatInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messages = useChatMessages();

  const status = useChatStatus();
  const error = useChatError();
  const { setMessages } = useChatStore();

  const domain = searchParams.get("domain");

  const hasInitialAnalysis = useMemo(
    () =>
      messages.some(
        (msg) =>
          msg.role === "assistant" &&
          msg.parts?.some(
            (part) =>
              part.type === "tool-generateAnalysisBreakdown" &&
              part.state === "output-available",
          ),
      ),
    [messages],
  );

  const handleReset = () => {
    setMessages([]);
    localStorage.removeItem("webvitals-run-id");
    router.push("/");
  };

  return (
    <motion.div className={`h-full flex flex-col items-center`}>
      <motion.div className="max-w-4xl w-full border rounded-lg bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <p className="text-sm text-muted-foreground">
            {status === "submitted" || status === "streaming"
              ? `Analyzing ${domain}`
              : status === "ready" && messages.length >= 1
                ? `Analysis result for ${domain}`
                : null}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcwIcon size={14} />
            Analyze another
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <Conversation>
            <ConversationContent>
              {messages.map((message) => (
                <MessageRenderer key={message.id} message={message} />
              ))}

              <AnimatePresence>
                {(status === "submitted" || status === "streaming") &&
                  !hasInitialAnalysis && (
                    <motion.div
                      key="streaming-facts"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.25,
                          ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                        },
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                        transition: {
                          duration: 0.2,
                          ease: [0.55, 0.085, 0.68, 0.53], // ease-in-quad
                        },
                      }}
                      className="p-4 bg-muted/30 rounded-lg border"
                    >
                      <WebVitalsFacts />
                    </motion.div>
                  )}
                {status === "submitted" && hasInitialAnalysis && (
                  <motion.div
                    key="streaming-loader"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                  >
                    <Loader />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                      },
                    }}
                    exit={{
                      opacity: 0,
                      y: -5,
                      transition: {
                        duration: 0.15,
                        ease: [0.55, 0.085, 0.68, 0.53], // ease-in-quad
                      },
                    }}
                    className="text-center text-sm text-red-500 py-4"
                  >
                    Analysis failed: {error.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <FollowUpSuggestions />
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>
      </motion.div>
    </motion.div>
  );
}
