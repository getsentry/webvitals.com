"use client";
import { useEffect } from 'react';
import { useLoadState } from '@/app/loadState';

// this component exists solely to trigger "loading = false"
export default function InnerPage() {

    const { setLoading } = useLoadState();

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 0);
    }, [setLoading]);

    return "<div></div>";

}