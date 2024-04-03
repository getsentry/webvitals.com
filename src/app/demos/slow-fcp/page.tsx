const FCP_DELAY = 2000; // ms

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
    // delay first render
    const data = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(null);
        }, FCP_DELAY);
    });

    return (
        <div>
            <p>This demo demonstrates a slow FCP (First Contentful Paint).</p>

            <p>Nothing is painted until after a delay.</p>
        </div>
    );
}
