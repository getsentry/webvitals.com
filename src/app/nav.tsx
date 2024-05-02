"use client";

import { useLoadState } from './loadState';

export default function Nav() {

    const { loading } = useLoadState();

    return loading ? null : (

        <ul>
            <li className="mb-4"><a href="/">Home</a></li>
            <li><a href="/demos/slow-lcp">Largest Contentful Paint (LCP)</a></li>
            <li><a href="/demos/slow-fcp">First Contentful Paint (FCP)</a></li>
            <li><a href="/demos/slow-ttfb">Time to First Byte (TTFB)</a></li>
            <li><a href="/demos/slow-inp">Interaction to Next Paint (INP)</a></li>
            <li><a href="/demos/bad-cls">Cumulative Layout Shift (CLS)</a></li>
        </ul >
    );
}