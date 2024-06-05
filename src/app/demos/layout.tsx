import VitalsReport from './vitalsReport';
import Nav from '../nav';
import Link from 'next/link';

export default function DemoLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div>

            <nav className="mb-8 text-gray-500">
                <Link href="/">← Home</Link>
            </nav>
            {children}

            <VitalsReport />

            {/*
            <h3>More demos</h3>
            <Nav />
    */}
        </div>
    )
}