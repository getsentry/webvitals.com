"use client";

const FCP_DELAY = 2000; // ms

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { triggerVisibilityChange } from "@/lib/utils";
import { useLoadState } from "@/app/loadState";
import { useEffect } from 'react';
import DemoHeader from "../components/DemoHeader";
import DemoLayout from "../components/DemoLayout";

export default function Page() {
    // delay first render
    const { setLoading, loading } = useLoadState();

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);

            // need to wait 100ms or vitals calculations won't be ready (?)
            setTimeout(() => {
                triggerVisibilityChange(document, true);
            }, 100);
        }, FCP_DELAY);
    }, [setLoading]);

    return loading ? null : (
        <DemoLayout>
            <div>
                <DemoHeader vitalName="FCP" vitalDesc="First Contentful Paint" vitalColor="text-amber-600">
                    Measures the time from when a page starts loading to when <span className="italic">any</span> part of the page&apos;s content is first displayed.
                </DemoHeader>

                <div className="mb-8 p-8 rounded bg-blue-200">
                    <h3 className="mb-4 text-lg font-semibold">How is FCP Calculated?</h3>
                    <p className="mb-4">First Contentful Paint (FCP) is calculated by tracking the time it takes for a browser to render the first piece of content from the DOM after a user navigates to a webpage.</p>

                    <ol className="list-decimal ml-8">
                        <li className="mb-4"><strong>Navigation Start</strong>: The measurement begins when the user initiates navigation to the webpage, typically marked by the browser&apos;s navigationStart event.</li>

                        <li className="mb-4"><strong>Resource Loading</strong>: The browser starts loading resources, such as HTML, CSS, JavaScript, images, etc. It parses the HTML and builds the DOM.</li>

                        <li className="mb-4"><strong>Content Rendering</strong>: As the browser parses the HTML and applies CSS, it starts rendering elements to the screen. The first time it paints any text, image, or non-white canvas to the screen, the event is recorded as FCP.</li>
                    </ol>
                </div>
            </div >
        </DemoLayout>
    );
}
