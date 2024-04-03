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
        INP: 'n/a',
        FID: 'n/a',
        CLS: 'n/a',
    });


    useEffect(() => {
        const onMetric = (metric: Metric) => {
            setVitals((vitals) => ({
                ...vitals,
                [metric.name]: String(metric.value)
            }));
        }
        onFCP(onMetric);
        onLCP(onMetric);
        onTTFB(onMetric);
        onFID(onMetric);
        onCLS(onMetric);
        onINP(onMetric);

    }, []);


    return (
        <div>
            <ul>
                <li>FCP: {vitals.FCP}</li>
                <li>LCP: {vitals.LCP}</li>
                <li>TTFB: {vitals.TTFB}</li>
                <li>INP: {vitals.INP} (won't calculate until you change tabs)</li>
                <li>FID: {vitals.FID}</li>
                <li>CLS: {vitals.CLS}</li>
            </ul>
        </div>
    );
};

export default VitalsReport;