import INPButtons from './inpButtons';
const FCP_DELAY = 2000; // ms

export default async function Page() {
    return (
        <div>
            <p>This demo demonstrates a slow INP (Interaction to First Paint).</p>

            <INPButtons />

            <hr />
        </div>
    );
}
