import type { Metadata } from "next";
import DemoHeader from "@/components/demo/DemoHeader";
import DemoLayout from "@/components/demo/DemoLayout";

import TTFBClient from "./TTFBClient";

export const metadata: Metadata = {
  title: "TTFB Demo - Time to First Byte",
  description:
    "Understand Time to First Byte (TTFB) with an interactive demo. Learn how TTFB measures server response time and impacts overall page performance.",
  keywords: [
    "TTFB",
    "Time to First Byte",
    "Core Web Vitals",
    "server response",
    "network latency",
  ],
  openGraph: {
    title: "TTFB Demo - Time to First Byte | WebVitals",
    description:
      "Understand Time to First Byte (TTFB) with an interactive demo. Learn how server response time affects page performance.",
    images: ["/ttfb/opengraph-image"],
  },
  twitter: {
    title: "TTFB Demo - Time to First Byte | WebVitals",
    description:
      "Understand Time to First Byte (TTFB) with an interactive demo. Learn how server response time affects page performance.",
    images: ["/ttfb/opengraph-image"],
  },
};

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
        sentryLink="https://docs.sentry.io/product/insights/frontend/web-vitals/web-vitals-concepts/#time-to-first-byte-ttfb"
      >
        Measures the duration from when a page starts loading to when the first
        byte of content is received from the server.
      </DemoHeader>

      <TTFBClient />
    </DemoLayout>
  );
}
