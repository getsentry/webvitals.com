"use client";

import type { ChatStatus } from "ai";
import { useState } from "react";
import type { LighthouseConfig } from "@/types/lighthouse";
import LighthousePromptInput from "./LighthousePromptInput";
import { ThemeToggle } from "./ThemeToggle";

export default function HeroSection() {
  const [status, setStatus] = useState<ChatStatus>("ready");

  const handleLighthouseSubmit = async (
    domain: string,
    config: LighthouseConfig,
  ) => {
    setStatus("submitted");
    // TODO: Implement Lighthouse analysis with domain and config
    console.log("Analyzing:", domain, "with config:", config);
    setTimeout(() => setStatus("ready"), 3000);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, transparent 70%)",
        }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            Analyze. Optimize. Ship.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Unlock your website's potential with instant Web Vitals analysis
            powered by Lighthouse
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <LighthousePromptInput
            onSubmit={handleLighthouseSubmit}
            disabled={status === "submitted"}
            className="max-w-2xl"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>Performance insights</title>
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <span>Performance insights</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>Speed optimization</title>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span>Speed optimization</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>Real-time metrics</title>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <span>Real-time metrics</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/60"
        >
          <title>Scroll down</title>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
