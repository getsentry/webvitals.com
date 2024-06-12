"use client";

import Rows from './rows';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useLoadState } from '@/app/loadState';
import { triggerVisibilityChange } from '@/lib/utils';
import { useEffect } from 'react';
import DemoHeader from '../../components/DemoHeader';

export default function Page() {
    const { setLoading } = useLoadState();

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 0);
    }, [setLoading]);

    return (
        <div>
            <DemoHeader
                vitalName="CLS"
                vitalDesc="Cumulative Layout Shift"
                vitalColor="text-purple-600"
                supportedBrowsers={{ safari: false, firefox: false }}
                isCore={true}
            >
                Measures the total amount of unexpected layout shifts that occur during the entire lifespan of a webpage.
            </DemoHeader>

            <Rows onload={() => triggerVisibilityChange(document, true)} />
        </div>
    );
}
