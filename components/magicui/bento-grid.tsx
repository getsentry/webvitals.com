"use client";

import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BentoGridProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  className?: string;
}

interface BentoCardProps extends React.ComponentPropsWithoutRef<"div"> {
  name: string;
  className: string;
  background: React.ReactNode;
  Icon: React.ElementType;
  description: string;
  href: string;
  cta: string;
  isExternalLink?: boolean;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  isExternalLink,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // light styles
      "bg-card border border-border shadow-sm",
      // dark styles
      "transform-gpu dark:bg-card dark:border-border dark:shadow-sm",
      className,
    )}
    {...props}
  >
    <div>{background}</div>
    <div className="p-4">
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-foreground transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-foreground">{name}</h3>
        <p className="max-w-lg text-muted-foreground">{description}</p>
      </div>

      <div
        className={cn(
          "lg:hidden pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        <Button
          variant="link"
          asChild
          size="sm"
          className="pointer-events-auto !px-0 !py-0"
        >
          <Link
            href={href}
            target={isExternalLink ? "_blank" : undefined}
            rel={isExternalLink ? "noopener noreferrer" : undefined}
          >
            {cta}
            <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
          </Link>
        </Button>
      </div>
    </div>

    <div
      className={cn(
        "hidden lg:flex pointer-events-none absolute bottom-0 w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
      )}
    >
      <Button
        variant="link"
        asChild
        size="sm"
        className="pointer-events-auto !px-0 !py-0"
      >
        <Link
          href={href}
          target={isExternalLink ? "_blank" : undefined}
          rel={isExternalLink ? "noopener noreferrer" : undefined}
        >
          {cta}
          <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
        </Link>
      </Button>
    </div>

    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.1] group-hover:dark:bg-white/[.1]" />
  </div>
);

export { BentoCard, BentoGrid };
