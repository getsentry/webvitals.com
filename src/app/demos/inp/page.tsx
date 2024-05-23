import INPButtons from './inpButtons';

export const dynamic = 'force-dynamic';
const revalidate = 0;

const FCP_DELAY = 2000; // ms

export default async function Page() {
    return (
        <div>
            <h2 className="text-2xl font-semibold leading-none tracking-tight mb-4">Slow INP</h2>

            <p className="mb-4">This demo demonstrates a slow INP (Interaction to Next Paint).</p>

            <INPButtons />
        </div>
    );
}
