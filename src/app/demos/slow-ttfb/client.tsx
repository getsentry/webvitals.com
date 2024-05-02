"use client";
import { useEffect } from 'react';
import { useLoadState } from '@/app/loadState';
import { triggerVisibilityChange } from '@/lib/utils';

// this component exists solely to trigger "loading = false"
export default function InnerPage() {

    const { setLoading } = useLoadState();

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
            triggerVisibilityChange(document, true);
        }, 0);
    }, [setLoading]);

    return null;

}