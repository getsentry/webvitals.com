"use client";
import { useState, useEffect } from "react";

export default function INPButtons() {
    const [hidden, setHidden] = useState(true);

    const clickButton = (speed: string) => {

        const delay = speed === 'fast' ? 100 : speed === 'ok' ? 500 : 1000;
        const start = Date.now();
        do {

        } while (Date.now() - start < delay);
        setHidden(false);
    };

    return (

        <ul className="list-none p-0">
            <li className="bg-green-200" onClick={() => clickButton('fast')}>Click me (fast)</li>
            <li className="bg-green-300" onClick={() => clickButton('ok')}>Click me (ok)</li>
            <li className="bg-green-500" onClick={() => clickButton('slow')}>Click me (slow)</li>

            <li className={hidden ? "hidden" : ""}>I am now revealed!</li>
        </ul>
    )
}