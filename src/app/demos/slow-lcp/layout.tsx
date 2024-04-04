
export default function DashboardLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <h2 className="mt-0">Slow LCP</h2>
            <p>This demo illustrates a slow LCP.</p>

            {children}

        </div>
    )
}