"use client";

import { useEffect, useState } from "react";
import { useLoadState } from "@/app/loadState";

import { triggerVisibilityChange } from "@/lib/utils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LCP_DELAY = 3000; // ms

export default function Page() {
    const { setLoading } = useLoadState();
    const [visible, setVisible] = useState(false);

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

    return visible ? (
        <div className="w-128 h-128 p-8 bg-lime-500 mb-8">
            <h3 className="text-xl font-semibold mb-4">This block is the largest contentful paint</h3>

            {/* intentionally add content to make this large */}

            <p className="mb-4">The largest contentful paint (LCP) is determined by finding the element with the largest area that is visible within the viewport. It represents the point at which the main content of the web page becomes visible to the user. This can be an image, a video, or any other visible element on the page.</p>

            <p className="mb-4">To optimize the LCP, it is important to ensure that the largest element is loaded and rendered quickly. This can be achieved by optimizing the size and format of images, lazy loading non-critical content, and minimizing render-blocking resources.</p>

            <p className="mb-4">By improving the LCP, you can enhance the user experience and reduce bounce rates, as users are more likely to engage with a web page when the main content is visible quickly.</p>
        </div>
    ) : "Loading...";
}
