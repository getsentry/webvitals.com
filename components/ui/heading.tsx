import { cn } from "@/lib/utils";
import type * as React from "react";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  variant?: "primary" | "secondary" | "muted";
  children: React.ReactNode;
}

const sizeClasses = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg", 
  xl: "text-xl",
  "2xl": "text-xl md:text-2xl",
  "3xl": "text-2xl md:text-3xl",
  "4xl": "text-3xl md:text-4xl lg:text-5xl",
};

const weightClasses = {
  normal: "font-normal",
  medium: "font-medium", 
  semibold: "font-semibold",
  bold: "font-bold",
};

const variantClasses = {
  primary: "text-foreground",
  secondary: "text-foreground",
  muted: "text-muted-foreground",
};

export default function Heading({
  level = 2,
  size,
  weight = "bold",
  variant = "primary",
  className,
  children,
  ...props
}: HeadingProps) {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  // Default size based on level if not specified
  const defaultSize = size || {
    1: "4xl" as const,
    2: "3xl" as const, 
    3: "2xl" as const,
    4: "xl" as const,
    5: "lg" as const,
    6: "base" as const,
  }[level];

  const headingClasses = cn(
    sizeClasses[defaultSize],
    weightClasses[weight],
    variantClasses[variant],
    level <= 2 && "tracking-tight",
    className
  );

  return (
    <Component className={headingClasses} {...props}>
      {children}
    </Component>
  );
}