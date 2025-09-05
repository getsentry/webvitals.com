"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ui/ai-elements/conversation";
import MessageRenderer from "./MessageRenderer";
import WebVitalsFacts from "./WebVitalsFacts";

interface ChatInterfaceProps {
  messages: Array<{
    id: string;
    role: "system" | "user" | "assistant";
    parts?: Array<{
      type: string;
      text?: string;
    }>;
  }>;
  status: string;
  error?: Error | null;
}

export default function ChatInterface({
  messages,
  status,
  error,
}: ChatInterfaceProps) {
  // Check if we have AI responses or are streaming - if so, move to top
  const hasAIResponses =
    messages.some((msg) => msg.role === "assistant") && messages.length > 2;

  return (
    <motion.div
      className={`h-full flex flex-col items-center px-4 py-8 ${
        hasAIResponses ? "justify-start" : "justify-center"
      }`}
      layout="position"
      transition={{
        duration: 0.3,
        ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic
      }}
    >
      <div
        className="max-w-4xl w-full bg-card rounded-xl border shadow-lg overflow-hidden flex flex-col"
        style={{
          minHeight: "min-content",
          maxHeight: "60vh",
        }}
      >
        <div className="px-6 py-4 border-b bg-muted/30">
          <h2 className="text-lg font-semibold">Performance Analysis</h2>
        </div>

        <div className="flex-1 min-h-0">
          <Conversation className="h-full max-h-[calc(60vh-4rem)] min-h-[266px]">
            <ConversationContent>
              {messages.map((message) => (
                <MessageRenderer key={message.id} message={message} />
              ))}

              <AnimatePresence>
                {status === "streaming" && (
                  <motion.div
                    key="streaming-facts"
                    initial={{
                      opacity: 0,
                      y: -20,
                      scaleY: 0,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scaleY: 1,
                      transition: {
                        duration: 0.25,
                        ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                      },
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                      scaleY: 0,
                      transition: {
                        duration: 0.2,
                        ease: [0.55, 0.085, 0.68, 0.53], // ease-in-quad
                      },
                    }}
                    style={{
                      transformOrigin: "top",
                    }}
                    className="p-4 bg-muted/30 rounded-lg border"
                  >
                    <WebVitalsFacts />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error-message"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: {
                        duration: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                      },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
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
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>
      </div>
    </motion.div>
  );
}
