import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import BrowserIcons from "@/app/components/BrowserIcons"

import DemoHeader from "@/app/components/DemoHeader"; // Import the DemoHeader component

export default function DashboardLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <DemoHeader
                vitalName="LCP"
                vitalDesc="Largest Contentful Paint"
                vitalColor="text-teal-500"
                supportedBrowsers={{ safari: false }}
                isCore={true}
            >
                Measures the time it takes for the largest text or image element to render on a webpage.
            </DemoHeader>


            {children}

        </div >
    )
}