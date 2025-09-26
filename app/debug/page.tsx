import StableLayoutGrid from "@/components/StableLayoutGrid";
import { WebVitalsScoreProvider } from "@/contexts/WebVitalsScoreContext";

export default function DebugPage() {
  return (
    <WebVitalsScoreProvider>
      <StableLayoutGrid />
    </WebVitalsScoreProvider>
  );
}