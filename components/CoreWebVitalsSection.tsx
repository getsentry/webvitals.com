"use client";

import { Clock, MousePointer, Move3D, Paintbrush, Server } from "lucide-react";
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
    description: "Measures when the largest content element becomes visible",
    explanation:
      "LCP identifies the render time of the largest image or text block visible in the viewport. It represents when the main content has finished loading.",
    Icon: Clock,
    className: "col-span-1 md:col-span-2 lg:col-span-2",
    color: "#ff0088",
    background: (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, #ff008820, #ff008840)`,
        }}
      >
        <div
          className="absolute inset-0 bg-[length:20px_20px]"
          style={{
            backgroundImage: `linear-gradient(45deg, transparent 25%, #ff008820 50%, transparent 75%)`,
          }}
        />
        <div
          className="absolute top-4 right-4 w-32 h-32 rounded-full blur-xl animate-pulse"
          style={{ backgroundColor: `#ff008840` }}
        />
        <div
          className="absolute bottom-8 left-8 w-24 h-24 rounded-full blur-lg animate-pulse"
          style={{ backgroundColor: `#ff008860`, animationDelay: "0.7s" }}
        />
      </div>
    ),
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
    color: "#dd00ee",
    background: (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, #dd00ee20, #dd00ee40)`,
        }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: `#dd00ee` }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-ping"
            style={{
              backgroundColor: `#dd00ee80`,
              animationDelay: "0.3s",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full animate-ping"
            style={{
              backgroundColor: `#dd00ee60`,
              animationDelay: "0.7s",
            }}
          />
        </div>
      </div>
    ),
    href: "https://web.dev/articles/inp",
    cta: "Learn More",
  },
  {
    id: 2,
    name: "Cumulative Layout Shift",
    shortName: "CLS",
    description: "Measures how much content moves around while loading",
    explanation:
      "CLS quantifies unexpected layout shifts that occur during page load. Every time a visible element changes position, it contributes to the CLS score.",
    Icon: Move3D,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "#9911ff",
    background: (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, #9911ff20, #9911ff40)`,
        }}
      >
        <div className="absolute inset-4 grid grid-cols-3 gap-2 opacity-30">
          <div
            className="rounded animate-pulse"
            style={{
              backgroundColor: `#9911ff60`,
            }}
          />
          <div
            className="rounded animate-pulse"
            style={{
              backgroundColor: `#9911ff80`,
              animationDelay: "0.2s",
            }}
          />
          <div
            className="rounded animate-pulse"
            style={{
              backgroundColor: `#9911ff60`,
              animationDelay: "0.4s",
            }}
          />
          <div
            className="rounded animate-pulse"
            style={{
              backgroundColor: `#9911ff80`,
              animationDelay: "0.3s",
            }}
          />
          <div
            className="rounded animate-pulse"
            style={{
              backgroundColor: `#9911ff60`,
              animationDelay: "0.1s",
            }}
          />
          <div
            className="rounded animate-pulse"
            style={{
              backgroundColor: `#9911ff80`,
              animationDelay: "0.5s",
            }}
          />
        </div>
      </div>
    ),
    href: "https://web.dev/articles/cls",
    cta: "Learn More",
  },
  {
    id: 3,
    name: "First Contentful Paint",
    shortName: "FCP",
    description: "Measures when the first content appears on screen",
    explanation:
      "FCP marks the time when the browser renders the first piece of DOM content (text, images, non-white canvas elements, or SVGs).",
    Icon: Paintbrush,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "#0d63f8",
    background: (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, #0d63f820, #0d63f840)`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-4 left-4 w-16 h-2 rounded animate-pulse"
            style={{
              backgroundColor: `#0d63f880`,
            }}
          />
          <div
            className="absolute top-8 left-4 w-24 h-2 rounded animate-pulse"
            style={{
              backgroundColor: `#0d63f8A0`,
              animationDelay: "0.2s",
            }}
          />
          <div
            className="absolute top-12 left-4 w-20 h-2 rounded animate-pulse"
            style={{
              backgroundColor: `#0d63f880`,
              animationDelay: "0.4s",
            }}
          />
          <div
            className="absolute bottom-4 right-4 w-8 h-8 rounded-full animate-bounce"
            style={{
              backgroundColor: `#0d63f860`,
            }}
          />
        </div>
      </div>
    ),
    href: "https://web.dev/articles/fcp",
    cta: "Learn More",
  },
  {
    id: 4,
    name: "Time to First Byte",
    shortName: "TTFB",
    description: "Measures server response time",
    explanation:
      "TTFB is the time between the browser requesting a page and receiving the first byte of information from the server.",
    Icon: Server,
    className: "col-span-1 md:col-span-1 lg:col-span-1",
    color: "#00cc88",
    background: (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, #00cc8820, #00cc8840)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div
              className="w-12 h-8 rounded animate-pulse"
              style={{
                backgroundColor: `#00cc8860`,
              }}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: `#00cc88` }}
            />
            <div
              className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full animate-ping"
              style={{
                backgroundColor: `#00cc88C0`,
                animationDelay: "0.5s",
              }}
            />
          </div>
        </div>
      </div>
    ),
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
                  <div
                    className={`group ${metric.className} rounded-xl cursor-pointer overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 relative flex flex-col`}
                  >
                    {/* Background */}
                    <div className="flex-1 relative min-h-[12rem] md:min-h-[14rem] lg:min-h-[16rem]">
                      {metric.background}
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
                      <p className="max-w-lg text-sm text-muted-foreground mb-3">
                        {metric.description}
                      </p>

                      {/* CTA */}
                      <div className="inline-flex items-end flex-1 justify-end text-sm text-foreground font-medium self-start">
                        {metric.cta} →
                      </div>
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent
                  className="max-w-6xl w-[95vw] lg:w-[90vw] h-[90vh] lg:h-[80vh] p-0 gap-0"
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
                            <DialogTitle className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
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
