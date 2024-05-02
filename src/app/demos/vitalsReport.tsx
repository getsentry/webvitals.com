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

import Vital from "@/app/components/vital";
import { useLoadState } from "@/app/loadState";

function VitalsReport() {

    const { loading } = useLoadState();

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


    return loading ? null : (
        <div className="border-black border mt-4 rounded">
            <ul className="list-none grid grid-cols-2">
                <li><Vital name="First Contentful Paint" score={vitals.FCP} thresholds={{
                    good: 1000,
                    needsImprovement: 2500
                }} /></li>
                <li><Vital name="Largest Contentful Paint" score={vitals.LCP} thresholds={{
                    good: 2500,
                    needsImprovement: 4000
                }} /></li>
                <li><Vital name="Time to First Byte" score={vitals.TTFB} thresholds={{
                    good: 800,
                    needsImprovement: 1800
                }} /></li>
                <li><Vital name="Input Delay" score={vitals.INP} thresholds={{
                    good: 200,
                    needsImprovement: 500
                }} /></li>
                <li><Vital name="First Input Delay" score={vitals.FID} thresholds={{
                    good: 100,
                    needsImprovement: 300
                }} /></li>
                <li><Vital name="Cumulative Layout Shift" score={vitals.CLS} thresholds={{
                    good: 0.1,
                    needsImprovement: 0.25,
                }} formatter={(score: string) => Number(score).toFixed(2)} /></li>
            </ul>
        </div>
    );
};

export default VitalsReport;