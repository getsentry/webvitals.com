"use client";

import { Clock, MousePointer, Move3D, Paintbrush, Server } from "lucide-react";
import {
  CLSAnimation,
  FCPAnimation,
  INPAnimation,
  LCPAnimation,
  TTFBAnimation,
} from "@/components/animations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Heading from "@/components/ui/heading";
import { useWebVitalsScore } from "@/contexts/WebVitalsScoreContext";

const metrics = [
  {
    id: 0,
    name: "Largest Contentful Paint",
    shortName: "LCP",
    description:
      "Measures the time it takes for the largest text or image element to render on a webpage.",
    explanation:
      "LCP identifies the render time of the largest image or text block visible in the viewport. It represents when the main content has finished loading.",
    Icon: Clock,
    className: "col-span-1 md:col-span-2 lg:col-span-2",
    color: "var(--color-metric-lcp)",
    BackgroundComponent: LCPAnimation,
    href: "https://web.dev/articles/lcp",
    cta: "Learn More",
  },
  {
    id: 1,
    name: "Interaction to Next Paint",
    shortName: "INP",
    description: "Measures how quickly the page responds to user interactions",
    explanation:
      "INP tracks the time from when a user interacts with your page (click, tap, key press) to when the browser paints the visual response.",
    Icon: MousePointer,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "var(--color-metric-inp)",
    BackgroundComponent: INPAnimation,
    href: "https://web.dev/articles/inp",
    cta: "Learn More",
  },
  {
    id: 2,
    name: "Cumulative Layout Shift",
    shortName: "CLS",
    description:
      "Measures the total amount of unexpected layout shifts that occur during the entire lifespan of a webpage.",
    explanation:
      "CLS quantifies unexpected layout shifts that occur during page load. Every time a visible element changes position, it contributes to the CLS score.",
    Icon: Move3D,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "var(--color-metric-cls)",
    BackgroundComponent: CLSAnimation,
    href: "https://web.dev/articles/cls",
    cta: "Learn More",
  },
  {
    id: 3,
    name: "First Contentful Paint",
    shortName: "FCP",
    description:
      "Measures the time from when a page starts loading to when any part of the page's content is first displayed.",
    explanation:
      "FCP marks the time when the browser renders the first piece of DOM content (text, images, non-white canvas elements, or SVGs).",
    Icon: Paintbrush,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "var(--color-metric-fcp)",
    BackgroundComponent: FCPAnimation,
    href: "https://web.dev/articles/fcp",
    cta: "Learn More",
  },
  {
    id: 4,
    name: "Time to First Byte",
    shortName: "TTFB",
    description:
      "Measures the duration from when a page starts loading to when the first byte of content is received from the server.",
    explanation:
      "TTFB is the time between the browser requesting a page and receiving the first byte of information from the server.",
    Icon: Server,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "var(--color-metric-ttfb)",
    BackgroundComponent: TTFBAnimation,
    href: "https://web.dev/articles/ttfb",
    cta: "Learn More",
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
          <Heading level={2} className="mb-4">
            Understanding Core Web Vitals
            {hasScores && (
              <span className="text-muted-foreground text-lg font-normal ml-2">
                - Current Analysis Results
              </span>
            )}
          </Heading>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Google's Core Web Vitals are essential metrics that measure
            real-world user experience on your website
            {hasScores && " - scores from your recent analysis are shown below"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:auto-rows-[26rem] lg:auto-rows-[24rem]">
          {metrics.map((metric) => {
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
              <Dialog key={metric.id}>
                <DialogTrigger asChild>
                  {/* Card Container */}
                  <button
                    className={`group ${metric.className} rounded-xl cursor-pointer overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.98] outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring relative flex flex-col text-left`}
                  >
                    {/* Background */}
                    <div className="flex-1 relative min-h-[12rem] md:min-h-[14rem] lg:min-h-[16rem]">
                      <metric.BackgroundComponent color={metric.color} />
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
                            {formatMetricScore(score)}
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
                  </button>
                </DialogTrigger>

                <DialogContent
                  className="max-w-6xl w-[95vw] lg:w-[90vw] p-0 gap-0"
                  showCloseButton={false}
                >
                  <div className="w-full h-full flex flex-col lg:flex-row">
                    {/* Content section */}
                    <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center overflow-y-auto">
                      <DialogHeader className="text-left space-y-4 mb-6 lg:mb-8">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 lg:w-16 h-12 lg:h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: metric.color }}
                          >
                            <metric.Icon className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
                          </div>
                          <div>
                            <DialogTitle className="font-bold text-foreground mb-2 lg:text-2xl">
                              {metric.name}
                              {formatMetricScore(score)}
                            </DialogTitle>
                            <div className="text-base lg:text-lg font-medium text-muted-foreground">
                              {metric.shortName}
                            </div>
                          </div>
                        </div>
                      </DialogHeader>

                      <DialogDescription className="text-base lg:text-lg text-muted-foreground mb-6 lg:mb-8 leading-relaxed">
                        {metric.explanation}
                      </DialogDescription>

                      <a
                        href={metric.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors self-start"
                      >
                        {metric.cta} →
                      </a>
                    </div>

                    {/* Animation area */}
                    <div
                      className="flex-1 min-h-[200px] lg:min-h-full flex items-center justify-center p-6 lg:p-8"
                      style={{ backgroundColor: `${metric.color}10` }}
                    >
                      <div className="w-full max-w-md">
                        {/* Visual demonstration placeholder */}
                        <div
                          className="rounded-lg p-6 text-center border-2 border-dashed"
                          style={{ borderColor: metric.color }}
                        >
                          <div
                            className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
                            style={{ backgroundColor: metric.color }}
                          >
                            <metric.Icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-sm font-medium text-foreground mb-2">
                            Interactive {metric.shortName} Demo
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Visual simulation coming soon
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </div>
    </section>
  );
}
