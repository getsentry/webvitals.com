"use client";

import Rows from './rows';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useLoadState } from '@/app/loadState';
import { triggerVisibilityChange } from '@/lib/utils';
import { useEffect } from 'react';
import { Header } from '../header';

export default function Page() {
    const { setLoading } = useLoadState();

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 0);
    }, [setLoading]);

    return (
        <div>
            <Header>Bad CLS</Header>
            <p className="mb-4">This demo demonstrates a bad CLS (Cumulative Layout Shift) score.</p>

            <Rows onload={() => triggerVisibilityChange(document, true)} />
        </div>
    );
}
