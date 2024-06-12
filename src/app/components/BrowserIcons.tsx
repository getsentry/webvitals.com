import React from 'react';
import Image from 'next/image';

const BrowserIcons: React.FC<{ width: number, height: number, supportedBrowsers?: Record<string, boolean> }> = ({ width, height, supportedBrowsers }) => {
    supportedBrowsers = {
        chrome: true, firefox: true, safari: true,
        ...(supportedBrowsers || {}),
    };

    return (
        <div className="grid grid-cols-3 gap-x-2">
            <Image src="/browsericons/chrome_128x128.png" alt="Chrome" width={width} height={height} className={`inline-block ${!supportedBrowsers.chrome ? 'filter grayscale opacity-50' : ''}`} />
            <Image src="/browsericons/firefox_128x128.png" alt="Firefox" width={width} height={height} className={`inline-block ${!supportedBrowsers.firefox ? 'filter grayscale opacity-50' : ''}`} />
            <Image src="/browsericons/safari_128x128.png" alt="Safari" width={width} height={height} className={`inline-block ${!supportedBrowsers.safari ? 'filter grayscale opacity-50' : ''}`} />
            {/* Add more browser icons here */}
        </div>
    );
};

export default BrowserIcons;