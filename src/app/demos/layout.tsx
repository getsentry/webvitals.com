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

            <h3>More demos</h3>
            <ul>
                <li><a href="/demos/slow-lcp">Slow LCP (Largest Contentful Paint)</a></li>
                <li><a href="/demos/slow-fcp">Slow FCP (First Contentful Paint)</a></li>
                <li><a href="/">Home</a></li>
            </ul>
        </div>
    )
}