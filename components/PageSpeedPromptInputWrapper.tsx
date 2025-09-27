"use client";

import { ChevronDownIcon, MonitorIcon, SmartphoneIcon } from "lucide-react";
import { Suspense } from "react";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ui/ai-elements/prompt-input";
import { ComboboxTrigger } from "@/components/ui/combobox-trigger";
import type { PerformanceConfig } from "@/types/performance-config";
import PageSpeedPromptInput from "./PageSpeedPromptInput";

interface PageSpeedPromptInputWrapperProps {
  onSubmit: (domain: string, config: PerformanceConfig) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

function PageSpeedPromptInputFallback() {
  return (
    <PromptInput onSubmit={() => {}}>
      <PromptInputTextarea
        value=""
        placeholder="Enter your domain"
        className="min-h-0"
        rows={1}
        disabled
        onChange={() => {}}
      />
      <PromptInputToolbar>
        <PromptInputTools>
          <ComboboxTrigger className="sm:!min-w-0" disabled>
            <span className="flex items-center gap-1.5 sm:hidden">
              <SmartphoneIcon size={16} />
              <MonitorIcon size={16} />
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <SmartphoneIcon size={16} />
              <MonitorIcon size={16} />
              <span>Both</span>
            </span>
            <ChevronDownIcon size={16} />
          </ComboboxTrigger>
        </PromptInputTools>
        <PromptInputSubmit disabled status="ready" />
      </PromptInputToolbar>
    </PromptInput>
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
