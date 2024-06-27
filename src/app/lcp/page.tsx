"use client";

import { useEffect, useState } from "react";
import { useLoadState } from "@/app/loadState";

import { Progress } from "@/components/ui/progress"


import { triggerVisibilityChange } from "@/lib/utils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LCP_DELAY = 3000; // ms

export default function Page() {
    const { setLoading } = useLoadState();
    const [visible, setVisible] = useState(false);

    const [progress, setProgress] = useState(0);

    const startTime = new Date().getTime();

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 0);

        setTimeout(() => {
            setVisible(true);
            setTimeout(() => {
                triggerVisibilityChange(document, true);
            }, 100);
        }, LCP_DELAY);

    }, [setLoading]);

    useEffect(() => {
        if (progress >= 100) {
            return;
        }

        const progressInterval = 125;

        console.log(progress);
        const intervalId = setInterval(() => {
            let newProgress = progress + (new Date().getTime() - startTime) / LCP_DELAY * 100;
            setProgress(newProgress);
        }, progressInterval);

        return () => clearInterval(intervalId);

    }, [setProgress, progress, startTime]);

    return <div className="p-8 rounded bg-blue-200 mb-8 prose">
        {!visible ?
            <Progress color="bg-blue-300" value={progress} /> :
            <div>
                <h3 className="text-lg font-semibold mb-4">How is LCP Calculated?</h3>

                {/* intentionally add content to make this large */}

                <ul className="list-decimal ml-4">
                    <li className="mb-4"><strong>Navigation Start</strong>: Similar to other performance metrics, LCP measurement starts when the user initiates navigation to the webpage, marked by the browser&apos;s navigationStart event.</li>

                    <li className="mb-4"><strong>Resource Loading and DOM Parsing</strong>: The browser begins loading resources (HTML, CSS, JavaScript, images) and parsing the HTML to build the DOM (Document Object Model).</li>

                    <li className="mb-4"><strong>Identifying LCP Candidates</strong>: The browser identifies elements that could be considered for LCP. These elements typically include:

                        <ol className="list-decimal ml-8 mt-4">
                            <li><code>&lt;img&gt;</code> elements</li>
                            <li><code>&lt;image&gt;</code> elements inside an &lt;svg&gt; element</li>
                            <li><code>&lt;video&gt;</code> elements (the poster image)</li>
                            <li>Block-level elements containing text nodes or other inline-level text elements</li>
                            <li>The browser continuously monitors these elements as the page loads.</li>
                        </ol>
                    </li>
                    <li className="mb-4"><strong>Rendering Elements</strong>: As the page loads and elements are rendered, the browser tracks the largest visible content element in the viewport. The size of the element is determined by its area in pixels.</li>


                    <li className="mb-4"><strong>Final LCP Value</strong>: The final LCP value is the time (in seconds) from the navigationStart event to the time when the largest content element is rendered.
                        This value can be captured using the PerformanceObserver API.
                    </li>
                </ul>
            </div>
        }
    </div>;
}
