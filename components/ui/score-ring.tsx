"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface LighthouseMetric {
  key: string;
  label: string;
  value: number;
  weight: number;
  score: number;
}

interface ScoreRingProps {
  overallScore: number;
  metrics: LighthouseMetric[];
  size?: number;
  barWidth?: number;
  className?: string;
  animationDirection?: -1 | 1;
}

const METRIC_COLORS = {
  "first-contentful-paint": "var(--color-metric-fcp)",
  "interaction-to-next-paint": "var(--color-metric-inp)",
  "largest-contentful-paint": "var(--color-metric-lcp)",
  "time-to-first-byte": "var(--color-metric-ttfb)",
  "experimental-time-to-first-byte": "var(--color-metric-ttfb)",
  "cumulative-layout-shift": "var(--color-metric-cls)",
} as const;

const SCORE_COLORS = {
  GOOD: "var(--color-score-good)",
  NEEDS_IMPROVEMENT: "var(--color-score-needs-improvement)",
  POOR: "var(--color-score-poor)",
} as const;

function getMetricColor(metricKey: string): string {
  return (
    METRIC_COLORS[metricKey as keyof typeof METRIC_COLORS] ||
    "var(--color-muted-foreground)"
  );
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
  "interaction-to-next-paint": {
    name: "Interaction to Next Paint",
    description:
      "Responsiveness to user interactions throughout the page lifetime.",
    unit: "ms",
  },
  "largest-contentful-paint": {
    name: "Largest Contentful Paint",
    description: "Loading performance of the largest content element.",
    unit: "ms",
  },
  "time-to-first-byte": {
    name: "Time to First Byte",
    description: "Server response time for the initial request.",
    unit: "ms",
  },
  "experimental-time-to-first-byte": {
    name: "Time to First Byte",
    description: "Server response time for the initial request.",
    unit: "ms",
  },
  "cumulative-layout-shift": {
    name: "Cumulative Layout Shift",
    description:
      "Measures visual stability - how much content shifts during loading.",
    unit: "score",
  },
} as const;

