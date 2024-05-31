import { Header } from "../header"

export default function DashboardLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <Header>Slow LCP</Header>

            <p className="mb-4">This demo illustrates a slow LCP.</p>

            {children}

        </div>
    )
}