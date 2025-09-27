import type { Metadata } from "next";
import "./globals.css";
import { AIDevtools } from "@ai-sdk-tools/devtools";

import ThemeProvider from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const getBaseUrl = () => {
  if (process.env.VERCEL_ENV === "production") {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "WebVitals - Analyze Your Site's Performance",
    template: "%s | WebVitals",
  },
  description:
    "Unlock your website's potential with instant Web Vitals analysis powered by real user data. Understand your site's performance and get actionable insights. Made by Sentry",
  keywords: [
    "web vitals",
    "core web vitals",
    "LCP",
    "FID",
    "CLS",
    "FCP",
    "INP",
    "TTFB",
    "performance",
    "website speed",
    "SEO",
    "user experience",
  ],
  authors: [{ name: "Sentry" }],
  creator: "Sentry",
  publisher: "Sentry",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "WebVitals",
    title: "WebVitals - Analyze Your Site's Performance",
    description:
      "Unlock your website's potential with instant Web Vitals analysis powered by real user data. Understand your site's performance and get actionable insights.",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "WebVitals - Analyze Your Site's Performance",
    description:
      "Unlock your website's potential with instant Web Vitals analysis powered by real user data. Understand your site's performance and get actionable insights.",
    creator: "@getsentry",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
        {/* Only in development */}
        {process.env.NODE_ENV === "development" && <AIDevtools />}
      </body>
    </html>
  );
}
