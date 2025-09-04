"use client";

import type { ComponentProps } from "react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SuggestionsProps = Omit<ComponentProps<"div">, "ref"> & {
  className?: string;
};

export const Suggestions = forwardRef<HTMLDivElement, SuggestionsProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
    style={{
      scrollbarWidth: "none", // Firefox
      msOverflowStyle: "none", // IE and Edge
    }}
    {...props}
  >
    <div className={cn("flex flex-nowrap items-center gap-2 w-max", className)}>
      {children}
    </div>
  </div>
));

Suggestions.displayName = "Suggestions";

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <Button
      className={cn("cursor-pointer rounded-full px-4", className)}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
};
