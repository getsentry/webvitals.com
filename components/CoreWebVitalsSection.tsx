"use client";

import { Clock, MousePointer, Move3D, Paintbrush, Server } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { useWebVitalsScore } from "@/contexts/WebVitalsScoreContext";

const metrics = [
  {
    name: "Largest Contentful Paint",
    shortName: "LCP",
    description:
      "Measures loading performance - should occur within 2.5 seconds",
    detailedDescription:
      "The render time of the largest image or text block visible within the viewport, relative to when the page first started loading.",
    Icon: Clock,
    className: "col-span-3 lg:col-span-2",
    background: (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, oklch(from var(--metric-lcp) l c h / 0.1), oklch(from var(--metric-lcp) l c h / 0.2))`,
        }}
      >
        <div
          className="absolute inset-0 bg-[length:20px_20px]"
          style={{
            backgroundImage: `linear-gradient(45deg,transparent_25%, oklch(from var(--metric-lcp) l c h / 0.1) 50%,transparent_75%)`,
          }}
        />
        <div
          className="absolute top-4 right-4 w-32 h-32 rounded-full blur-xl animate-pulse"
          style={{
            backgroundColor: `oklch(from var(--metric-lcp) l c h / 0.2)`,
          }}
        />
        <div
          className="absolute bottom-8 left-8 w-24 h-24 rounded-full blur-lg animate-pulse delay-700"
          style={{
            backgroundColor: `oklch(from var(--metric-lcp) l c h / 0.3)`,
          }}
        />
      </div>
    ),
    href: "#lcp",
    cta: "Optimize Loading",
  },
  {
    name: "Interaction to Next Paint",
    shortName: "INP",
    description: "Measures responsiveness - should be less than 200ms",
    detailedDescription:
      "The time from when a user interacts with your page to when the visual response is painted on screen.",
    Icon: MousePointer,
    className: "col-span-3 lg:col-span-1",
    background: (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, oklch(from var(--metric-si) l c h / 0.1), oklch(from var(--metric-si) l c h / 0.2))`,
        }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: `var(--metric-si)` }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-ping delay-300"
            style={{
              backgroundColor: `oklch(from var(--metric-si) l c h / 0.5)`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full animate-ping delay-700"
            style={{
              backgroundColor: `oklch(from var(--metric-si) l c h / 0.3)`,
            }}
          />
        </div>
      </div>
    ),
    href: "#inp",
    cta: "Improve Response",
  },
  {
    name: "Cumulative Layout Shift",
    shortName: "CLS",
    description: "Measures visual stability - should be less than 0.1",
    detailedDescription:
      "The sum of all individual layout shift scores for every unexpected layout shift during the page's lifespan.",
    Icon: Move3D,
    className: "col-span-3 lg:col-span-1",
    background: (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, oklch(from var(--metric-cls) l c h / 0.1), oklch(from var(--metric-cls) l c h / 0.2))`,
        }}
      >
        <div className="absolute inset-4 grid grid-cols-3 gap-2 opacity-30">
          <div
            className="rounded animate-pulse"
            style={{
              backgroundColor: `oklch(from var(--metric-cls) l c h / 0.4)`,
            }}
          />
          <div
            className="rounded animate-pulse delay-200"
            style={{
              backgroundColor: `oklch(from var(--metric-cls) l c h / 0.5)`,
            }}
          />
          <div
            className="rounded animate-pulse delay-400"
            style={{
              backgroundColor: `oklch(from var(--metric-cls) l c h / 0.4)`,
            }}
          />
          <div
            className="rounded animate-pulse delay-300"
            style={{
              backgroundColor: `oklch(from var(--metric-cls) l c h / 0.5)`,
            }}
          />
          <div
            className="rounded animate-pulse delay-100"
            style={{
              backgroundColor: `oklch(from var(--metric-cls) l c h / 0.4)`,
            }}
          />
          <div
            className="rounded animate-pulse delay-500"
            style={{
              backgroundColor: `oklch(from var(--metric-cls) l c h / 0.5)`,
            }}
          />
        </div>
      </div>
    ),
    href: "#cls",
    cta: "Fix Layout Shifts",
  },
  {
    name: "First Contentful Paint",
    shortName: "FCP",
    description: "Measures when first content is painted - within 1.8s",
    detailedDescription:
      "Marks the first time any content becomes visible to the user.",
    Icon: Paintbrush,
    className: "col-span-3 lg:col-span-1",
    background: (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, oklch(from var(--metric-fcp) l c h / 0.1), oklch(from var(--metric-fcp) l c h / 0.2))`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-4 left-4 w-16 h-2 rounded animate-pulse"
            style={{
              backgroundColor: `oklch(from var(--metric-fcp) l c h / 0.5)`,
            }}
          />
          <div
            className="absolute top-8 left-4 w-24 h-2 rounded animate-pulse delay-200"
            style={{
              backgroundColor: `oklch(from var(--metric-fcp) l c h / 0.6)`,
            }}
          />
          <div
            className="absolute top-12 left-4 w-20 h-2 rounded animate-pulse delay-400"
            style={{
              backgroundColor: `oklch(from var(--metric-fcp) l c h / 0.5)`,
            }}
          />
          <div
            className="absolute bottom-4 right-4 w-8 h-8 rounded-full animate-bounce"
            style={{
              backgroundColor: `oklch(from var(--metric-fcp) l c h / 0.4)`,
            }}
          />
        </div>
      </div>
    ),
    href: "#fcp",
    cta: "Speed Up Paint",
  },
  {
    name: "Time to First Byte",
    shortName: "TTFB",
    description: "Measures server responsiveness - less than 600ms",
    detailedDescription:
      "The time between the request for a resource and when the first byte arrives.",
    Icon: Server,
    className: "col-span-3 lg:col-span-1",
    background: (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, oklch(from var(--metric-tbt) l c h / 0.1), oklch(from var(--metric-tbt) l c h / 0.2))`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div
              className="w-12 h-8 rounded animate-pulse"
              style={{
                backgroundColor: `oklch(from var(--metric-tbt) l c h / 0.4)`,
              }}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: `var(--metric-tbt)` }}
            />
            <div
              className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full animate-ping delay-500"
              style={{
                backgroundColor: `oklch(from var(--metric-tbt) l c h / 0.8)`,
              }}
            />
          </div>
        </div>
      </div>
    ),
    href: "#ttfb",
    cta: "Optimize Server",
  },
];

export default function CoreWebVitalsSection() {
  const { scores, hasScores } = useWebVitalsScore();

  const getMetricScore = (metricKey: string) => {
    if (!hasScores) return null;

    // Try mobile first, then desktop
    const deviceScores = scores.mobile || scores.desktop;
    if (!deviceScores) return null;

    const metric = deviceScores.metrics.find((m) => m.key === metricKey);
    return metric?.score || null;
  };

  const formatMetricScore = (score: number | null) => {
    if (score === null) return "";
    return ` (${score})`;
  };

  return (
    <section className="py-24 pb-0 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Understanding Core Web Vitals
            {hasScores && (
              <span className="text-muted-foreground text-lg font-normal ml-2">
                - Current Analysis Results
              </span>
            )}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Google's Core Web Vitals are essential metrics that measure
            real-world user experience on your website
            {hasScores && " - scores from your recent analysis are shown below"}
          </p>
        </div>

        <BentoGrid className="grid-cols-3 auto-rows-[22rem]">
          {metrics.map((metric, idx) => {
            const metricMappings: Record<string, string> = {
              "Largest Contentful Paint": "largest-contentful-paint",
              "Interaction to Next Paint": "interaction-to-next-paint",
              "Cumulative Layout Shift": "cumulative-layout-shift",
              "First Contentful Paint": "first-contentful-paint",
              "Time to First Byte": "experimental-time-to-first-byte",
            };

            const metricKey = metricMappings[metric.name];
            const score = getMetricScore(metricKey);

            return (
              <BentoCard
                key={idx}
                name={metric.name + formatMetricScore(score)}
                className={metric.className}
                background={metric.background}
                Icon={metric.Icon}
                description={metric.detailedDescription}
                href={metric.href}
                cta={metric.cta}
              />
            );
          })}
        </BentoGrid>
      </div>
    </section>
  );
}
