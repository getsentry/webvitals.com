
export default function DashboardLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <h2 className="text-2xl font-semibold leading-none tracking-tight mb-4">Slow LCP</h2>

            <p className="mb-4">This demo illustrates a slow LCP.</p>

            {children}

        </div>
    )
}