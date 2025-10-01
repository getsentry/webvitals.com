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

    // Check if analysis breakdown tool is complete or any tool has failed
    const hasAnalysisBreakdown = lastMessage.parts.some(
      (p) =>
        p.type === "tool-generateAnalysisBreakdown" &&
        "state" in p &&
        (p.state === "output-available" || p.state === "output-error"),
    );

    const hasToolError = lastMessage.parts.some(
      (p) =>
        p.type.startsWith("tool-") &&
        "state" in p &&
        p.state === "output-error",
    );

    // Check if performance tool completed but has no data
    const hasNoPerformanceData = lastMessage.parts.some(
      (p) =>
        p.type === "tool-getRealWorldPerformance" &&
        "state" in p &&
        p.state === "output-available" &&
        "output" in p &&
        typeof p.output === "object" &&
        p.output !== null &&
        "hasData" in p.output &&
        p.output.hasData === false,
    );

    return hasAnalysisBreakdown || hasToolError || hasNoPerformanceData;
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
