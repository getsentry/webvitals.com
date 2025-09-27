"use client";

import { InfoIcon, MonitorIcon, SmartphoneIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWebVitalsScore } from "@/contexts/WebVitalsScoreContext";
import type { DeviceType } from "@/types/performance-config";
import type { RealWorldPerformanceOutput } from "@/types/real-world-performance";
import DeviceMetrics from "../performance/DeviceMetrics";

interface PerformanceResultProps {
  data: RealWorldPerformanceOutput;
  className?: string;
}

export default function PerformanceResult({
  data,
  className,
}: PerformanceResultProps) {
  const { scores } = useWebVitalsScore();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("mobile");

  const navigationMarkup = useMemo(() => {
    if (!data.hasData) return null;
    if (!scores.mobile || !scores.desktop) return null;
    return (
      <Tabs
        onValueChange={(value) => setSelectedDevice(value as DeviceType)}
        value={selectedDevice}
        variant="motion"
      >
        <TabsList>
          <TabsTrigger value="mobile">
            <div className="flex items-center gap-2">
              <SmartphoneIcon size={16} />
              Mobile
              {scores.mobile && (
                <span className="ml-1 font-semibold text-xs">
                  ({scores.mobile.overallScore})
                </span>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="desktop">
            <div className="flex items-center gap-2">
              <MonitorIcon size={16} />
              Desktop
              {scores.desktop && (
                <span className="ml-1 font-semibold text-xs">
                  ({scores.desktop.overallScore})
                </span>
              )}
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }, [
    scores.mobile,
    scores.desktop,
    setSelectedDevice,
    data.hasData,
    selectedDevice,
  ]);

  const contentMarkup = useMemo(() => {
    if (!data.hasData) return null;
    const hasMultipleDevices =
      data.mobile?.fieldData && data.desktop?.fieldData;
    if (!hasMultipleDevices) {
      const deviceData = data.mobile?.fieldData ? data.mobile : data.desktop;
      if (!deviceData) return null;
      return <DeviceMetrics deviceData={deviceData} />;
    }
    const deviceData = selectedDevice === "mobile" ? data.mobile : data.desktop;
    if (!deviceData) return null;
    return (
      <DeviceMetrics
        deviceData={deviceData}
        animationDirection={selectedDevice === "mobile" ? -1 : 1}
      />
    );
  }, [selectedDevice, data.mobile, data.desktop, data.hasData]);

  // Check if we have data but empty metrics (doesn't meet CrUX thresholds)
  const hasEmptyMetrics =
    data.hasData &&
    (!data.mobile?.fieldData?.metrics ||
      Object.keys(data.mobile.fieldData.metrics).length === 0) &&
    (!data.desktop?.fieldData?.metrics ||
      Object.keys(data.desktop.fieldData.metrics).length === 0);

  if (!data.hasData || hasEmptyMetrics) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Card className={className}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Real-World Performance Data</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon
                      size={16}
                      className="text-muted-foreground cursor-help hover:text-foreground transition-colors"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-medium">
                        Chrome User Experience Report (CrUX) Data
                      </p>
                      <p className="text-sm">
                        CrUX only includes websites with sufficient traffic
                        volume. Smaller sites may not have enough data to appear
                        in the report.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-4">
              <p className="text-muted-foreground mb-4">
                No CrUX data available - this website doesn't meet the minimum
                traffic thresholds required for Chrome User Experience Report.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-3">
                We're working on adding Lighthouse audits to provide synthetic
                performance data. For now, the best way to track your app's real
                user performance is with monitoring tools:
              </p>
              <Link
                href="https://docs.sentry.io/product/insights/frontend/web-vitals/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sentry Web Vitals Monitoring Guide
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Real-World Performance Data</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon
                    size={16}
                    className="text-muted-foreground cursor-help hover:text-foreground transition-colors"
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm">
                  <div className="space-y-2">
                    <p className="font-medium">
                      Chrome User Experience Report (CrUX) Data
                    </p>
                    <p className="text-sm">
                      This data represents Chrome users who visited your public
                      pages in the last 28 days. It may not reflect your
                      specific users or recent changes.
                    </p>
                    <p className="text-sm">
                      For RUM (Real User Metrics), consider implementing{" "}
                      <a
                        href="https://docs.sentry.io/product/insights/frontend/web-vitals/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-4 hover:underline"
                      >
                        Sentry Web Vitals Monitoring
                      </a>{" "}
                      or similar solutions. Performance Monitoring or similar
                      solutions.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center sm:justify-start mb-4">
            {navigationMarkup}
          </div>
          {contentMarkup}
        </CardContent>
      </Card>
    </motion.div>
  );
}
