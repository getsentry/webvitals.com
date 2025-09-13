"use client";

import type { ToolUIPart } from "ai";
import { MonitorIcon, SmartphoneIcon } from "lucide-react";
import { motion } from "motion/react";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/primitives/animate/tabs";
import { Message, MessageContent } from "@/components/ui/ai-elements/message";
import { Response } from "@/components/ui/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ui/ai-elements/tool";
import { Badge } from "@/components/ui/badge";
import ScoreRing from "@/components/ui/score-ring";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RealWorldPerformanceOutput } from "@/types/real-world-performance";

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

interface TechnologyDetectionOutput {
  url: string;
  technologies: Array<{
    name: string;
    confidence: number;
    categories: string[];
  }>;
  summary: {
    totalDetected: number;
    byCategory: Record<string, string[]>;
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
            <Message key={`${message.id}-${i}`} from={message.role}>
              <MessageContent>
                {message.role === "user" ? (
                  <div className="whitespace-pre-wrap">{part.text}</div>
                ) : (
                  <Response>{part.text}</Response>
                )}
              </MessageContent>
            </Message>
          );
        }

        if (part.type === "tool-getRealWorldPerformance") {
          const performanceTool = part as ToolUIPart<{
            getRealWorldPerformance: {
              input: { url: string };
              output: RealWorldPerformanceOutput;
            };
          }>;

          const renderPerformanceOutput = () => {
            if (!performanceTool.output) return null;

            const output = performanceTool.output;

            if (!output.hasData) {
              return (
                <div className="p-4 text-muted-foreground">
                  No real-world performance data available for this URL.
                </div>
              );
            }

            const formatMetricValue = (key: string, value: number) => {
              if (key === "cumulative_layout_shift") {
                return value.toString();
              }
              return `${(value / 1000).toFixed(2)}s`;
            };

            const getMetricBadge = (category: string) => {
              const badgeConfig = {
                FAST: {
                  variant: "default" as const,
                  label: "FAST",
                  className: "text-white font-medium",
                },
                AVERAGE: {
                  variant: "secondary" as const,
                  label: "MEH",
                  className: "text-white font-medium",
                },
                SLOW: {
                  variant: "destructive" as const,
                  label: "SLOW",
                  className: "text-white font-medium",
                },
              } as const;

              const config =
                badgeConfig[category as keyof typeof badgeConfig] ||
                badgeConfig.AVERAGE;

              return (
                <Badge
                  variant={config.variant}
                  className={config.className}
                  style={{
                    backgroundColor:
                      category === "FAST"
                        ? "var(--score-good)"
                        : category === "AVERAGE"
                          ? "var(--score-needs-improvement)"
                          : "var(--score-poor)",
                  }}
                >
                  {config.label}
                </Badge>
              );
            };

            const renderDistributionBar = (distributions: any[]) => {
              const colors = ["bg-green-500", "bg-yellow-500", "bg-red-500"];
              return (
                <div className="flex w-full h-2 rounded-full overflow-hidden bg-muted mt-2">
                  {distributions.map((dist, i) => (
                    <div
                      key={i}
                      className={colors[i]}
                      style={{ width: `${dist.proportion * 100}%` }}
                    />
                  ))}
                </div>
              );
            };

            const getMetricAbbreviation = (key: string) => {
              const abbreviations: Record<string, string> = {
                largest_contentful_paint: "LCP",
                interaction_to_next_paint: "INP",
                cumulative_layout_shift: "CLS",
                first_contentful_paint: "FCP",
                experimental_time_to_first_byte: "TTFB",
              };
              return abbreviations[key] || key.toUpperCase();
            };

            const getMetricValueColor = (category: string) => {
              return category === "FAST"
                ? "var(--score-good)"
                : category === "AVERAGE"
                  ? "var(--score-needs-improvement)"
                  : "var(--score-poor)";
            };

            const renderDistributionBarWithMarker = (
              distributions: any[],
              percentile: number,
              key: string,
            ) => {
              const colorClasses = [
                "bg-green-500",
                "bg-yellow-500",
                "bg-red-500",
              ];
              const colorVars = [
                "var(--score-good)",
                "var(--score-needs-improvement)",
                "var(--score-poor)",
              ];

              // Define thresholds for each metric type
              const getThresholds = (metricKey: string) => {
                if (metricKey === "cumulative_layout_shift") {
                  return { good: 0.1, needsImprovement: 0.25 };
                } else if (metricKey === "largest_contentful_paint") {
                  return { good: 2500, needsImprovement: 4000 };
                } else if (metricKey === "first_contentful_paint") {
                  return { good: 1800, needsImprovement: 3000 };
                } else if (metricKey === "interaction_to_next_paint") {
                  return { good: 200, needsImprovement: 500 };
                } else if (metricKey === "experimental_time_to_first_byte") {
                  return { good: 800, needsImprovement: 1800 };
                }
                return { good: 0, needsImprovement: 0 };
              };

              const thresholds = getThresholds(key);

              // Calculate marker position based on actual thresholds and percentile
              let markerPosition = 0;

              if (percentile <= thresholds.good) {
                // Position within good range (green section)
                const progress =
                  thresholds.good > 0 ? percentile / thresholds.good : 0;
                markerPosition = progress * distributions[0].proportion * 100;
              } else if (percentile <= thresholds.needsImprovement) {
                // Position within needs improvement range (yellow section)
                const greenWidth = distributions[0].proportion * 100;
                const yellowWidth = distributions[1].proportion * 100;
                const progress =
                  (percentile - thresholds.good) /
                  (thresholds.needsImprovement - thresholds.good);
                markerPosition = greenWidth + progress * yellowWidth;
              } else {
                // Position within poor range (red section)
                const greenWidth = distributions[0].proportion * 100;
                const yellowWidth = distributions[1].proportion * 100;
                const redWidth = distributions[2].proportion * 100;
                // Position at 70% through the red section for open-ended poor ranges
                markerPosition = greenWidth + yellowWidth + 0.7 * redWidth;
              }

              const formatThresholdValue = (value: number) => {
                if (key === "cumulative_layout_shift") {
                  return value.toString();
                }
                return value >= 1000
                  ? `${(value / 1000).toFixed(1)}s`
                  : `${value}ms`;
              };

              const getMetricName = (metricKey: string) => {
                const names: Record<string, string> = {
                  largest_contentful_paint: "Largest Contentful Paint (LCP)",
                  interaction_to_next_paint: "Interaction to Next Paint (INP)",
                  cumulative_layout_shift: "Cumulative Layout Shift (CLS)",
                  first_contentful_paint: "First Contentful Paint (FCP)",
                  experimental_time_to_first_byte: "Time to First Byte (TTFB)",
                };
                return names[metricKey] || metricKey;
              };

              const tooltipContent = (
                <div className="text-xs space-y-2">
                  <div className="font-medium">{getMetricName(key)}</div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-sm"
                          style={{ backgroundColor: colorVars[0] }}
                        ></div>
                        <span style={{ color: colorVars[0] }}>
                          Good (≤ {formatThresholdValue(thresholds.good)})
                        </span>
                      </div>
                      <span className="font-medium">
                        {Math.round(distributions[0].proportion * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-sm"
                          style={{ backgroundColor: colorVars[1] }}
                        ></div>
                        <span style={{ color: colorVars[1] }}>
                          Needs Improvement (
                          {formatThresholdValue(thresholds.good)} -{" "}
                          {formatThresholdValue(thresholds.needsImprovement)})
                        </span>
                      </div>
                      <span className="font-medium">
                        {Math.round(distributions[1].proportion * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-sm"
                          style={{ backgroundColor: colorVars[2] }}
                        ></div>
                        <span style={{ color: colorVars[2] }}>
                          Poor (&gt;{" "}
                          {formatThresholdValue(thresholds.needsImprovement)})
                        </span>
                      </div>
                      <span className="font-medium">
                        {Math.round(distributions[2].proportion * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 space-y-1">
                    <div className="flex items-center gap-1">
                      <span>▲</span>
                      <span className="font-medium">
                        75th Percentile - {formatMetricValue(key, percentile)}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Core Web Vital
                    </div>
                  </div>
                </div>
              );

              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <div className="flex w-full h-3 rounded-full overflow-hidden bg-muted cursor-help">
                        {distributions.map((dist, i) => (
                          <div
                            key={i}
                            style={{
                              width: `${dist.proportion * 100}%`,
                              backgroundColor: colorVars[i],
                            }}
                          />
                        ))}
                      </div>
                      <div
                        className="absolute top-0 w-1 h-3 bg-gray-900 shadow-sm pointer-events-none"
                        style={{
                          left: `${Math.min(Math.max(markerPosition, 0.5), 99.5)}%`,
                          transform: "translateX(-50%)",
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm">
                    {tooltipContent}
                  </TooltipContent>
                </Tooltip>
              );
            };

            const renderMetricCard = (
              key: string,
              metric: any,
              label: string,
            ) => (
              <div
                key={key}
                className="p-4 bg-card border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">
                      {getMetricAbbreviation(key)}
                    </h4>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                  {getMetricBadge(metric.category)}
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: getMetricValueColor(metric.category) }}
                >
                  {formatMetricValue(key, metric.percentile)}
                </div>
                {metric.distributions &&
                  renderDistributionBarWithMarker(
                    metric.distributions,
                    metric.percentile,
                    key,
                  )}
              </div>
            );

            const calculateLighthouseScore = (metrics: any) => {
              // Lighthouse 10 weights (Nov 2023)
              const weights = {
                largest_contentful_paint: 0.25,
                interaction_to_next_paint: 0.25,
                cumulative_layout_shift: 0.25,
                first_contentful_paint: 0.1,
                experimental_time_to_first_byte: 0.15,
              };

              // Lighthouse 10 scoring thresholds
              const thresholds = {
                largest_contentful_paint: { good: 2500, poor: 4000 },
                interaction_to_next_paint: { good: 200, poor: 500 },
                cumulative_layout_shift: { good: 0.1, poor: 0.25 },
                first_contentful_paint: { good: 1800, poor: 3000 },
                experimental_time_to_first_byte: { good: 800, poor: 1800 },
              };

              const calculateMetricScore = (
                metricKey: string,
                value: number,
              ) => {
                const threshold =
                  thresholds[metricKey as keyof typeof thresholds];
                if (!threshold) return 50; // fallback

                if (value <= threshold.good) return 100;
                if (value >= threshold.poor) return 0;

                // Linear interpolation between good and poor
                return Math.round(
                  100 -
                    ((value - threshold.good) /
                      (threshold.poor - threshold.good)) *
                      100,
                );
              };

              let totalScore = 0;
              let totalWeight = 0;
              const lighthouseMetrics: Array<{
                key: string;
                label: string;
                value: number;
                weight: number;
                score: number;
              }> = [];

              for (const [key, weight] of Object.entries(weights)) {
                if (metrics[key]) {
                  const value = metrics[key].percentile;
                  const score = calculateMetricScore(key, value);

                  totalScore += score * weight;
                  totalWeight += weight;

                  const labels: Record<string, string> = {
                    largest_contentful_paint: "LCP",
                    interaction_to_next_paint: "INP",
                    cumulative_layout_shift: "CLS",
                    first_contentful_paint: "FCP",
                    experimental_time_to_first_byte: "TTFB",
                  };

                  lighthouseMetrics.push({
                    key: key.replace(/_/g, "-"),
                    label: labels[key] || key,
                    value,
                    weight,
                    score,
                  });
                }
              }

              const overallScore =
                totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
              return { overallScore, metrics: lighthouseMetrics };
            };

            const renderDeviceMetrics = (deviceData: any) => {
              if (!deviceData?.fieldData?.metrics) return null;

              const metrics = deviceData.fieldData.metrics;
              const allMetrics = [
                "largest_contentful_paint",
                "interaction_to_next_paint",
                "cumulative_layout_shift",
                "first_contentful_paint",
                "experimental_time_to_first_byte",
              ];

              const metricLabels: Record<string, string> = {
                first_contentful_paint: "First Contentful Paint",
                largest_contentful_paint: "Largest Contentful Paint",
                cumulative_layout_shift: "Cumulative Layout Shift",
                interaction_to_next_paint: "Interaction to Next Paint",
                experimental_time_to_first_byte: "Time to First Byte",
              };

              const allMetricsData = allMetrics
                .filter((key) => metrics[key])
                .map((key) => ({
                  key,
                  metric: metrics[key],
                  label: metricLabels[key] || key,
                }));

              const { overallScore, metrics: lighthouseMetrics } =
                calculateLighthouseScore(metrics);

              return (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <ScoreRing
                      overallScore={overallScore}
                      metrics={lighthouseMetrics}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allMetricsData.map(({ key, metric, label }) =>
                      renderMetricCard(key, metric, label),
                    )}
                  </div>
                </div>
              );
            };

            const hasMultipleDevices =
              output.mobile?.fieldData && output.desktop?.fieldData;

            if (!hasMultipleDevices) {
              const deviceData = output.mobile?.fieldData
                ? output.mobile
                : output.desktop;
              return (
                <div className="p-4">{renderDeviceMetrics(deviceData)}</div>
              );
            }

            return (
              <div className="p-4">
                <Tabs defaultValue="mobile" className="w-full">
                  <TabsHighlight className="bg-background absolute z-0 inset-0 rounded-xl">
                    <TabsList className="h-10 inline-flex p-1 bg-muted w-full rounded-xl">
                      <TabsHighlightItem value="mobile" className="flex-1">
                        <TabsTrigger
                          value="mobile"
                          className="h-full px-4 py-2 w-full text-sm flex items-center justify-center gap-2"
                        >
                          <SmartphoneIcon size={16} />
                          Mobile
                        </TabsTrigger>
                      </TabsHighlightItem>
                      <TabsHighlightItem value="desktop" className="flex-1">
                        <TabsTrigger
                          value="desktop"
                          className="h-full px-4 py-2 w-full text-sm flex items-center justify-center gap-2"
                        >
                          <MonitorIcon size={16} />
                          Desktop
                        </TabsTrigger>
                      </TabsHighlightItem>
                    </TabsList>
                  </TabsHighlight>

                  <TabsContents className="mt-6">
                    <TabsContent value="mobile">
                      {renderDeviceMetrics(output.mobile)}
                    </TabsContent>
                    <TabsContent value="desktop">
                      {renderDeviceMetrics(output.desktop)}
                    </TabsContent>
                  </TabsContents>
                </Tabs>
              </div>
            );
          };

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
                  output={renderPerformanceOutput()}
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
                      <div className="p-4 space-y-4">
                        <h3 className="text-lg font-semibold">
                          Detected Technologies (
                          {techTool.output.summary.totalDetected})
                        </h3>

                        {Object.keys(techTool.output.summary.byCategory)
                          .length > 0 && (
                          <div className="space-y-3">
                            {Object.entries(
                              techTool.output.summary.byCategory,
                            ).map(([category, techs]) => (
                              <div key={category} className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                  {category}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {techs.map((tech) => (
                                    <span
                                      key={tech}
                                      className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
