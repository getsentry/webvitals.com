"use client";

import type { ToolUIPart } from "ai";
import { motion } from "motion/react";
import { Message, MessageContent } from "@/components/ui/ai-elements/message";
import { Response } from "@/components/ui/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ui/ai-elements/tool";
import type { PageSpeedToolInput, PageSpeedToolOutput } from "@/types/pagespeed";

type PageSpeedToolUIPart = ToolUIPart<{
  analyzePageSpeed: {
    input: PageSpeedToolInput;
    output: PageSpeedToolOutput;
  };
}>;

interface MessageRendererProps {
  message: {
    id: string;
    role: string;
    parts?: Array<{
      type: string;
      text?: string;
    }>;
  };
}

export default function MessageRenderer({ message }: MessageRendererProps) {
  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
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
                  <div className="whitespace-pre-wrap">
                    {part.text}
                  </div>
                ) : (
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
  );
}