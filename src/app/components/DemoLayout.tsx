export const dynamic = "force-dynamic";

import React from 'react';
import VitalsReport from './VitalsReport';

export default function DemoLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            {children}

            <VitalsReport />
            <footer className="w-full text-center text-gray-500 mt-4">
                Web Vitals Playground brought to you by <a className="underline" href="https://sentry.io">Sentry</a>
            </footer>
        </div>
    )
}