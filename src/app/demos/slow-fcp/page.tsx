"use client";

const FCP_DELAY = 2000; // ms

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useLoadState } from "@/app/loadState";

export default function Page() {
    // delay first render
    const { setLoading, loading } = useLoadState();
    setTimeout(() => {
        setLoading(false);
    }, FCP_DELAY);

    return loading ? null : (
        <div>
            <h2 className="mt-0">Slow FCP</h2>
            <p>This demo demonstrates a slow FCP (First Contentful Paint).</p>

            <p>Nothing is painted until after a delay.</p>
        </div>
    );
}
