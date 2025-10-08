"use client";

import { useChatMessages } from "@ai-sdk-tools/store";
import type { TextUIPart, ToolUIPart, UIMessage } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useMemo } from "react";

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ui/ai-elements/tool";

import { useWebVitalsScore } from "@/contexts/WebVitalsScoreContext";
import { calculateLighthouseScore } from "@/lib/web-vitals";
import type { AnalysisBreakdown } from "@/types/analysis-breakdown";
import type {
  LighthouseScoreData,
  RealWorldPerformanceOutput,
} from "@/types/real-world-performance";
import type { TechnologyDetectionOutput } from "@/types/web-vitals";
import AnalysisBreakdownDisplay from "./analysis/AnalysisBreakdown";
import TextMessage from "./message/TextMessage";
import PerformanceResult from "./results/PerformanceResult";
import SentryCTA from "./SentryCTA";

type PerformanceToolUIPart = ToolUIPart<{
  getRealWorldPerformance: {
    input: { url: string };
    output: RealWorldPerformanceOutput;
  };
}>;

type TechnologyToolUIPart = ToolUIPart<{
  detectTechnologies: {
    input: { url: string };
    output: TechnologyDetectionOutput;
  };
}>;

type AnalysisBreakdownToolUIPart = ToolUIPart<{
  generateAnalysisBreakdown: {
    input: { performanceData: any; technologyData: any };
    output: AnalysisBreakdown;
  };
}>;

interface MessageRendererProps {
  message: UIMessage;
}

