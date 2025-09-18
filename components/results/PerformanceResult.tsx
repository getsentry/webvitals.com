"use client";

import { MonitorIcon, SmartphoneIcon } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  if (!data.hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Card className={className}>
          <CardContent className="py-8 text-center text-muted-foreground">
            No real-world performance data available for this URL.
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
          <CardTitle>Real-World Performance Data</CardTitle>
        </CardHeader>
        <CardContent>
          {navigationMarkup}
          {contentMarkup}
        </CardContent>
      </Card>
    </motion.div>
  );
}
