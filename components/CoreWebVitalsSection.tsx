"use client";

import { Clock, MousePointer, Move3D, Paintbrush, Server } from "lucide-react";
import { useState } from "react";
import {
  CLSAnimation,
  FCPAnimation,
  INPAnimation,
  LCPAnimation,
  TTFBAnimation,
} from "@/components/animations";

import Heading from "@/components/ui/heading";
import { useIsMobile } from "@/hooks/use-mobile";

const metrics = [
  {
    id: 0,
    name: "Largest Contentful Paint",
    shortName: "LCP",
    description:
      "Measures the time it takes for the largest text or image element to render on a webpage.",
    Icon: Clock,
    className: "col-span-1 md:col-span-2 lg:col-span-2",
    color: "var(--color-metric-lcp)",
    BackgroundComponent: LCPAnimation,
    href: "/lcp",
    cta: "Watch slow loading",
  },
  {
    id: 1,
    name: "Interaction to Next Paint",
    shortName: "INP",
    description: "Measures how quickly the page responds to user interactions",
    Icon: MousePointer,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "var(--color-metric-inp)",
    BackgroundComponent: INPAnimation,
    href: "/inp",
    cta: "Experience slow response",
  },
  {
    id: 2,
    name: "Cumulative Layout Shift",
    shortName: "CLS",
    description:
      "Measures the total amount of unexpected layout shifts that occur during the entire lifespan of a webpage.",
    Icon: Move3D,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "var(--color-metric-cls)",
    BackgroundComponent: CLSAnimation,
    href: "/cls",
    cta: "See layout shifts",
  },
  {
    id: 3,
    name: "First Contentful Paint",
    shortName: "FCP",
    description:
      "Measures the time from when a page starts loading to when any part of the page's content is first displayed.",
    Icon: Paintbrush,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "var(--color-metric-fcp)",
    BackgroundComponent: FCPAnimation,
    href: "/fcp",
    cta: "Watch blank page",
  },
  {
    id: 4,
    name: "Time to First Byte",
    shortName: "TTFB",
    description:
      "Measures the duration from when a page starts loading to when the first byte of content is received from the server.",
    Icon: Server,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "var(--color-metric-ttfb)",
    BackgroundComponent: TTFBAnimation,
    href: "/ttfb",
    cta: "Test server delays",
  },
];

export default function CoreWebVitalsSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [focusedCard, setFocusedCard] = useState<number | null>(null);
  const isMobile = useIsMobile();

  return (
    <section className="py-24 pb-0 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Heading level={2} className="mb-4">
            Understanding Core Web Vitals
          </Heading>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Google's Core Web Vitals are essential metrics that measure
            real-world user experience on your website
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:auto-rows-[26rem] lg:auto-rows-[24rem]">
          {metrics.map((metric) => {
            return (
              <a
                key={metric.id}
                id={`metric-${metric.shortName.toLowerCase()}`}
                href={metric.href}
                className={`group ${metric.className} rounded-xl cursor-pointer overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.98] outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring relative flex flex-col text-left`}
                onMouseEnter={() => setHoveredCard(metric.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onFocus={() => setFocusedCard(metric.id)}
                onBlur={() => setFocusedCard(null)}
              >
                {/* Background */}
                <div className="flex-1 relative min-h-[12rem] md:min-h-[14rem] lg:min-h-[16rem]">
                  <metric.BackgroundComponent
                    color={metric.color}
                    paused={
                      isMobile
                        ? false
                        : hoveredCard !== metric.id && focusedCard !== metric.id
                    }
                  />
                </div>

                {/* Card Info */}
                <div
                  className="flex flex-col gap-1 p-3 bg-card mt-0 
                               md:static md:mt-0 md:p-3
                               lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:mt-auto lg:min-h-43 lg:p-4 lg:transition-all lg:duration-300 lg:group-hover:translate-y-0 lg:group-focus:translate-y-0 lg:translate-y-10"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: metric.color }}
                    >
                      <metric.Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Heading level={3} size="xl" weight="semibold">
                        {metric.name}
                      </Heading>
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.shortName}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {metric.description}
                  </p>

                  {/* CTA */}
                  <div className="inline-flex items-end flex-1 justify-end text-sm text-foreground font-medium self-start">
                    {metric.cta} →
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
