import type { Metadata } from "next";
import CLSClient from "./CLSClient";

export const metadata: Metadata = {
  title: "CLS Demo - Cumulative Layout Shift",
  description:
    "Experience Cumulative Layout Shift (CLS) with an interactive demo. Learn how unexpected layout shifts affect user experience and Core Web Vitals scores.",
  keywords: [
    "CLS",
    "Cumulative Layout Shift",
    "Core Web Vitals",
    "layout stability",
    "visual stability",
  ],
  alternates: {
    canonical: "/cls",
  },
  openGraph: {
    title: "CLS Demo - Cumulative Layout Shift | WebVitals",
    description:
      "Experience Cumulative Layout Shift (CLS) with an interactive demo. Learn how layout shifts affect user experience and performance.",
    images: ["/cls/opengraph-image"],
  },
  twitter: {
    title: "CLS Demo - Cumulative Layout Shift | WebVitals",
    description:
      "Experience Cumulative Layout Shift (CLS) with an interactive demo. Learn how layout shifts affect user experience and performance.",
    images: ["/cls/opengraph-image"],
  },
};

export const dynamic = "force-dynamic";

export default function CLSPage() {
  return <CLSClient />;
}
