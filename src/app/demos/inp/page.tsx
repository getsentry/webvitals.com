import DemoHeader from '../../components/DemoHeader';
import INPButtons from './inpButtons';

export const dynamic = 'force-dynamic';
const revalidate = 0;

const FCP_DELAY = 2000; // ms

export default async function Page() {
    return (
        <div>
            <DemoHeader vitalName="INP" vitalDesc="Interaction to Next Paint" vitalColor="text-yellow-600" supportedBrowsers={{ safari: false, firefox: false }}>
                Interaction to Next Paint (INP) measures the time from when a user interacts with a page to when the browser renders the visual response to that interaction.
            </DemoHeader>


            <INPButtons />
        </div >
    );
}
