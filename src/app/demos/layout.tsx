import VitalsReport from './vitalsReport';

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