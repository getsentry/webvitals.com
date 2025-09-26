import DemoHeader from "@/components/demo/DemoHeader";
import DemoLayout from "@/components/demo/DemoLayout";

import TTFBClient from "./TTFBClient";

export const dynamic = "force-dynamic";

const TTFB_DELAY = 2000; // ms - real server delay

export default async function TTFBPage() {
  // Create actual server delay for real TTFB measurement
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, TTFB_DELAY);
  });

  return (
    <DemoLayout currentMetric="TTFB">
      <DemoHeader
        vitalName="TTFB"
        vitalDesc="Time to First Byte"
        vitalColor="oklch(0.72 0.15 200)"
        isCore={false}
      >
        Measures the duration from when a page starts loading to when the first
        byte of content is received from the server.
      </DemoHeader>

      <TTFBClient />
    </DemoLayout>
  );
}
