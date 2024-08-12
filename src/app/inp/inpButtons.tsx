"use client";
import React from "react";
import { useState, useEffect } from "react";

import { ChevronDown } from "lucide-react";


function INPListItem({ speed, children }: { speed: string, children: React.ReactNode }) {
    const [isHidden, setHidden] = useState(true);

    const clickButton = (speed: string) => {

        const delay = speed === 'fast' ? 100 : speed === 'ok' ? 500 : 1000;
        const start = Date.now();
        do {
            // eslint-disable-line no-empty
        } while (Date.now() - start < delay);
        setHidden(false);

        setTimeout(() => {
            triggerVisibilityChange(document, true);
        }, 100);
    };

    return (
        <li className="border-b border-blue-900" data-orientation="vertical" onClick={() => clickButton(speed)}>
            <div className="flex">
                <button className="flex flex-1 items-center justify-between py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180">
                    <div className="text-left">
                        <div className="hover:underline">
                            {children}
                        </div>

                        <p className={`${isHidden ? "hidden" : ""} mt-2 text-sm`}>
                            The elapsed time between your click and this content appearing is the INP.
                        </p>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </button>
            </div>
        </li>
    );
}

import { useLoadState } from "@/app/loadState";

import { triggerVisibilityChange } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
export default function INPButtons() {

    const { setLoading } = useLoadState();
    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 0);
    }, [setLoading]);

    return (

        <Card className="bg-blue-200">
            <CardContent>
                <ul className="list-none p-0">
                    <INPListItem speed="fast">
                        Click to expand (fast)
                    </INPListItem>
                    <INPListItem speed="ok">
                        Click to expand (slow)
                    </INPListItem>
                    <INPListItem speed="slow">
                        Click to expand (slowest)
                    </INPListItem>
                </ul >
            </CardContent>
        </Card >



    )
}