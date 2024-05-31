const FCP_DELAY = 2000; // ms

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Header } from "../header";
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
            <Header>Slow TTFB</Header>

            <p className="mb-4">This demo demonstrates a slow TTFB (Time to First Byte).</p>

            <p className="mb-4">Nothing is transmitted over the network until after a delay.</p>

            <div className="bg-green-300 rounded p-8">
                <h3 className="text-lg font-semibold mb-4">How TTFB is Calculated</h3>

                <ul className="list-disc ml-8">
                    <li className="mb-4"><strong>Client sends a request</strong>: The client (e.g., a web browser) sends a request to the server for a specific resource, such as a webpage or an API endpoint.</li>
                    <li className="mb-4"><strong>Server processes the request</strong>: The server receives the request and starts processing it. This may involve executing server-side code, accessing databases, or performing other operations to generate the response.</li>
                    <li className="mb-4"><strong>Server prepares the response</strong>: Once the server has processed the request, it prepares the response by generating the necessary data and headers.</li>
                    <li className="mb-4"><strong>Server sends the response</strong>: Finally, the server sends the response back to the client over the network. The first byte of the response is the initial piece of data that the client receives.</li>
                    <li className="mb-4"><strong>Client measures TTFB</strong>: The client measures the time it takes to receive the first byte of the response. This duration is the TTFB.</li>
                </ul>

                <p className="mb-4">It&apos;s important to note that TTFB includes not only the time spent on the server-side processing but also the time spent on network latency, data transmission, and any other factors that contribute to the delay in receiving the first byte.</p>

            </div>

            <InnerPage />
        </div>
    );
}