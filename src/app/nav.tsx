"use client";

import { useLoadState } from './loadState';

export default function Nav() {

    const { loading } = useLoadState();

    return loading ? null : (

        <ul>
            <li className="mb-4"><a href="/">Home</a></li>
            <li><a href="/demos/slow-lcp">Slow LCP (Largest Contentful Paint)</a></li>
            <li><a href="/demos/slow-fcp">Slow FCP (First Contentful Paint)</a></li>
            <li><a href="/demos/slow-inp">Slow INP (Interaction to Next Paint)</a></li>
            <li><a href="/demos/bad-cls">Bad CLS (Cumulative Layout Shift)</a></li>
        </ul >
    );
}