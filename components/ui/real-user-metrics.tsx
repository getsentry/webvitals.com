"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RealUserMetric {
  key: string;
  label: string;
  value: number | string;
  percentile?: number;
  category: "FAST" | "AVERAGE" | "SLOW";
}

interface RealUserMetricsProps {
  fieldData?: RealUserMetric[];
  originData?: RealUserMetric[];
  className?: string;
}

const CATEGORY_COLORS = {
  FAST: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  AVERAGE:
    "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  SLOW: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
} as const;

const METRIC_INFO = {
  FIRST_CONTENTFUL_PAINT_MS: {
    name: "First Contentful Paint",
    abbreviation: "FCP",
    description: "Time until first text/image appears",
  },
  LARGEST_CONTENTFUL_PAINT_MS: {
    name: "Largest Contentful Paint",
    abbreviation: "LCP",
    description: "Loading performance of the largest content element",
  },
  FIRST_INPUT_DELAY: {
    name: "First Input Delay",
    abbreviation: "FID",
    description: "Time from first user interaction to browser response",
  },
  INTERACTION_TO_NEXT_PAINT: {
    name: "Interaction to Next Paint",
    abbreviation: "INP",
    description: "Responsiveness during the entire page lifecycle",
  },
  CUMULATIVE_LAYOUT_SHIFT_SCORE: {
    name: "Cumulative Layout Shift",
    abbreviation: "CLS",
    description: "Visual stability - how much content shifts during loading",
  },
  EXPERIMENTAL_TIME_TO_FIRST_BYTE: {
    name: "Time to First Byte",
    abbreviation: "TTFB",
    description: "Time from request to first byte received",
  },
} as const;

function getCategoryColor(category: string): string {
  return (
    CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ||
    "text-muted-foreground bg-muted"
  );
}

function formatValue(value: number | string, key: string): string {
  if (typeof value === "string") return value;
  if (key === "CUMULATIVE_LAYOUT_SHIFT_SCORE") {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

function getCategoryLabel(category: string, metricKey: string): string {
  // CLS uses different category labels
  if (metricKey === "CUMULATIVE_LAYOUT_SHIFT_SCORE") {
    switch (category) {
      case "FAST":
        return "GOOD";
      case "AVERAGE":
        return "NEEDS IMPROVEMENT";
      case "SLOW":
        return "POOR";
      default:
        return category;
    }
  }

  // Other metrics use standard labels
  switch (category) {
    case "AVERAGE":
      return "NEEDS IMPROVEMENT";
    default:
      return category;
  }
}

function MetricCard({ metric }: { metric: RealUserMetric }) {
  const metricInfo = METRIC_INFO[metric.key as keyof typeof METRIC_INFO];

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <h4 className="font-medium text-foreground cursor-help">
              {metricInfo?.abbreviation || metric.label}
            </h4>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <div className="font-semibold">
                {metricInfo?.name || metric.label}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metricInfo?.description || "Web performance metric"}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
        <span
          className={cn(
            "px-2 py-1 text-xs font-medium rounded-full",
            getCategoryColor(metric.category),
          )}
        >
          {getCategoryLabel(metric.category, metric.key)}
        </span>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {formatValue(metric.value, metric.key)}
      </div>
      {metric.percentile && (
        <div className="text-sm text-muted-foreground">75th percentile</div>
      )}
    </div>
  );
}

export default function RealUserMetrics({
  fieldData,
  originData,
  className,
}: RealUserMetricsProps) {
  if (!fieldData && !originData) {
    return (
      <div className={cn("p-6 border rounded-lg bg-muted/30", className)}>
        <div className="text-center text-muted-foreground">
          <h3 className="font-semibold mb-2">Real-User Experience Data</h3>
          <p className="text-sm">
            No real-user experience data available for this page. This happens
            when there's insufficient data in the Chrome User Experience Report
            (CrUX).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {fieldData && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Page-Level Real-User Data
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Chrome UX Report)
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fieldData.map((metric) => (
              <MetricCard key={metric.key} metric={metric} />
            ))}
          </div>
        </div>
      )}

      {originData && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Origin-Level Real-User Data
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (All pages on this domain)
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {originData.map((metric) => (
              <MetricCard key={metric.key} metric={metric} />
            ))}
          </div>
        </div>
      )}

      <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
        <p>
          <strong>Real-user data</strong> is powered by the Chrome User
          Experience Report (CrUX) dataset and represents actual user
          experiences over the previous 28-day collection period.
        </p>
      </div>
    </div>
  );
}
