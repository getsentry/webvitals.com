import { Badge } from "@/components/ui/badge";
import {
  BADGE_CONFIGS,
  CLS_BADGE_CONFIGS,
  getMetricBackgroundColor,
} from "@/lib/web-vitals";

interface MetricBadgeProps {
  category: string;
  metricKey?: string;
}

export default function MetricBadge({ category, metricKey }: MetricBadgeProps) {
  // Use CLS-specific labels for cumulative layout shift (stability metric)
  const badgeConfigs =
    metricKey === "cumulative_layout_shift" ? CLS_BADGE_CONFIGS : BADGE_CONFIGS;
  const config =
    badgeConfigs[category as keyof typeof badgeConfigs] || badgeConfigs.AVERAGE;

  return (
    <Badge
      variant={config.variant}
      className={config.className}
      style={{
        backgroundColor: getMetricBackgroundColor(category),
      }}
    >
      {config.label}
    </Badge>
  );
}
