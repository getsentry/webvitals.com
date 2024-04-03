export default function DashboardLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <main>
            <h2>Slow LCP</h2>
            <p>This demo illustrates a slow LCP.</p>

            {children}
        </main>
    )
}