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
        <div>
            <div className="w-128 h-128 p-8 bg-lime-500">
                <h3>LCP</h3>
                <p>This block is the largest contentful paint.</p>

                {/* add some content to make this large */}
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>
        </div>
    ) : "Loading...";
}
