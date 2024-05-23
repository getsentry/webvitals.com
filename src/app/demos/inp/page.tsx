import INPButtons from './inpButtons';

export const dynamic = 'force-dynamic';
const revalidate = 0;

const FCP_DELAY = 2000; // ms

export default async function Page() {
    return (
        <div>
            <h2 className="mt-0">Slow INP</h2>
            <p>This demo demonstrates a slow INP (Interaction to Next Paint).</p>

            <INPButtons />

            <hr />
        </div>
    );
}
