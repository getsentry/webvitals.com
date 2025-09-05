"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/ai-elements/loader";

const WEB_VITALS_FACTS = [
  {
    fact: "53% of mobile users abandon sites that take longer than 3 seconds to load",
    source: "Google/SOASTA Research"
  },
  {
    fact: "A 1-second delay in page response can result in a 7% reduction in conversions",
    source: "Akamai Study"
  },
  {
    fact: "Core Web Vitals became Google ranking factors in May 2021",
    source: "Google Search Central"
  },
  {
    fact: "The average mobile page takes 15.3 seconds to fully load",
    source: "Google/SOASTA Research"
  },
  {
    fact: "Images account for 21% of total webpage weight on average",
    source: "HTTP Archive 2024"
  },
  {
    fact: "A 100ms improvement in page load time can increase conversion rates by 1%",
    source: "Amazon Case Study"
  },
  {
    fact: "Pages with good Core Web Vitals have 24% lower abandonment rates",
    source: "Google Research"
  },
  {
    fact: "First Contentful Paint should occur within 1.8 seconds for good user experience",
    source: "Google Web Vitals"
  },
  {
    fact: "Cumulative Layout Shift above 0.25 is considered poor user experience",
    source: "Google Core Web Vitals"
  },
  {
    fact: "75% of global mobile connections are on 3G or slower networks",
    source: "GSMA Intelligence"
  },
  {
    fact: "A 2-second delay in web page load time increases bounce rates by 103%",
    source: "Akamai Research"
  },
  {
    fact: "Pinterest reduced load times by 40% and saw a 15% increase in sign-ups",
    source: "Pinterest Engineering"
  }
];

interface WebVitalsFactsProps {
  className?: string;
}

export default function WebVitalsFacts({ className }: WebVitalsFactsProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % WEB_VITALS_FACTS.length);
    }, 3000); // Change fact every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const currentFact = WEB_VITALS_FACTS[currentFactIndex];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* AI Elements Loader */}
      <div className="flex-shrink-0">
        <Loader size={16} />
      </div>

      {/* Rotating facts */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFactIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94] // ease-out-quad
              }
            }}
            exit={{ 
              opacity: 0, 
              y: -10,
              transition: {
                duration: 0.2,
                ease: [0.55, 0.085, 0.68, 0.53] // ease-in-quad
              }
            }}
            className="space-y-1"
          >
            <p className="text-sm text-foreground font-medium">
              {currentFact.fact}
            </p>
            <p className="text-xs text-muted-foreground">
              — {currentFact.source}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}