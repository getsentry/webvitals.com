const FCP_DELAY = 2000; // ms

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import InnerPage from "./client";

export default async function Page() {
    // delay first render
    const data = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(null);
        }, FCP_DELAY);
    });

    return (
        <div>
            <h2 className="mt-0">Slow TTFB</h2>
            <p>This demo demonstrates a slow TTFB (Time to First Byte).</p>

            <p>Nothing is transmitted over the network until after a delay.</p>

            <InnerPage />
        </div>
    );
}