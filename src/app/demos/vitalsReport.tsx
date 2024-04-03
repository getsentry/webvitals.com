"use client";
import { useState, useEffect } from "react";
import type { Metric } from 'web-vitals';
import {
    onLCP,
    onFID,
    onCLS,
    onINP,
    onFCP,
    onTTFB,
} from 'web-vitals'

function VitalsReport() {

    const [vitals, setVitals] = useState({
        FCP: 'n/a',
        TTFB: 'n/a',
        LCP: 'n/a',
    });


    useEffect(() => {
        const onMetric = (metric: Metric) => {
            console.log(metric.name);
            setVitals((vitals) => ({
                ...vitals,
                [metric.name]: String(metric.value)
            }));
        }
        onFCP(onMetric);
        onLCP(onMetric);
        onTTFB(onMetric);

    }, []);


    return (
        <div>
            <ul>
                <li>FCP: {vitals.FCP}</li>
                <li>LCP: {vitals.LCP}</li>
                <li>TTFB: {vitals.TTFB}</li>
            </ul>
        </div>
    );
};

export default VitalsReport;