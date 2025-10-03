import type { Metadata } from "next";
import FCPClient from "./FCPClient";

export const metadata: Metadata = {
  title: "FCP Demo - First Contentful Paint",
  description:
    "Explore First Contentful Paint (FCP) with an interactive demo. Learn how FCP measures the time until users see the first content appear on your webpage.",
  keywords: [
    "FCP",
    "First Contentful Paint",
    "Core Web Vitals",
    "page load speed",
    "initial render",
  ],
  openGraph: {
    title: "FCP Demo - First Contentful Paint | WebVitals",
    description:
      "Explore First Contentful Paint (FCP) with an interactive demo. Learn how FCP measures initial content rendering and user perception.",
    images: ["/fcp/opengraph-image"],
  },
  twitter: {
    title: "FCP Demo - First Contentful Paint | WebVitals",
    description:
      "Explore First Contentful Paint (FCP) with an interactive demo. Learn how FCP measures initial content rendering and user perception.",
    images: ["/fcp/opengraph-image"],
  },
};

export const dynamic = "force-dynamic";

export default function FCPPage() {
  return <FCPClient />;
}
