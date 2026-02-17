import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
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
  alternates: {
    canonical: "/ttfb",
  },
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

export default function TTFBPage() {
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
        <Link
          href="https://docs.sentry.io/product/insights/frontend/web-vitals/web-vitals-concepts/#time-to-first-byte-ttfb?ref=webvitals.com"
          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more <ExternalLink className="size-3 " />
        </Link>
      </DemoHeader>

      <TTFBClient />
    </DemoLayout>
  );
}
