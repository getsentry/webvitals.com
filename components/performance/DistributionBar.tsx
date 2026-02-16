import { AnimatePresence, motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  COLOR_VARS,
  formatMetricValue,
  formatThresholdValue,
  METRIC_NAMES,
  METRIC_THRESHOLDS,
} from "@/lib/web-vitals";
import type { CoreWebVitalMetric } from "@/types/real-world-performance";

interface DistributionBarProps {
  distributions: CoreWebVitalMetric["distributions"];
  percentile: number;
  metricKey: string;
}

export default function DistributionBar({
  distributions,
  percentile,
  metricKey,
}: DistributionBarProps) {
  const thresholds = METRIC_THRESHOLDS[metricKey] || {
    good: 0,
    needsImprovement: 0,
  };

  // CLS values from CrUX are scaled by 100, need to convert back
  const actualPercentile =
    metricKey === "cumulative_layout_shift" ? percentile / 100 : percentile;

  // Calculate marker position based on actual thresholds and percentile
  let markerPosition = 0;

  if (actualPercentile <= thresholds.good) {
    // Position within good range (green section)
    const progress =
      thresholds.good > 0 ? actualPercentile / thresholds.good : 0;
    markerPosition = progress * distributions[0].proportion * 100;
  } else if (actualPercentile <= thresholds.needsImprovement) {
    // Position within needs improvement range (yellow section)
    const greenWidth = distributions[0].proportion * 100;
    const yellowWidth = distributions[1].proportion * 100;
    const progress =
      (actualPercentile - thresholds.good) /
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

  const tooltipContent = (
    <div className="text-xs space-y-2">
      <div className="font-medium">{METRIC_NAMES[metricKey] || metricKey}</div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: COLOR_VARS[0] }}
            />
            <span style={{ color: COLOR_VARS[0] }}>
              Good (≤ {formatThresholdValue(metricKey, thresholds.good)})
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
              style={{ backgroundColor: COLOR_VARS[1] }}
            />
            <span style={{ color: COLOR_VARS[1] }}>
              Meh ({formatThresholdValue(metricKey, thresholds.good)} -{" "}
              {formatThresholdValue(metricKey, thresholds.needsImprovement)})
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
              style={{ backgroundColor: COLOR_VARS[2] }}
            />
            <span style={{ color: COLOR_VARS[2] }}>
              Poor (&gt;{" "}
              {formatThresholdValue(metricKey, thresholds.needsImprovement)})
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
            75th Percentile - {formatMetricValue(metricKey, percentile)}
          </span>
        </div>
      </div>
    </div>
  );

  const clampedPosition = Math.min(Math.max(markerPosition, 0.5), 99.5);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <div className="flex w-full h-3 rounded-full overflow-hidden bg-muted cursor-help">
            <AnimatePresence>
              {distributions.map((dist, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{
                    width: `${dist.proportion * 100}%`,
                    backgroundColor: COLOR_VARS[i],
                    transformOrigin: "left",
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            <motion.div
              className="absolute top-0 w-1 h-3 bg-foreground shadow-sm pointer-events-none"
              style={{ marginLeft: -2 }}
              initial={{ left: "0%" }}
              animate={{ left: `${clampedPosition}%` }}
              exit={{ left: "0%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </AnimatePresence>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}
