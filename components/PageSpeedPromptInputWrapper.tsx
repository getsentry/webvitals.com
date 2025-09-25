"use client";

import { Suspense } from "react";
import type { PerformanceConfig } from "@/types/performance-config";
import PageSpeedPromptInput from "./PageSpeedPromptInput";

interface PageSpeedPromptInputWrapperProps {
  onSubmit: (domain: string, config: PerformanceConfig) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

function PageSpeedPromptInputFallback() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-muted rounded-lg"></div>
    </div>
  );
}

export default function PageSpeedPromptInputWrapper({
  onSubmit,
  disabled = false,
  className,
}: PageSpeedPromptInputWrapperProps) {
  return (
    <Suspense fallback={<PageSpeedPromptInputFallback />}>
      <PageSpeedPromptInput
        onSubmit={onSubmit}
        disabled={disabled}
        className={className}
      />
    </Suspense>
  );
}
