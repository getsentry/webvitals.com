import type { Metadata } from "next";
import INPClient from "./INPClient";

export const metadata: Metadata = {
  title: "INP Demo - Interaction to Next Paint",
  description:
    "Test Interaction to Next Paint (INP) with an interactive demo. Learn how INP measures responsiveness and the time between user interactions and visual updates.",
  keywords: [
    "INP",
    "Interaction to Next Paint",
    "Core Web Vitals",
    "responsiveness",
    "user interaction",
  ],
  alternates: {
    canonical: "/inp",
  },
  openGraph: {
    title: "INP Demo - Interaction to Next Paint | WebVitals",
    description:
      "Test Interaction to Next Paint (INP) with an interactive demo. Learn how INP measures page responsiveness and user interaction delays.",
    images: ["/inp/opengraph-image"],
  },
  twitter: {
    title: "INP Demo - Interaction to Next Paint | WebVitals",
    description:
      "Test Interaction to Next Paint (INP) with an interactive demo. Learn how INP measures page responsiveness and user interaction delays.",
    images: ["/inp/opengraph-image"],
  },
};

export const dynamic = "force-dynamic";

export default function INPPage() {
  return <INPClient />;
}
