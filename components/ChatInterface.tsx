"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ui/ai-elements/conversation";
import { WebVitalsScoreProvider } from "@/contexts/WebVitalsScoreContext";

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
  onSendMessage: (message: {
    role: "user";
    parts: Array<{ type: "text"; text: string }>;
  }) => void;
}

// Extract style objects to prevent recreation on every render
const cardStyles = { maxHeight: "60vh" };

export default function ChatInterface({
  messages,
  status,
  error,
  onSendMessage,
}: ChatInterfaceProps) {
  // Memoize expensive calculations
  const hasAIResponses = useMemo(
    () =>
      messages.some(
        (msg) =>
          msg.role === "assistant" && msg.parts?.length && msg.parts.length > 3,
      ),
    [messages],
  );

  const hasAIText = useMemo(
    () =>
      messages.some(
        (msg) =>
          msg.role === "assistant" &&
          msg.parts?.some(
            (part) =>
              part.type === "text" && part.text?.length && part.text.length > 0,
          ),
      ),
    [messages],
  );

  // Show fade overlays when there's scrollable content
  const showFadeOverlays = useMemo(
    () => messages.length > 0 && hasAIResponses,
    [messages.length, hasAIResponses],
  );
  return (
    <WebVitalsScoreProvider>
      <motion.div
        className={`h-full flex flex-col items-center px-4 py-8 ${
          hasAIResponses ? "justify-start" : "justify-center"
        }`}
        animate={{
          justifyContent: hasAIResponses ? "flex-start" : "center",
        }}
        transition={{
          duration: 0.3,
          ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic
        }}
      >
        <motion.div
          className="max-w-4xl w-full bg-card rounded-xl border shadow-lg overflow-hidden flex flex-col relative"
          animate={{
            height: "auto",
          }}
          transition={{
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={cardStyles}
        >
          {/* Fade overlays */}
          <div
            className={`absolute top-0 left-0 right-4 h-6 bg-gradient-to-b from-card/60 via-card/30 to-transparent pointer-events-none z-10 transition-opacity duration-300 ease-out ${
              showFadeOverlays ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className={`absolute bottom-0 left-0 right-4 h-6 bg-gradient-to-t from-card/60 via-card/30 to-transparent pointer-events-none z-10 transition-opacity duration-300 ease-out ${
              showFadeOverlays ? "opacity-100" : "opacity-0"
            }`}
          />

          <div className="flex-1 min-h-0">
            <Conversation className="h-full max-h-[60vh]">
              <ConversationContent>
                {messages.map((message) => (
                  <MessageRenderer
                    key={message.id}
                    message={message}
                    onSendMessage={onSendMessage}
                  />
                ))}

                <AnimatePresence>
                  {status === "streaming" && !hasAIText && (
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
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>
        </motion.div>
      </motion.div>
    </WebVitalsScoreProvider>
  );
}
