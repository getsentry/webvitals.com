"use client";

import type { ChatStatus } from "ai";
import {
  CheckIcon,
  ChevronDownIcon,
  ListIcon,
  MonitorIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
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
import type {
  PageSpeedCategory,
  PageSpeedConfig,
  PageSpeedStrategy,
} from "@/types/pagespeed";
import {
  CATEGORY_LABELS,
  DEFAULT_PAGESPEED_CONFIG,
  STRATEGY_LABELS,
} from "@/types/pagespeed";

const SUGGESTED_URLS = [
  "https://claude.ai",
  "linear.app",
  "https://tailwindcss.com",
  "shadcn.com",
  "openai.com",
];

// URL validation schema that accepts URLs with or without protocol
const urlSchema = z
  .string()
  .regex(
    /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/.*)?$/i,
    "Please enter a valid URL",
  );

interface PageSpeedPromptInputProps {
  onSubmit: (domain: string, config: PageSpeedConfig) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export default function PageSpeedPromptInput({
  onSubmit,
  disabled = false,
  className,
}: PageSpeedPromptInputProps) {
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [config, setConfig] = useState<PageSpeedConfig>(
    DEFAULT_PAGESPEED_CONFIG,
  );
  const { scrollRef, showLeftFade, showRightFade } = useScrollFade(domain);

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

  const toggleCategory = (category: PageSpeedCategory) => {
    const categories = config.categories.includes(category)
      ? config.categories.filter((c) => c !== category)
      : [...config.categories, category];
    setConfig({ ...config, categories });
  };

  return (
    <div className={className}>
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          onChange={(e) => setDomain(e.target.value)}
          value={domain}
          placeholder="Enter your domain"
          className="min-h-0"
          rows={1}
          disabled={disabled || status === "submitted"}
        />
        <PromptInputToolbar>
          <PromptInputTools
            className="flex-nowrap gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE and Edge
            }}
          >
            <PromptInputModelSelect
              value={config.strategy}
              onValueChange={(value: PageSpeedStrategy) =>
                setConfig({ ...config, strategy: value })
              }
            >
              <PromptInputModelSelectTrigger className="sm:min-w-0">
                <MonitorIcon size={16} className="sm:hidden" />
                <span className="hidden sm:inline">
                  <PromptInputModelSelectValue />
                </span>
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {Object.entries(STRATEGY_LABELS).map(([value, label]) => (
                  <PromptInputModelSelectItem key={value} value={value}>
                    {label}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>

            <Popover>
              <PopoverTrigger asChild>
                <ComboboxTrigger className="sm:!min-w-0">
                  <ListIcon size={16} className="sm:hidden" />
                  <span className="hidden sm:flex items-center gap-1.5">
                    <span>{config.categories.length} Categories</span>
                  </span>
                  <ChevronDownIcon size={16} />
                </ComboboxTrigger>
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
                              toggleCategory(category as PageSpeedCategory)
                            }
                            className="cursor-pointer"
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 size-4",
                                config.categories.includes(
                                  category as PageSpeedCategory,
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
                type: "spring",
                bounce: 0.1,
                duration: 0.2,
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
                type: "spring",
                bounce: 0.1,
                duration: 0.2,
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
