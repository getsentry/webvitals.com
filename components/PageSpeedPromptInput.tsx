"use client";

import type { ChatStatus } from "ai";
import {
  CheckIcon,
  ChevronDownIcon,
  MonitorIcon,
  SmartphoneIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ui/ai-elements/prompt-input";
import {
  Suggestion,
  Suggestions,
} from "@/components/ui/ai-elements/suggestion";
import { ComboboxTrigger } from "@/components/ui/combobox-trigger";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useScrollFade } from "@/hooks/useScrollFade";
import { cn } from "@/lib/utils";
import type { DeviceType, PerformanceConfig } from "@/types/performance-config";
import {
  DEFAULT_PERFORMANCE_CONFIG,
  DEVICE_LABELS,
} from "@/types/performance-config";

const SUGGESTED_URLS = [
  "vercel.com",
  "claude.ai",
  "linear.app",
  "tailwindcss.com",
  "shadcn.com",
  "openai.com",
  "sentry.io",
  "cloudflare.com",
];

// URL validation schema that accepts URLs with or without protocol
const urlSchema = z
  .string()
  .regex(
    /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/.*)?$/i,
    "Please enter a valid URL",
  );

interface PageSpeedPromptInputProps {
  onSubmit: (domain: string, config: PerformanceConfig) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export default function PageSpeedPromptInput({
  onSubmit,
  disabled = false,
  className,
}: PageSpeedPromptInputProps) {
  const searchParams = useSearchParams();
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [config, setConfig] = useState<PerformanceConfig>(
    DEFAULT_PERFORMANCE_CONFIG,
  );
  const [devicesPopoverOpen, setDevicesPopoverOpen] = useState(false);
  const { scrollRef, showLeftFade, showRightFade } = useScrollFade(domain);

  useEffect(() => {
    if (searchParams.get("domain") && searchParams.get("domain") !== domain) {
      setDomain(searchParams.get("domain") || "");
    }
  }, []);

  // Validate URL using zod schema
  const isValidUrl = useMemo(() => {
    return urlSchema.safeParse(domain).success;
  }, [domain]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidUrl || status === "submitted" || disabled) return;

    setStatus("submitted");
    try {
      await onSubmit(domain.trim(), config);
    } finally {
      setStatus("ready");
    }
  };

  const toggleDevice = (device: DeviceType) => {
    const devices = config.devices.includes(device)
      ? config.devices.filter((d) => d !== device)
      : [...config.devices, device];

    // Ensure at least one device is selected
    if (devices.length === 0) return;

    setConfig({ ...config, devices });
  };

  const getDeviceIcons = () => {
    const selectedDevices = config.devices;
    if (selectedDevices.length === 2) {
      return (
        <>
          <SmartphoneIcon size={16} />
          <MonitorIcon size={16} />
        </>
      );
    }
    if (selectedDevices.includes("mobile")) {
      return <SmartphoneIcon size={16} />;
    }
    if (selectedDevices.includes("desktop")) {
      return <MonitorIcon size={16} />;
    }
    return <MonitorIcon size={16} />;
  };

  const getDevicesLabel = () => {
    const selectedDevices = config.devices;
    if (selectedDevices.length === 2) {
      return "Both";
    }
    if (selectedDevices.includes("mobile")) {
      return "Mobile";
    }
    if (selectedDevices.includes("desktop")) {
      return "Desktop";
    }
    return "Desktop";
  };

  return (
    <div className={className}>
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          autoFocus
          onChange={(e) => setDomain(e.target.value)}
          value={domain}
          placeholder="Enter your domain"
          className="min-h-0"
          rows={1}
          disabled={disabled || status === "submitted"}
        />
        <PromptInputToolbar>
          <PromptInputTools>
            <Popover
              open={devicesPopoverOpen}
              onOpenChange={setDevicesPopoverOpen}
            >
              <PopoverTrigger asChild>
                <ComboboxTrigger className="sm:!min-w-0">
                  <span className="flex items-center gap-1.5 sm:hidden">
                    {getDeviceIcons()}
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5">
                    {getDeviceIcons()}
                    <span>{getDevicesLabel()}</span>
                  </span>
                  <ChevronDownIcon size={16} />
                </ComboboxTrigger>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandEmpty>No devices found.</CommandEmpty>
                    <CommandGroup>
                      {Object.entries(DEVICE_LABELS).map(([device, label]) => (
                        <CommandItem
                          key={device}
                          value={device}
                          onSelect={() => toggleDevice(device as DeviceType)}
                          className="cursor-pointer"
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 size-4",
                              config.devices.includes(device as DeviceType)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="flex items-center gap-2">
                            {device === "mobile" ? (
                              <SmartphoneIcon size={16} />
                            ) : (
                              <MonitorIcon size={16} />
                            )}
                            {label}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </PromptInputTools>
          <PromptInputSubmit
            disabled={!isValidUrl || disabled}
            status={status}
          />
        </PromptInputToolbar>
      </PromptInput>

      <div className="mt-3 relative grid w-full">
        <AnimatePresence>
          {showLeftFade && (
            <motion.div
              key="left-fade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"
            />
          )}
          {showRightFade && (
            <motion.div
              key="right-fade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"
            />
          )}
        </AnimatePresence>
        <Suggestions ref={scrollRef}>
          <h2 className="sr-only">Suggested URLs</h2>
          {SUGGESTED_URLS.map((url) => (
            <Suggestion
              key={url}
              suggestion={url}
              onClick={(suggestion) => setDomain(suggestion)}
            />
          ))}
        </Suggestions>
      </div>
    </div>
  );
}
