import { MonitorIcon, SmartphoneIcon } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/primitives/animate/tabs";
import { useWebVitalsScore } from "@/contexts/WebVitalsScoreContext";
import type { RealWorldPerformanceOutput } from "@/types/real-world-performance";
import DeviceMetrics from "./DeviceMetrics";

interface PerformanceOutputProps {
  output: RealWorldPerformanceOutput;
}

export default function PerformanceOutput({ output }: PerformanceOutputProps) {
  const { scores } = useWebVitalsScore();

  if (!output.hasData) {
    return (
      <div className="p-4 text-muted-foreground">
        No real-world performance data available for this URL.
      </div>
    );
  }

  const hasMultipleDevices =
    output.mobile?.fieldData && output.desktop?.fieldData;

  if (!hasMultipleDevices) {
    const deviceData = output.mobile?.fieldData
      ? output.mobile
      : output.desktop;

    if (!deviceData) return null;

    return (
      <div className="p-4">
        <DeviceMetrics deviceData={deviceData} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Tabs defaultValue="mobile" className="w-full">
        <TabsHighlight className="bg-background absolute z-0 inset-0 rounded-xl">
          <TabsList className="h-10 inline-flex p-1 bg-muted w-full rounded-xl">
            <TabsHighlightItem value="mobile" className="flex-1">
              <TabsTrigger
                value="mobile"
                className="h-full px-4 py-2 w-full text-sm flex items-center justify-center gap-2"
              >
                <SmartphoneIcon size={16} />
                Mobile
                {scores.mobile && (
                  <span className="ml-1 font-semibold text-xs">
                    ({scores.mobile.overallScore})
                  </span>
                )}
              </TabsTrigger>
            </TabsHighlightItem>
            <TabsHighlightItem value="desktop" className="flex-1">
              <TabsTrigger
                value="desktop"
                className="h-full px-4 py-2 w-full text-sm flex items-center justify-center gap-2"
              >
                <MonitorIcon size={16} />
                Desktop
                {scores.desktop && (
                  <span className="ml-1 font-semibold text-xs">
                    ({scores.desktop.overallScore})
                  </span>
                )}
              </TabsTrigger>
            </TabsHighlightItem>
          </TabsList>
        </TabsHighlight>

        <TabsContents className="mt-6">
          <TabsContent value="mobile">
            {output.mobile && <DeviceMetrics deviceData={output.mobile} />}
          </TabsContent>
          <TabsContent value="desktop">
            {output.desktop && <DeviceMetrics deviceData={output.desktop} />}
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
}
