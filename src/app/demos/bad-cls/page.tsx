import Rows from './rows';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
    return (
        <div>
            <p>This demo demonstrates a bad CLS (Cumulative Layout Shift) score.</p>

            <Rows />
        </div>
    );
}
