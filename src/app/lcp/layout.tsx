
import DemoHeader from "@/app/components/DemoHeader";
import DemoLayout from "../components/DemoLayout";

export default function DashboardLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <DemoLayout>
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
        </DemoLayout>
    )
}