export default function ScoreRing({
  overallScore,
  metrics,
  size = 140,
  barWidth = 8,
  className,
  animationDirection = -1,
}: ScoreRingProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const svgSize = size + 60; // Extra space for labels
  const svgCenter = svgSize / 2;
  const radius = size / 2 - barWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
    let currentAngle = 0; // Start at 12 o'clock

    return metrics.map((metric) => {
      const boundedScore = Math.min(Math.max(metric.score, 0), 100);
      const segmentAngle = (metric.weight / totalWeight) * 360;
      const gapAngle = 12;

      // Calculate actual segment angles with gaps
      const actualSegmentAngle = segmentAngle - gapAngle;
      const segmentCircumference = (circumference * actualSegmentAngle) / 360;
      const progressLength = (boundedScore / 100) * segmentCircumference;

      // Add small gap in strokeDasharray to ensure separation
      const gapLength = (circumference * gapAngle) / 360;

      const startAngle = currentAngle;
      const midAngle = currentAngle + actualSegmentAngle / 2;
      currentAngle += segmentAngle; // Move to next segment (includes gap)

      const strokeColor = getMetricColor(metric.key);
      const backgroundColor = getMetricBackgroundColor(metric.key);
      const metricInfo = METRIC_INFO[metric.key as keyof typeof METRIC_INFO];

      const labelRadius = radius + barWidth + 16;
      const labelRadians = ((midAngle - 90) * Math.PI) / 180; // -90 to start from top
      const labelX = svgCenter + labelRadius * Math.cos(labelRadians);
      const labelY = svgCenter + labelRadius * Math.sin(labelRadians);

      const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
      const endAngleRad =
        ((startAngle + actualSegmentAngle - 90) * Math.PI) / 180;

      const innerRadius = radius - barWidth / 2;
      const outerRadius = radius + barWidth / 2;

      const x1 = svgCenter + innerRadius * Math.cos(startAngleRad);
      const y1 = svgCenter + innerRadius * Math.sin(startAngleRad);
      const x2 = svgCenter + outerRadius * Math.cos(startAngleRad);
      const y2 = svgCenter + outerRadius * Math.sin(startAngleRad);

      const x3 = svgCenter + outerRadius * Math.cos(endAngleRad);
      const y3 = svgCenter + outerRadius * Math.sin(endAngleRad);
      const x4 = svgCenter + innerRadius * Math.cos(endAngleRad);
      const y4 = svgCenter + innerRadius * Math.sin(endAngleRad);

      const largeArcFlag = actualSegmentAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
        `L ${x4} ${y4}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
        "Z",
      ].join(" ");

      return {
        metric,
        startAngle,
        actualSegmentAngle,
        segmentCircumference,
        progressLength,
        gapLength,
        strokeColor,
        backgroundColor,
        metricInfo,
        boundedScore,
        labelX,
        labelY,
        pathData,
        midAngle,
      };
    });
  }, [metrics, size, barWidth, radius, circumference, svgCenter]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleSegmentHover = (segmentKey: string | null) => {
    setHoveredSegment(segmentKey);
  };

  return (
    <div className={cn("relative inline-block", className)} data-score-ring>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className=""
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredSegment(null);
          setMousePosition(null);
        }}
      >
        {segments.map((segment) => {
          const isHovered = hoveredSegment === segment.metric.key;
          const shouldMute = hoveredSegment && !isHovered;

          const startAngleRad = ((segment.startAngle - 90) * Math.PI) / 180;
          const endAngleRad =
            ((segment.startAngle + segment.actualSegmentAngle - 90) * Math.PI) /
            180;
          const progressEndAngleRad =
            ((segment.startAngle +
              (segment.actualSegmentAngle * segment.boundedScore) / 100 -
              90) *
              Math.PI) /
            180;

          const bgStartX = svgCenter + radius * Math.cos(startAngleRad);
          const bgStartY = svgCenter + radius * Math.sin(startAngleRad);
          const bgEndX = svgCenter + radius * Math.cos(endAngleRad);
          const bgEndY = svgCenter + radius * Math.sin(endAngleRad);
          const bgLargeArcFlag = segment.actualSegmentAngle > 180 ? 1 : 0;

          const backgroundPath = [
            `M ${bgStartX} ${bgStartY}`,
            `A ${radius} ${radius} 0 ${bgLargeArcFlag} 1 ${bgEndX} ${bgEndY}`,
          ].join(" ");

          const progStartX = svgCenter + radius * Math.cos(startAngleRad);
          const progStartY = svgCenter + radius * Math.sin(startAngleRad);
          const progEndX = svgCenter + radius * Math.cos(progressEndAngleRad);
          const progEndY = svgCenter + radius * Math.sin(progressEndAngleRad);
          const progLargeArcFlag =
            (segment.actualSegmentAngle * segment.boundedScore) / 100 > 180
              ? 1
              : 0;

          const progressPath =
            segment.boundedScore > 0
              ? [
                  `M ${progStartX} ${progStartY}`,
                  `A ${radius} ${radius} 0 ${progLargeArcFlag} 1 ${progEndX} ${progEndY}`,
                ].join(" ")
              : "";

          return (
            <g key={segment.metric.key}>
              <path
                d={backgroundPath}
                fill="none"
                stroke={segment.strokeColor}
                strokeWidth={barWidth}
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-300 opacity-10",
                  shouldMute && "opacity-5",
                  isHovered && "opacity-20",
                )}
              />
              {segment.boundedScore > 0 && (
                <path
                  d={progressPath}
                  fill="none"
                  stroke={segment.strokeColor}
                  strokeWidth={barWidth}
                  strokeLinecap="round"
                  className={cn(
                    "transition-all duration-300",
                    shouldMute && "opacity-30",
                    isHovered && "opacity-100",
                  )}
                />
              )}
              <path
                d={segment.pathData}
                fill="transparent"
                className="cursor-help"
                onMouseEnter={() => handleSegmentHover(segment.metric.key)}
                onMouseLeave={() => handleSegmentHover(null)}
              />
            </g>
          );
        })}

        {segments.map((segment) => {
          const isHovered = hoveredSegment === segment.metric.key;
          const shouldMute = hoveredSegment && !isHovered;

          return (
            <text
              key={`label-${segment.metric.key}`}
              x={segment.labelX}
              y={segment.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn(
                "text-xs font-medium fill-current transition-all duration-300 cursor-help select-none",
                shouldMute ? "opacity-30" : "opacity-80",
                isHovered && "opacity-100",
              )}
              style={{ fill: segment.strokeColor }}
              onMouseEnter={() => handleSegmentHover(segment.metric.key)}
              onMouseLeave={() => handleSegmentHover(null)}
            >
              {segment.metric.label}
            </text>
          );
        })}

        {/* Placeholder for positioning - actual score will be positioned absolutely */}
        <circle
          cx={svgCenter}
          cy={svgCenter}
          r={radius - barWidth}
          fill="transparent"
          className="pointer-events-none"
        />
      </svg>

      {/* Overall score using NumberFlow positioned over the center */}
      <div
        className="absolute flex items-center justify-center text-3xl font-bold"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          color: getOverallScoreColor(overallScore),
        }}
      >
        <AnimatePresence
          mode="popLayout"
          initial={false}
          custom={animationDirection}
        >
          <motion.div
            key={overallScore}
            variants={variants}
            initial="initial"
            animate="active"
            exit="exit"
            custom={animationDirection}
          >
            {overallScore}
          </motion.div>
        </AnimatePresence>
      </div>

      {typeof document !== "undefined" &&
        hoveredSegment &&
        mousePosition &&
        createPortal(
          (() => {
            const segment = segments.find(
              (s) => s.metric.key === hoveredSegment,
            );
            if (!segment) return null;

            const scoreColor =
              segment.boundedScore >= 90
                ? SCORE_COLORS.GOOD
                : segment.boundedScore >= 50
                  ? SCORE_COLORS.NEEDS_IMPROVEMENT
                  : SCORE_COLORS.POOR;

            return (
              <div
                className="fixed bg-popover text-popover-foreground rounded-md border px-3 py-2 text-xs shadow-lg pointer-events-none max-w-48 z-[9999]"
                style={{
                  left: mousePosition.x + 10,
                  top: mousePosition.y - 10,
                }}
              >
                <div className="font-semibold text-sm mb-1">
                  {segment.metricInfo?.name}
                </div>
                <div className="text-xs text-foreground/70 mb-2 leading-tight">
                  {segment.metricInfo?.description}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground/60">Score:</span>
                    <span
                      className="font-medium text-xs"
                      style={{ color: scoreColor }}
                    >
                      {segment.boundedScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground/60">Weight:</span>
                    <span className="font-medium text-xs">
                      {Math.round(segment.metric.weight * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground/60">Value:</span>
                    <span className="font-medium text-xs">
                      {segment.metric.key === "cumulative-layout-shift"
                        ? segment.metric.value.toFixed(3)
                        : segment.metric.key === "first-contentful-paint" ||
                            segment.metric.key === "largest-contentful-paint" ||
                            segment.metric.key ===
                              "interaction-to-next-paint" ||
                            segment.metric.key === "time-to-first-byte" ||
                            segment.metric.key ===
                              "experimental-time-to-first-byte"
                          ? `${(segment.metric.value / 1000).toFixed(2)}s`
                          : segment.metric.value.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })(),
          document.body,
        )}
    </div>
  );
}

const variants = {
  initial: (direction: number) => {
    return { x: `${110 * direction}%`, opacity: 0 };
  },
  active: { x: "0%", opacity: 1 },
  exit: (direction: number) => {
    return { x: `${-110 * direction}%`, opacity: 0 };
  },
};
