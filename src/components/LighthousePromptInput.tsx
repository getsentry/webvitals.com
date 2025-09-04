"use client";

import type { ChatStatus } from "ai";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import type {
  LighthouseCategory,
  LighthouseConfig,
  LighthouseFormFactor,
  ThrottlingPreset,
} from "@/types/lighthouse";
import {
  CATEGORY_LABELS,
  DEFAULT_LIGHTHOUSE_CONFIG,
  FORM_FACTOR_LABELS,
  THROTTLING_LABELS,
  THROTTLING_PRESETS,
} from "@/types/lighthouse";

interface LighthousePromptInputProps {
  onSubmit: (domain: string, config: LighthouseConfig) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export default function LighthousePromptInput({
  onSubmit,
  disabled = false,
  className,
}: LighthousePromptInputProps) {
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [config, setConfig] = useState<LighthouseConfig>(
    DEFAULT_LIGHTHOUSE_CONFIG,
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!domain.trim() || status === "submitted" || disabled) return;

    setStatus("submitted");
    try {
      await onSubmit(domain.trim(), config);
    } finally {
      setStatus("ready");
    }
  };

  const toggleCategory = (category: LighthouseCategory) => {
    const categories = config.categories.includes(category)
      ? config.categories.filter((c) => c !== category)
      : [...config.categories, category];
    setConfig({ ...config, categories });
  };

  return (
    <PromptInput onSubmit={handleSubmit} className={className}>
      <PromptInputTextarea
        onChange={(e) => setDomain(e.target.value)}
        value={domain}
        placeholder="Enter your domain (e.g., example.com)"
        className="min-h-[3rem] text-base"
        rows={1}
        disabled={disabled || status === "submitted"}
      />
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputModelSelect
            value={config.formFactor}
            onValueChange={(value: LighthouseFormFactor) =>
              setConfig({ ...config, formFactor: value })
            }
          >
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              {Object.entries(FORM_FACTOR_LABELS).map(([value, label]) => (
                <PromptInputModelSelectItem key={value} value={value}>
                  {label}
                </PromptInputModelSelectItem>
              ))}
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>

          <PromptInputModelSelect
            value={config.throttling.preset}
            onValueChange={(value: ThrottlingPreset) =>
              setConfig({
                ...config,
                throttling: { ...THROTTLING_PRESETS[value] },
              })
            }
          >
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              {Object.entries(THROTTLING_LABELS).map(([value, label]) => (
                <PromptInputModelSelectItem key={value} value={value}>
                  {label}
                </PromptInputModelSelectItem>
              ))}
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                className="shrink-0 gap-1.5 rounded-lg text-muted-foreground justify-between px-3"
              >
                <span className="flex items-center gap-1.5">
                  <span>{config.categories.length} Categories</span>
                </span>
                <ChevronDownIcon size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {Object.entries(CATEGORY_LABELS).map(
                      ([category, label]) => (
                        <CommandItem
                          key={category}
                          value={category}
                          onSelect={() =>
                            toggleCategory(category as LighthouseCategory)
                          }
                          className="cursor-pointer"
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 size-4",
                              config.categories.includes(
                                category as LighthouseCategory,
                              )
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {label}
                        </CommandItem>
                      ),
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </PromptInputTools>
        <PromptInputSubmit
          disabled={!domain.trim() || disabled}
          status={status}
        />
      </PromptInputToolbar>
    </PromptInput>
  );
}
