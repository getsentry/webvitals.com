export const dynamic = "force-dynamic";

import VitalsReport from './VitalsReport';
import Nav from '../nav';
import Link from 'next/link';

export default function DemoLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            {children}

            <VitalsReport />
        </div>
    )
}