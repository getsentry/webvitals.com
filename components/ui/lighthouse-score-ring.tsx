"use client";

import { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LighthouseMetric {
  key: string;
  label: string;
  value: number;
  weight: number;
  score: number;
}

interface LighthouseScoreRingProps {
  overallScore: number;
  metrics: LighthouseMetric[];
  size?: number;
  barWidth?: number;
  className?: string;
}

// Individual metric colors (distinct colors, not score-based)
const METRIC_COLORS = {
  "first-contentful-paint": "#10B981", // green
  "speed-index": "#6366F1", // indigo
  "largest-contentful-paint": "#F59E0B", // amber
  "total-blocking-time": "#3B82F6", // blue
  "cumulative-layout-shift": "#EF4444", // red
} as const;

// Overall score colors (based on performance)
const SCORE_COLORS = {
  GOOD: "#10B981", // green
  NEEDS_IMPROVEMENT: "#F59E0B", // amber
  POOR: "#EF4444", // red
} as const;

function getMetricColor(metricKey: string): string {
  return METRIC_COLORS[metricKey as keyof typeof METRIC_COLORS] || "#6B7280";
}

function getMetricBackgroundColor(metricKey: string): string {
  return `${getMetricColor(metricKey)}20`;
}

function getOverallScoreColor(score: number): string {
  if (score >= 90) return SCORE_COLORS.GOOD;
  if (score >= 50) return SCORE_COLORS.NEEDS_IMPROVEMENT;
  return SCORE_COLORS.POOR;
}

const METRIC_INFO = {
  "first-contentful-paint": {
    name: "First Contentful Paint",
    description:
      "Time until first text/image appears. Measures perceived loading speed.",
    unit: "ms",
  },
  "speed-index": {
    name: "Speed Index",
    description: "How quickly content is visually displayed during page load.",
    unit: "ms",
  },
  "largest-contentful-paint": {
    name: "Largest Contentful Paint",
    description: "Loading performance of the largest content element.",
    unit: "ms",
  },
  "total-blocking-time": {
    name: "Total Blocking Time",
    description: "Time the main thread was blocked, preventing user input.",
    unit: "ms",
  },
  "cumulative-layout-shift": {
    name: "Cumulative Layout Shift",
    description:
      "Measures visual stability - how much content shifts during loading.",
    unit: "score",
  },
} as const;

export default function LighthouseScoreRing({
  overallScore,
  metrics,
  size = 140,
  barWidth = 8,
  className,
}: LighthouseScoreRingProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Make SVG larger to accommodate labels outside the ring
  const svgSize = size + 60; // Extra space for labels
  const svgCenter = svgSize / 2;
  const radius = size / 2 - barWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
    let currentRotate = 0; // Start at 12 o'clock

    return metrics.map((metric) => {
      const boundedScore = Math.min(Math.max(metric.score, 0), 100);
      const segmentAngle = (metric.weight / totalWeight) * 360;
      const gap = 4;

      const segmentCircumference = (circumference * (segmentAngle - gap)) / 360;
      const progressLength = (boundedScore / 100) * segmentCircumference;

      const rotate = currentRotate;
      const midAngle = currentRotate + segmentAngle / 2 - 90; // Account for the -90 rotation
      currentRotate += segmentAngle;

      const strokeColor = getMetricColor(metric.key);
      const backgroundColor = getMetricBackgroundColor(metric.key);
      const metricInfo = METRIC_INFO[metric.key as keyof typeof METRIC_INFO];

      // Calculate label position outside the ring
      const labelRadius = radius + barWidth + 16;
      const radians = (midAngle * Math.PI) / 180;
      const labelX = svgCenter + labelRadius * Math.cos(radians);
      const labelY = svgCenter + labelRadius * Math.sin(radians);

      return {
        metric,
        rotate,
        segmentCircumference,
        progressLength,
        strokeColor,
        backgroundColor,
        metricInfo,
        boundedScore,
        labelX,
        labelY,
      };
    });
  }, [metrics, size, barWidth, radius, circumference, svgCenter]);

  return (
    <div className={cn("relative inline-block", className)}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className=""
      >
        {segments.map((segment) => {
          const isHovered = hoveredSegment === segment.metric.key;
          const shouldMute = hoveredSegment !== null && !isHovered;

          return (
            <Tooltip key={`tooltip-${segment.metric.key}`}>
              <TooltipTrigger asChild>
                <g
                  className="cursor-help"
                  onMouseEnter={() => setHoveredSegment(segment.metric.key)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <circle
                    cx={svgCenter}
                    cy={svgCenter}
                    r={radius}
                    fill="none"
                    stroke={segment.backgroundColor}
                    strokeWidth={barWidth}
                    strokeDasharray={`${segment.segmentCircumference} ${circumference - segment.segmentCircumference}`}
                    strokeDashoffset={0}
                    transform={`rotate(${segment.rotate - 90} ${svgCenter} ${svgCenter})`}
                    className={cn(
                      "transition-all duration-300",
                      shouldMute && "opacity-30",
                      isHovered && "opacity-100",
                    )}
                  />
                  <circle
                    cx={svgCenter}
                    cy={svgCenter}
                    r={radius}
                    fill="none"
                    stroke={segment.strokeColor}
                    strokeWidth={isHovered ? barWidth + 2 : barWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${segment.progressLength} ${circumference - segment.progressLength}`}
                    strokeDashoffset={0}
                    transform={`rotate(${segment.rotate - 90} ${svgCenter} ${svgCenter})`}
                    className={cn(
                      "transition-all duration-300",
                      shouldMute && "opacity-30",
                      isHovered && "opacity-100",
                    )}
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  <div className="font-semibold">
                    {segment.metricInfo?.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {segment.metricInfo?.description}
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs">Score:</span>
                    <span className="font-medium">
                      {segment.boundedScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Weight:</span>
                    <span className="font-medium">
                      {Math.round(segment.metric.weight * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Value:</span>
                    <span className="font-medium">
                      {segment.metric.value}
                      {segment.metricInfo?.unit}
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Segment labels */}
        {segments.map((segment) => {
          const isHovered = hoveredSegment === segment.metric.key;
          const shouldMute = hoveredSegment !== null && !isHovered;

          return (
            <text
              key={`label-${segment.metric.key}`}
              x={segment.labelX}
              y={segment.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn(
                "text-xs font-medium fill-current transition-all duration-300",
                shouldMute ? "opacity-30" : "opacity-80",
                isHovered && "opacity-100 font-semibold",
              )}
              style={{ fill: segment.strokeColor }}
            >
              {segment.metric.label}
            </text>
          );
        })}

        {/* Center score text */}
        <Tooltip>
          <TooltipTrigger asChild>
            <g className="cursor-help">
              <text
                x={svgCenter}
                y={svgCenter}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-bold fill-current"
                style={{ fill: getOverallScoreColor(overallScore) }}
              >
                {overallScore}
              </text>
            </g>
          </TooltipTrigger>
          <TooltipContent>
            <div className="min-w-64">
              <div className="font-semibold text-center mb-3">
                Overall Performance Score
              </div>
              <div className="text-xs text-muted-foreground text-center mb-3">
                Weighted average of all Lighthouse metrics
              </div>
              <div className="space-y-2">
                {metrics.map((metric) => {
                  const metricInfo =
                    METRIC_INFO[metric.key as keyof typeof METRIC_INFO];
                  return (
                    <div
                      key={metric.key}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getMetricColor(metric.key),
                          }}
                        />
                        <span>{metricInfo?.name || metric.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{metric.score}/100</div>
                        <div className="text-muted-foreground">
                          ({Math.round(metric.weight * 100)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </svg>
    </div>
  );
}
