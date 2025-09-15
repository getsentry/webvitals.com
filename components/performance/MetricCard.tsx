import NumberFlow from "@number-flow/react";
import {
  formatMetricValue,
  getMetricValueColor,
  METRIC_ABBREVIATIONS,
} from "@/lib/web-vitals";
import type { CoreWebVitalMetric } from "@/types/real-world-performance";
import DistributionBar from "./DistributionBar";
import MetricBadge from "./MetricBadge";

interface MetricCardProps {
  metricKey: string;
  metric: CoreWebVitalMetric;
  label: string;
}

export default function MetricCard({
  metricKey,
  metric,
  label,
}: MetricCardProps) {
  return (
    <div className="p-4 bg-card border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-bold text-sm">
            {METRIC_ABBREVIATIONS[metricKey] || metricKey.toUpperCase()}
          </h4>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
        <MetricBadge category={metric.category} metricKey={metricKey} />
      </div>
      <div
        className="text-2xl font-bold"
        style={{ color: getMetricValueColor(metric.category) }}
      >
        <NumberFlow value={formatMetricValue(metricKey, metric.percentile)} suffix= {metricKey === "cumulative_layout_shift" ? "" : "s"} />
      </div>
      {metric.distributions && (
        <DistributionBar
          distributions={metric.distributions}
          percentile={metric.percentile}
          metricKey={metricKey}
        />
      )}
    </div>
  );
}
