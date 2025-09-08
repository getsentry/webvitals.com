import { Clock, MousePointer, Move3D, Paintbrush, Server } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";

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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,.1)_50%,transparent_75%)] bg-[length:20px_20px]" />
        <div className="absolute top-4 right-4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-blue-500/30 rounded-full blur-lg animate-pulse delay-700" />
      </div>
    ),
    href: "#lcp",
    cta: "Optimize Loading",
  },
  {
    name: "First Input Delay",
    shortName: "FID",
    description: "Measures interactivity - should be less than 100ms",
    detailedDescription:
      "The time from when a user first interacts with your page to when the browser responds to that interaction.",
    Icon: MousePointer,
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/20">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-500/50 rounded-full animate-ping delay-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-green-500/30 rounded-full animate-ping delay-700" />
        </div>
      </div>
    ),
    href: "#fid",
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/20">
        <div className="absolute inset-4 grid grid-cols-3 gap-2 opacity-30">
          <div className="bg-purple-400/40 rounded animate-pulse" />
          <div className="bg-purple-500/40 rounded animate-pulse delay-200" />
          <div className="bg-purple-400/40 rounded animate-pulse delay-400" />
          <div className="bg-purple-500/40 rounded animate-pulse delay-300" />
          <div className="bg-purple-400/40 rounded animate-pulse delay-100" />
          <div className="bg-purple-500/40 rounded animate-pulse delay-500" />
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
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-600/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-4 w-16 h-2 bg-orange-400/50 rounded animate-pulse" />
          <div className="absolute top-8 left-4 w-24 h-2 bg-orange-500/60 rounded animate-pulse delay-200" />
          <div className="absolute top-12 left-4 w-20 h-2 bg-orange-400/50 rounded animate-pulse delay-400" />
          <div className="absolute bottom-4 right-4 w-8 h-8 bg-orange-500/40 rounded-full animate-bounce" />
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
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-600/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-8 bg-red-400/40 rounded animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-red-400 rounded-full animate-ping delay-500" />
          </div>
        </div>
      </div>
    ),
    href: "#ttfb",
    cta: "Optimize Server",
  },
];

export default function CoreWebVitalsSection() {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Understanding Core Web Vitals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Google's Core Web Vitals are essential metrics that measure
            real-world user experience on your website
          </p>
        </div>

        <BentoGrid className="grid-cols-3 auto-rows-[22rem] mb-16">
          {metrics.map((metric, idx) => (
            <BentoCard
              key={idx}
              name={metric.name}
              className={metric.className}
              background={metric.background}
              Icon={metric.Icon}
              description={metric.detailedDescription}
              href={metric.href}
              cta={metric.cta}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
