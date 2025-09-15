"use client";

import type { ToolUIPart } from "ai";
import { motion } from "motion/react";
import { useEffect } from "react";
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
import PerformanceOutput from "./performance/PerformanceOutput";
import TechnologyOutput from "./technology/TechnologyOutput";

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

export default function MessageRenderer({ message }: MessageRendererProps) {
  const { setScores } = useWebVitalsScore();

  // Extract performance data and update scores when available
  useEffect(() => {
    const performanceParts = message.parts?.filter(
      (part) => part.type === "tool-getRealWorldPerformance",
    ) as ToolUIPart<{
      getRealWorldPerformance: {
        input: { url: string };
        output: RealWorldPerformanceOutput;
      };
    }>[];

    if (performanceParts.length > 0) {
      const performanceTool = performanceParts[0];
      if (performanceTool?.output?.hasData) {
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
      }
    }
  }, [message.parts, setScores]);

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
            <TextMessage
              key={`${message.id}-${i}`}
              messageId={message.id}
              index={i}
              role={message.role}
              text={part.text}
            />
          );
        }

        if (part.type === "tool-getRealWorldPerformance") {
          const performanceTool = part as ToolUIPart<{
            getRealWorldPerformance: {
              input: { url: string };
              output: RealWorldPerformanceOutput;
            };
          }>;

          return (
            <Tool
              key={`${message.id}-${i}`}
              defaultOpen={performanceTool.state === "output-available"}
            >
              <ToolHeader
                type="tool-getRealWorldPerformance"
                state={performanceTool.state}
              />
              <ToolContent>
                <ToolInput input={performanceTool.input} />
                <ToolOutput
                  output={
                    performanceTool.output ? (
                      <PerformanceOutput output={performanceTool.output} />
                    ) : null
                  }
                  errorText={performanceTool.errorText}
                  rawOutput={performanceTool.output}
                />
              </ToolContent>
            </Tool>
          );
        }

        if (part.type === "tool-detectTechnologies") {
          const techTool = part as ToolUIPart<{
            detectTechnologies: {
              input: { url: string };
              output: TechnologyDetectionOutput;
            };
          }>;

          return (
            <Tool
              key={`${message.id}-${i}`}
              defaultOpen={techTool.state === "output-available"}
            >
              <ToolHeader
                type="tool-detectTechnologies"
                state={techTool.state}
              />
              <ToolContent>
                <ToolInput input={techTool.input} />
                <ToolOutput
                  output={
                    techTool.output ? (
                      <TechnologyOutput output={techTool.output} />
                    ) : null
                  }
                  errorText={techTool.errorText}
                  rawOutput={techTool.output}
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