const MessageRenderer = memo(function MessageRenderer({
  message,
}: MessageRendererProps) {
  const { setScores } = useWebVitalsScore();
  const messages = useChatMessages();

  const { toolParts, textParts, performanceParts, analysisBreakdownParts } =
    useMemo(() => {
      const tools: (
        | PerformanceToolUIPart
        | TechnologyToolUIPart
        | AnalysisBreakdownToolUIPart
      )[] = [];
      const texts: TextUIPart[] = [];
      const performance: PerformanceToolUIPart[] = [];
      const analysisBreakdown: AnalysisBreakdownToolUIPart[] = [];

      // Single pass through parts for better performance
      for (const part of message.parts) {
        if (part.type.startsWith("tool-")) {
          if (part.type === "tool-getRealWorldPerformance") {
            const performancePart = part as PerformanceToolUIPart;
            tools.push(performancePart);
            performance.push(performancePart);
          } else if (part.type === "tool-detectTechnologies") {
            const technologyPart = part as TechnologyToolUIPart;
            tools.push(technologyPart);
          } else if (part.type === "tool-generateAnalysisBreakdown") {
            const breakdownPart = part as AnalysisBreakdownToolUIPart;
            tools.push(breakdownPart);
            analysisBreakdown.push(breakdownPart);
          }
        } else if (part.type === "text") {
          const textPart = part as TextUIPart;
          texts.push(textPart);
        }
      }

      return {
        toolParts: tools,
        textParts: texts,
        performanceParts: performance,
        analysisBreakdownParts: analysisBreakdown,
      };
    }, [message.parts]);

  // Memoize performance score calculation
  const updateScores = useCallback(() => {
    if (performanceParts.length === 0) return;

    const performanceTool = performanceParts[0];
    if (!performanceTool?.output?.hasData) return;

    const output = performanceTool.output;
    const newScores: {
      mobile?: LighthouseScoreData;
      desktop?: LighthouseScoreData;
    } = {};

    if (output.mobile?.fieldData?.metrics) {
      const { overallScore, metrics: lighthouseMetrics } =
        calculateLighthouseScore(output.mobile.fieldData.metrics);
      newScores.mobile = { overallScore, metrics: lighthouseMetrics };
    }

    if (output.desktop?.fieldData?.metrics) {
      const { overallScore, metrics: lighthouseMetrics } =
        calculateLighthouseScore(output.desktop.fieldData.metrics);
      newScores.desktop = { overallScore, metrics: lighthouseMetrics };
    }

    setScores(newScores);
  }, [performanceParts, setScores]);

  useEffect(() => {
    updateScores();
  }, [updateScores]);

  // Check if this is the first user message
  const isFirstUserMessage =
    message.role === "user" &&
    messages.findIndex((m) => m.role === "user") ===
      messages.findIndex((m) => m.id === message.id);

  // Extract domain from first user message
  const getDomainFromFirstMessage = () => {
    if (!isFirstUserMessage) return null;
    const textPart = textParts[0];
    if (textPart?.text?.startsWith("Please analyze ")) {
      return textPart.text.replace("Please analyze ", "");
    }
    return null;
  };

  const domain = getDomainFromFirstMessage();

  // If this is the first user message, show reasoning instead
  if (isFirstUserMessage && domain) {
    return null;
  }

  // Check if all tools have completed successfully
  const allToolsComplete = useMemo(() => {
    if (toolParts.length < 3) return false; // Wait for all 3 tools before hiding
    return toolParts.every(
      (tool) => tool.state === "output-available" && !tool.errorText,
    );
  }, [toolParts]);

  // Show tools during loading or if there are errors
  const shouldShowTools = !allToolsComplete;

  return (
    <div key={message.id}>
      <AnimatePresence mode="wait">
        {shouldShowTools && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {toolParts.map((part, i) => {
              if (part.type === "tool-getRealWorldPerformance") {
                const performanceTool = part as PerformanceToolUIPart;

                return (
                  <div key={`${message.id}-perf-${i}`}>
                    <Tool defaultOpen={false}>
                      <ToolHeader
                        type={"Analyzing performance" as `tool-${string}`}
                        state={performanceTool.state}
                      />
                      <ToolContent>
                        <ToolInput input={performanceTool.input} />
                        <ToolOutput
                          output={performanceTool.output}
                          errorText={performanceTool.errorText}
                        />
                      </ToolContent>
                    </Tool>
                  </div>
                );
              }

              if (part.type === "tool-detectTechnologies") {
                const techTool = part as TechnologyToolUIPart;

                return (
                  <div key={`${message.id}-tech-${i}`}>
                    <Tool defaultOpen={false}>
                      <ToolHeader
                        type={"Technology detection" as `tool-${string}`}
                        state={techTool.state}
                      />
                      <ToolContent>
                        <ToolInput input={techTool.input} />
                        <ToolOutput
                          output={techTool.output}
                          errorText={techTool.errorText}
                        />
                      </ToolContent>
                    </Tool>
                  </div>
                );
              }

              if (part.type === "tool-generateAnalysisBreakdown") {
                const breakdownTool = part as AnalysisBreakdownToolUIPart;

                return (
                  <div key={`${message.id}-breakdown-${i}`}>
                    <Tool defaultOpen={false}>
                      <ToolHeader
                        type={"Analysis breakdown" as `tool-${string}`}
                        state={breakdownTool.state}
                      />
                      <ToolContent>
                        <ToolInput input={breakdownTool.input} />
                        <ToolOutput
                          output={breakdownTool.output}
                          errorText={breakdownTool.errorText}
                        />
                      </ToolContent>
                    </Tool>
                  </div>
                );
              }

              return null;
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {performanceParts.map((performanceTool, i) => {
        if (
          performanceTool.state === "output-available" &&
          performanceTool.output
        ) {
          const hasNoData = performanceTool.output.hasData === false;
          return (
            <div key={`performance-result-${message.id}-${i}`}>
              <PerformanceResult
                data={performanceTool.output}
                className="mb-4"
              />
              {hasNoData && <SentryCTA />}
            </div>
          );
        }
        return null;
      })}

      {analysisBreakdownParts.map((breakdownTool, i) => {
        if (
          breakdownTool.state === "output-available" &&
          breakdownTool.output
        ) {
          return (
            <div key={`analysis-breakdown-${message.id}-${i}`}>
              <AnalysisBreakdownDisplay
                data={breakdownTool.output}
                className="mb-4"
              />
              <SentryCTA />
            </div>
          );
        }
        return null;
      })}

      {textParts.map((part, i) => {
        // Check if this message has performance data with meaningful metrics
        const hasPerformanceData = performanceParts.some((perfPart) => {
          const output = perfPart.output;
          return (
            output?.hasData &&
            ((output.mobile?.fieldData?.metrics &&
              Object.keys(output.mobile?.fieldData?.metrics || {}).length > 0) ||
              (output.desktop?.fieldData?.metrics &&
                Object.keys(output.desktop?.fieldData?.metrics || {}).length > 0))
          );
        });

        // Only render text if we have meaningful performance data or if this is a user message
        // For assistant messages, check if this is the first analysis (has tool parts) vs follow-up messages
        if (message.role === "assistant") {
          const hasToolParts = message.parts.some((p) =>
            p.type.startsWith("tool-"),
          );
          // If this is the first analysis message (has tools), require performance data
          if (hasToolParts && !hasPerformanceData) {
            return null;
          }
          // For follow-up messages (no tools), always render if there's text
          if (!hasToolParts && !part.text?.trim()) {
            return null;
          }
        }

        return (
          <TextMessage
            key={`${message.id}-text-${i}`}
            messageId={message.id}
            index={i}
            role={message.role}
            text={part.text}
          />
        );
      })}
    </div>
  );
});

export default MessageRenderer;
