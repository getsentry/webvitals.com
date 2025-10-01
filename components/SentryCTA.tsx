"use client";

import { useChatMessages } from "@ai-sdk-tools/store";
import { motion } from "motion/react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function SentryCTA() {
  const messages = useChatMessages();
  const { resolvedTheme } = useTheme();

  const shouldShow = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return false;

    const userMessageCount = messages.filter((m) => m.role === "user").length;

    // Show after initial analysis (userMessageCount === 1)
    if (userMessageCount === 1) {
      const hasToolParts = lastMessage.parts.some((p) =>
        p.type.startsWith("tool-"),
      );
      if (hasToolParts) return true;
    }

    // Show if any tool has an error
    const hasToolError = lastMessage.parts.some(
      (p) =>
        p.type.startsWith("tool-") &&
        "state" in p &&
        p.state === "output-error",
    );

    return hasToolError;
  }, [messages]);

  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-4"
    >
      <div className="rounded-lg border border-border bg-muted/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          To get the most out of your analysis, you can set up Sentry to track
          real user metrics
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://docs.sentry.io/product/insights/frontend/web-vitals/?ref=webvitals.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Learn more
          </a>
          <HoverCard openDelay={100} closeDelay={0}>
            <HoverCardTrigger asChild>
              <Button size="sm" asChild>
                <a
                  href="https://sentry.io/signup?ref=webvitals.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get started with Sentry
                </a>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-[400px] p-0">
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/vitals-dark.jpg"
                    : "/vitals-light.jpg"
                }
                alt="Sentry Web Vitals Dashboard"
                className="w-full rounded-md"
                width={500}
                height={260}
              />
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </motion.div>
  );
}
