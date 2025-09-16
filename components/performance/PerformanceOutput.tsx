import { MonitorIcon, SmartphoneIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebVitalsScore } from "@/contexts/WebVitalsScoreContext";
import type { DeviceType } from "@/types/performance-config";

import type { RealWorldPerformanceOutput } from "@/types/real-world-performance";
import DeviceMetrics from "./DeviceMetrics";

interface PerformanceOutputProps {
  output: RealWorldPerformanceOutput;
}

export default function PerformanceOutput({ output }: PerformanceOutputProps) {
  const { scores } = useWebVitalsScore();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("mobile");

  const navigationMarkup = useMemo(() => {
    if (!output.hasData) return null;
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
    output.hasData,
    selectedDevice,
  ]);

  const contentMarkup = useMemo(() => {
    if (!output.hasData) return null;
    const hasMultipleDevices =
      output.mobile?.fieldData && output.desktop?.fieldData;
    if (!hasMultipleDevices) {
      const deviceData = output.mobile?.fieldData
        ? output.mobile
        : output.desktop;
      if (!deviceData) return null;
      return <DeviceMetrics deviceData={deviceData} />;
    }
    const deviceData =
      selectedDevice === "mobile" ? output.mobile : output.desktop;
    if (!deviceData) return null;
    return (
      <DeviceMetrics
        deviceData={deviceData}
        animationDirection={selectedDevice === "mobile" ? -1 : 1}
      />
    );
  }, [selectedDevice, output.mobile, output.desktop, output.hasData]);

  if (!output.hasData) {
    return (
      <div className="p-4 text-muted-foreground">
        No real-world performance data available for this URL.
      </div>
    );
  }

  return (
    <div className="p-4">
      {navigationMarkup}
      {contentMarkup}
    </div>
  );
}
