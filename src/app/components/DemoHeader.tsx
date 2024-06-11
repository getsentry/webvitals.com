
import Link from 'next/link';
import BrowserIcons from './BrowserIcons';

import React from 'react';


const DemoHeader: React.FC<{
    children: React.ReactNode,
    vitalName: string,
    vitalDesc: string,
    vitalColor: string,
    supportedBrowsers?: Record<string, boolean>
}> = ({ children, vitalName, vitalDesc, vitalColor, supportedBrowsers }) => {

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
                    <div className="text-xl font-normal">{vitalDesc}</div>

                    <div className="absolute bottom-4 right-0">
                        <BrowserIcons width={48} height={48} supportedBrowsers={supportedBrowsers} />
                    </div>
                </div>
                <p className="mb-4">{children}</p>

            </div >
        </div>
    );
};

export default DemoHeader;