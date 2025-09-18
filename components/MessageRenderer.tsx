"use client";

import type { ToolUIPart } from "ai";
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
import type {
  LighthouseScoreData,
  RealWorldPerformanceOutput,
} from "@/types/real-world-performance";
import type { TechnologyDetectionOutput } from "@/types/web-vitals";
import TextMessage from "./message/TextMessage";
import PerformanceResult from "./results/PerformanceResult";


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

type TextPart = {
  type: "text";
  text?: string;
};

interface MessageRendererProps {
  message: {
    id: string;
    role: "system" | "user" | "assistant";
    parts?: Array<{
      type: string;
      text?: string;
    }>;
  };
}

const MessageRenderer = memo(function MessageRenderer({
  message,
}: MessageRendererProps) {
  const { setScores } = useWebVitalsScore();

  // Memoize part separation to avoid expensive filtering on every render
  const { toolParts, textParts, performanceParts } = useMemo(() => {
    if (!message.parts) {
      return {
        toolParts: [] as (PerformanceToolUIPart | TechnologyToolUIPart)[],
        textParts: [] as TextPart[],
        performanceParts: [] as PerformanceToolUIPart[],
      };
    }

    const tools: (PerformanceToolUIPart | TechnologyToolUIPart)[] = [];
    const texts: TextPart[] = [];
    const performance: PerformanceToolUIPart[] = [];

    // Single pass through parts for better performance
    for (const part of message.parts) {
      if (part.type.startsWith("tool-")) {
        const toolPart = part as PerformanceToolUIPart | TechnologyToolUIPart;
        tools.push(toolPart);
        if (part.type === "tool-getRealWorldPerformance") {
          performance.push(part as PerformanceToolUIPart);
        }
      } else if (part.type === "text") {
        // Type guard for text parts
        const textPart: TextPart = {
          type: "text",
          text: part.text,
        };
        texts.push(textPart);
      }
    }

    return {
      toolParts: tools,
      textParts: texts,
      performanceParts: performance,
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

  // Extract performance data and update scores when available
  useEffect(() => {
    updateScores();
  }, [updateScores]);

  return (
    <div key={message.id}>
      {/* 1. Tool components first */}
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

        return null;
      })}

      {performanceParts.map((performanceTool, i) => {
        if (
          performanceTool.state === "output-available" &&
          performanceTool.output
        ) {
          return (
            <PerformanceResult
              key={`performance-result-${message.id}-${i}`}
              data={performanceTool.output}
              className="mb-4"
            />
          );
        }
        return null;
      })}

      {textParts.map((part, i) => {
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
