import type { PerformanceConfig } from "@/types/performance-config";
import FeatureHighlights from "./FeatureHighlights";
import PageSpeedPromptInput from "./PageSpeedPromptInput";

interface HeroLandingProps {
  onSubmit: (domain: string, config: PerformanceConfig) => Promise<void>;
  disabled: boolean;
}

export default function HeroLanding({ onSubmit, disabled }: HeroLandingProps) {
  return (
    <div className="px-4 py-20">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            Analyze. Optimize. Ship.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Unlock your website's potential with real-world performance
            analysis from actual user experiences
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <PageSpeedPromptInput
            onSubmit={onSubmit}
            disabled={disabled}
            className="max-w-2xl"
          />
        </div>

        <FeatureHighlights />
      </div>
    </div>
  );
}
