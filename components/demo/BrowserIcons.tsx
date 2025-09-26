import Image from "next/image";
import type React from "react";

interface BrowserIconsProps {
  width: number;
  height: number;
  supportedBrowsers?: Record<string, boolean>;
}

const BrowserIcons: React.FC<BrowserIconsProps> = ({
  width,
  height,
  supportedBrowsers,
}) => {
  const browsers = {
    chrome: true,
    firefox: true,
    safari: true,
    ...(supportedBrowsers || {}),
  };

  return (
    <div className="flex gap-2">
      <Image
        src="/browsericons/chrome_128x128.png"
        alt="Chrome"
        width={width}
        height={height}
        className={`inline-block ${!browsers.chrome ? "filter grayscale opacity-50" : ""}`}
      />
      <Image
        src="/browsericons/firefox_128x128.png"
        alt="Firefox"
        width={width}
        height={height}
        className={`inline-block ${!browsers.firefox ? "filter grayscale opacity-50" : ""}`}
      />
      <Image
        src="/browsericons/safari_128x128.png"
        alt="Safari"
        width={width}
        height={height}
        className={`inline-block ${!browsers.safari ? "filter grayscale opacity-50" : ""}`}
      />
    </div>
  );
};

export default BrowserIcons;
