import { Provider } from "@ai-sdk-tools/store";
import CoreWebVitalsSection from "@/components/CoreWebVitalsSection";
import HeroSection from "@/components/HeroSection";
import { WebVitalsScoreProvider } from "@/contexts/WebVitalsScoreContext";

export default function Home() {
  return (
    <Provider>
      <WebVitalsScoreProvider>
        <main>
          <HeroSection />
          <CoreWebVitalsSection />
        </main>
      </WebVitalsScoreProvider>
    </Provider>
  );
}
