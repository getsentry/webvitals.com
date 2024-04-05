"use client";

import Rows from './rows';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useLoadState } from '@/app/loadState';
import { useEffect } from 'react';

export default function Page() {
    const { setLoading } = useLoadState();

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 0);
    }, [setLoading]);

    return (
        <div>
            <h2 className="mt-0">Bad CLS</h2>
            <p>This demo demonstrates a bad CLS (Cumulative Layout Shift) score.</p>

            <Rows />
        </div>
    );
}
