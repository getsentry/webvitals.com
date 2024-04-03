"use client";
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Rows() {
    // delay first render

    const [count, setCount] = useState(0);

    useEffect(() => {
        const callback = () => {
            console.log(count);
            setCount(count + 1);
        }

        if (count < 5) {
            setTimeout(callback, 500);
        }
    }, [count]);

    return (
        <div>
            {/* output a row up to count*/}
            {Array.from({ length: count }, (v, k) => k).map((i) => (
                <div key={i} className={`bg-green-100 h-96`}>This block is shifting content ...</div>
            ))}
        </div>
    );
}
