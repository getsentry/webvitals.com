import CoreWebVitalsSection from "@/components/CoreWebVitalsSection";
import HeroSection from "@/components/HeroSection";
import { WebVitalsScoreProvider } from "@/contexts/WebVitalsScoreContext";

export default function Home() {
  return (
    <WebVitalsScoreProvider>
      <main>
        <HeroSection />
        <CoreWebVitalsSection />
      </main>
    </WebVitalsScoreProvider>
  );
}
