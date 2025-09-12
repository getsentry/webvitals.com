"use client";

import { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [clickedSegment, setClickedSegment] = useState<string | null>(null);

  // Make SVG larger to accommodate labels outside the ring
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
      const gapAngle = 2; // Gap in degrees

      // Calculate actual segment angles with gaps
      const actualSegmentAngle = segmentAngle - gapAngle;
      const segmentCircumference = (circumference * actualSegmentAngle) / 360;
      const progressLength = (boundedScore / 100) * segmentCircumference;

      const startAngle = currentAngle;
      const midAngle = currentAngle + actualSegmentAngle / 2;
      currentAngle += segmentAngle; // Move to next segment (includes gap)

      const strokeColor = getMetricColor(metric.key);
      const backgroundColor = getMetricBackgroundColor(metric.key);
      const metricInfo = METRIC_INFO[metric.key as keyof typeof METRIC_INFO];

      // Calculate label position outside the ring
      const labelRadius = radius + barWidth + 16;
      const labelRadians = ((midAngle - 90) * Math.PI) / 180; // -90 to start from top
      const labelX = svgCenter + labelRadius * Math.cos(labelRadians);
      const labelY = svgCenter + labelRadius * Math.sin(labelRadians);

      // Create path for the segment arc
      const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
      const endAngleRad = (((startAngle + actualSegmentAngle) - 90) * Math.PI) / 180;
      
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
        'Z'
      ].join(' ');

      return {
        metric,
        startAngle,
        actualSegmentAngle,
        segmentCircumference,
        progressLength,
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
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleSegmentInteraction = (segmentKey: string, action: 'enter' | 'click') => {
    if (action === 'click') {
      setClickedSegment(clickedSegment === segmentKey ? null : segmentKey);
    } else {
      setHoveredSegment(segmentKey);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("relative inline-block", className)} data-lighthouse-ring>
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
          onClick={(e) => {
            // Close any tooltips when clicking outside segments
            if (e.target === e.currentTarget) {
              setClickedSegment(null);
            }
          }}
        >
          {segments.map((segment) => {
            const isHovered = hoveredSegment === segment.metric.key;
            const shouldMute = hoveredSegment && !isHovered;

            return (
              <g key={segment.metric.key}>
                {/* Background arc */}
                <circle
                  cx={svgCenter}
                  cy={svgCenter}
                  r={radius}
                  fill="none"
                  stroke={segment.backgroundColor}
                  strokeWidth={barWidth}
                  strokeDasharray={`${segment.segmentCircumference} ${circumference - segment.segmentCircumference}`}
                  strokeDashoffset={
                    -((circumference * segment.startAngle) / 360)
                  }
                  transform={`rotate(-90 ${svgCenter} ${svgCenter})`}
                  className={cn(
                    "transition-all duration-300",
                    shouldMute && "opacity-30",
                    isHovered && "opacity-100",
                  )}
                />
                {/* Progress arc */}
                <circle
                  cx={svgCenter}
                  cy={svgCenter}
                  r={radius}
                  fill="none"
                  stroke={segment.strokeColor}
                  strokeWidth={isHovered ? barWidth + 2 : barWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${segment.progressLength} ${circumference - segment.progressLength}`}
                  strokeDashoffset={
                    -((circumference * segment.startAngle) / 360)
                  }
                  transform={`rotate(-90 ${svgCenter} ${svgCenter})`}
                  className={cn(
                    "transition-all duration-300",
                    shouldMute && "opacity-30",
                    isHovered && "opacity-100",
                  )}
                />
                {/* Invisible hover area */}
                <path
                  d={segment.pathData}
                  fill="transparent"
                  className="cursor-help"
                  onMouseEnter={() => handleSegmentInteraction(segment.metric.key, 'enter')}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => handleSegmentInteraction(segment.metric.key, 'click')}
                />
              </g>
            );
          })}


          {/* Segment labels */}
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
        
        {/* Custom floating tooltip for segments - matches shadcn/ui styling exactly */}
        {(hoveredSegment || clickedSegment) && (
          (() => {
            const activeSegment = hoveredSegment || clickedSegment;
            const segment = segments.find(s => s.metric.key === activeSegment);
            if (!segment) return null;
            
            // Use mouse position if hovering, otherwise position near the segment for mobile
            const useMousePosition = hoveredSegment && mousePosition;
            let tooltipX = 0;
            let tooltipY = 0;
            
            if (useMousePosition) {
              tooltipX = mousePosition.x + 15;
              tooltipY = mousePosition.y - 10;
            } else {
              // Position near segment for mobile clicks
              const containerRect = document.querySelector('[data-lighthouse-ring]')?.getBoundingClientRect();
              if (containerRect) {
                const centerX = containerRect.left + containerRect.width / 2;
                const centerY = containerRect.top + containerRect.height / 2;
                const segmentRadius = radius * 1.5;
                const angleRad = ((segment.midAngle - 90) * Math.PI) / 180;
                
                tooltipX = centerX + segmentRadius * Math.cos(angleRad);
                tooltipY = centerY + segmentRadius * Math.sin(angleRad);
              }
            }
            
            return (
              <div 
                className="fixed bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 z-50 rounded-md px-3 py-1.5 text-xs text-balance max-w-xs pointer-events-none"
                style={{
                  left: tooltipX,
                  top: tooltipY,
                }}
              >
                <div className="font-semibold">
                  {segment.metricInfo?.name}
                </div>
                <div className="text-xs opacity-70 mt-1 leading-tight">
                  {segment.metricInfo?.description}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center">
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
              </div>
            );
          })()
        )}
      </div>
    </TooltipProvider>
  );
}
