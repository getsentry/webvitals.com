import { Provider } from "@ai-sdk-tools/store";
import CoreWebVitalsSection from "@/components/CoreWebVitalsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { WebVitalsScoreProvider } from "@/contexts/WebVitalsScoreContext";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Provider>
      <WebVitalsScoreProvider>
        <main>
          <HeroSection />
          <CoreWebVitalsSection />
          <FAQSection />
        </main>
        <Footer />
      </WebVitalsScoreProvider>
    </Provider>
  );
}
