import type { Metadata } from "next";
import "./globals.css";
import { AIDevtools } from "@ai-sdk-tools/devtools";

import ThemeProvider from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "WebVitals - Analyze Your Site's Performance",
  description:
    "Unlock your website's potential with instant Web Vitals analysis powered by Lighthouse",
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
