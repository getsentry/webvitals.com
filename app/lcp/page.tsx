import type { Metadata } from "next";
import LCPClient from "./LCPClient";

export const metadata: Metadata = {
  title: "LCP Demo - Largest Contentful Paint",
  description:
    "Learn about Largest Contentful Paint (LCP) with an interactive demo. Understand how LCP measures the time it takes for the largest content element to render and impacts user experience.",
  keywords: [
    "LCP",
    "Largest Contentful Paint",
    "Core Web Vitals",
    "performance",
    "page load speed",
  ],
  openGraph: {
    title: "LCP Demo - Largest Contentful Paint | WebVitals",
    description:
      "Learn about Largest Contentful Paint (LCP) with an interactive demo. Understand how LCP impacts user experience and page performance.",
    images: ["/lcp/opengraph-image"],
  },
  twitter: {
    title: "LCP Demo - Largest Contentful Paint | WebVitals",
    description:
      "Learn about Largest Contentful Paint (LCP) with an interactive demo. Understand how LCP impacts user experience and page performance.",
    images: ["/lcp/opengraph-image"],
  },
};

export default function LCPPage() {
  return <LCPClient />;
}
