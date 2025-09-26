import DemoLayout from "@/components/demo/DemoLayout";
import DemoHeader from "@/components/demo/DemoHeader";
import LoadingSimulation from "@/components/demo/LoadingSimulation";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/heading";

export const dynamic = "force-dynamic";

const FCP_DELAY = 2000; // ms

// Server-side delay to simulate slow FCP
async function delayServer() {
  return new Promise((resolve) => {
    setTimeout(resolve, FCP_DELAY);
  });
}

export default async function FCPPage() {
  // Block server-side rendering to simulate slow FCP
  await delayServer();

  return (
    <DemoLayout>
      <DemoHeader
        vitalName="FCP"
        vitalDesc="First Contentful Paint"
        vitalColor="oklch(0.75 0.13 162)"
        isCore={true}
      >
        Measures the time from when a page starts loading to when{" "}
        <span className="italic">any</span> part of the page's content is first
        displayed.
      </DemoHeader>

      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        <Card>
          <CardContent className="pt-6">
            <Heading level={2} size="xl" className="mb-4">
              How FCP is Calculated
            </Heading>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.75 0.13 162)" }}
                >
                  1
                </span>
                <div>
                  <strong className="text-foreground">Navigation Start</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    Browser begins loading when user navigates to the page
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.75 0.13 162)" }}
                >
                  2
                </span>
                <div>
                  <strong className="text-foreground">Resource Loading</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    HTML, CSS, JavaScript, and other resources are fetched
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: "oklch(0.75 0.13 162)" }}
                >
                  3
                </span>
                <div>
                  <strong className="text-foreground">First Paint</strong>
                  <p className="text-muted-foreground text-sm mt-1">
                    The moment any content (text, image, canvas) is rendered
                  </p>
                </div>
              </li>
            </ol>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Optimization Tips:</strong> Use font-display: swap, optimize images, 
                and minimize render-blocking resources to improve FCP.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Heading level={2} size="xl" className="mb-4">
              What you just experienced
            </Heading>
            <p className="text-muted-foreground mb-6">
              This page was intentionally delayed by {FCP_DELAY / 1000} seconds to simulate a slow First Contentful Paint. 
              Notice how the blank screen made you wait before any content appeared.
            </p>

            <LoadingSimulation
              duration={FCP_DELAY}
              vitalColor="oklch(0.75 0.13 162)"
              vitalName="FCP"
            >
              <div className="border border-border rounded-lg p-4 mb-4 min-h-[150px] flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: "oklch(0.75 0.13 162)" }}
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-foreground">
                    First Content Rendered
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This represents the first visible content
                  </p>
                </div>
              </div>
            </LoadingSimulation>

            <div 
              className="p-4 rounded-lg mb-4"
              style={{ 
                backgroundColor: "color-mix(in srgb, oklch(0.75 0.13 162) 10%, transparent)",
                borderLeft: "4px solid oklch(0.75 0.13 162)"
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "oklch(0.75 0.13 162)" }}
                />
                <strong className="text-foreground">Real-world impact</strong>
              </div>
              <p className="text-sm text-muted-foreground">
                Users perceive pages with slow FCP as broken or unresponsive. 
                Every 100ms delay can reduce conversion rates by up to 1%.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-good" />
                <div>
                  <span className="font-semibold">Good</span>
                  <span className="text-muted-foreground ml-2">≤ 1.8s</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-needs-improvement" />
                <div>
                  <span className="font-semibold">Needs Improvement</span>
                  <span className="text-muted-foreground ml-2">1.8s - 3.0s</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-score-poor" />
                <div>
                  <span className="font-semibold">Poor</span>
                  <span className="text-muted-foreground ml-2">&gt; 3.0s</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DemoLayout>
  );
}