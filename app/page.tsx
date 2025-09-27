import { Provider } from "@ai-sdk-tools/store";
import type { Metadata } from "next";
import CoreWebVitalsSection from "@/components/CoreWebVitalsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { WebVitalsScoreProvider } from "@/contexts/WebVitalsScoreContext";

export const metadata: Metadata = {
  title: "WebVitals - Free Core Web Vitals Analysis Tool",
  description:
    "Analyze your website's Core Web Vitals instantly. Get detailed insights into LCP, FID, CLS, FCP, INP, and TTFB performance metrics. Improve your SEO and user experience with real-world data.",
  keywords: [
    "Core Web Vitals analyzer",
    "website performance tool",
    "LCP analysis",
    "CLS checker",
    "FCP measurement",
    "INP testing",
    "TTFB optimization",
    "free SEO tool",
    "page speed insights",
    "web performance audit",
  ],
  openGraph: {
    title: "WebVitals - Free Core Web Vitals Analysis Tool",
    description:
      "Analyze your website's Core Web Vitals instantly. Get detailed insights into performance metrics that matter for SEO and user experience.",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    title: "WebVitals - Free Core Web Vitals Analysis Tool",
    description:
      "Analyze your website's Core Web Vitals instantly. Get detailed insights into performance metrics that matter for SEO and user experience.",
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
};

export default function Home() {
  return (
    <Provider>
      <WebVitalsScoreProvider>
        <main>
          <HeroSection />
          <CoreWebVitalsSection />
          <FAQSection />
        </main>
        <Footer />
      </WebVitalsScoreProvider>
    </Provider>
  );
}
