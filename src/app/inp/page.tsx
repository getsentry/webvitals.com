import DemoHeader from '../components/DemoHeader';
import DemoLayout from '../components/DemoLayout';

import INPButtons from './inpButtons';

export const dynamic = 'force-dynamic';
const revalidate = 0;

export default async function Page() {
    return (
        <DemoLayout>
            <div>
                <DemoHeader
                    vitalName="INP"
                    vitalDesc="Interaction to Next Paint"
                    vitalColor="text-yellow-600"
                    supportedBrowsers={{ safari: false, firefox: false }}
                    isCore={true}
                >
                    Measures the time from when a user interacts with a page to when the browser renders the visual response to that interaction.
                </DemoHeader>


                <INPButtons />

                <p className="mt-8 mb-8">NOTE: Your browser may freeze temporarily.</p>
            </div >
        </DemoLayout>
    );
}

