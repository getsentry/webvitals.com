"use client";
import React from "react";
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RowsPropTypes {
    onload: Function,
}

const Rows: React.FC<RowsPropTypes> = ({ onload }) => {
    // delay first render

    const [count, setCount] = useState(0);

    useEffect(() => {
        const callback = () => {
            setCount(count + 1);
        }

        if (count < 5) {
            setTimeout(callback, 500);
        } else {
            onload();
        }
    }, [count, onload]);

    return (
        <div>
            {/* output a row up to count*/}
            {Array.from({ length: count }, (v, k) => k).map((i) => (
                <div key={i} className={`p-8 mb-4 rounded bg-green-100 h-96`}>This block is shifting content ...</div>
            ))}
        </div>
    );
}


export default Rows;