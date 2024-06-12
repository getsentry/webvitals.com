
import Link from 'next/link';
import BrowserIcons from './BrowserIcons';

import React from 'react';
import { Badge } from '@/components/ui/badge';


const DemoHeader: React.FC<{
    children: React.ReactNode,
    vitalName: string,
    vitalDesc: string,
    vitalColor: string,
    supportedBrowsers?: Record<string, boolean>,
    isCore?: boolean
}> = ({ children, vitalName, vitalDesc, vitalColor, supportedBrowsers, isCore }) => {

    return (
        <div>
            <nav className="mb-8 text-gray-500">
                <Link href="/">← Home</Link>
            </nav>
            <div className="mb-8">

                <div className="border-b mb-8 pb-4 relative">

                    <div className={`text-5xl mb-2 ${vitalColor} font-semibold`}>
                        {vitalName}
                    </div>
                    <div>
                        <div className="text-xl font-normal inline-block">{vitalDesc}</div>
                    </div>

                    <div className="absolute top-0 right-0">
                        <BrowserIcons width={48} height={48} supportedBrowsers={supportedBrowsers} />
                        <div className="mt-2 text-right">
                            <div className="inline-block">
                                <Badge variant="secondary">{isCore ? "Core Web Vital" : "Other Vital"}</Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="mb-4">{children}</p>

            </div >
        </div>
    );
};

export default DemoHeader;