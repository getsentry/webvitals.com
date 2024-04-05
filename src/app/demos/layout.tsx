import VitalsReport from './vitalsReport';
import Nav from '../nav';

export default function DemoLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            {children}

            <VitalsReport />

            {/*
            <h3>More demos</h3>
            <Nav />
    */}
        </div>
    )
}