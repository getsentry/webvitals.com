import ScoreRing from "@/components/ui/score-ring";
import { calculateLighthouseScore, METRIC_FULL_NAMES } from "@/lib/web-vitals";
import type { DeviceData } from "@/types/real-world-performance";
import MetricCard from "./MetricCard";

interface DeviceMetricsProps {
  deviceData: NonNullable<DeviceData>;
}

const ALL_METRICS = [
  "largest_contentful_paint",
  "interaction_to_next_paint",
  "cumulative_layout_shift",
  "first_contentful_paint",
  "experimental_time_to_first_byte",
];

export default function DeviceMetrics({ deviceData }: DeviceMetricsProps) {
  if (!deviceData?.fieldData?.metrics) return null;

  const metrics = deviceData.fieldData.metrics;

  const allMetricsData = ALL_METRICS.filter(
    (key) => metrics[key as keyof typeof metrics],
  ).map((key) => {
    const metric = metrics[key as keyof typeof metrics];
    return {
      key,
      metric: metric!, // We know it exists because of filter above
      label: METRIC_FULL_NAMES[key] || key,
    };
  });

  const { overallScore, metrics: lighthouseMetrics } =
    calculateLighthouseScore(metrics);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <ScoreRing overallScore={overallScore} metrics={lighthouseMetrics} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allMetricsData.map(({ key, metric, label }) => (
          <MetricCard key={key} metricKey={key} metric={metric} label={label} />
        ))}
      </div>
    </div>
  );
}
