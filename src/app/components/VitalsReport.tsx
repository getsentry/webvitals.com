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

import Vital from "./Vital";
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
        <div className="border-black border mt-4 rounded p-4">
            <ul className="list-none grid grid-cols-2">
                <li><Vital name="First Contentful Paint" href="/fcp" score={vitals.FCP} thresholds={{
                    good: 1000,
                    needsImprovement: 2500
                }} /></li>
                <li><Vital name="Largest Contentful Paint" href="/lcp" score={vitals.LCP} thresholds={{
                    good: 2500,
                    needsImprovement: 4000
                }} /></li>
                <li><Vital name="Time to First Byte" href="/ttfb" score={vitals.TTFB} thresholds={{
                    good: 800,
                    needsImprovement: 1800
                }} /></li>
                <li><Vital name="Cumulative Layout Shift" href="/cls" score={vitals.CLS} thresholds={{
                    good: 0.1,
                    needsImprovement: 0.25,
                }} formatter={(score: string) => !isNaN(Number(score)) ? Number(score).toFixed(2) : score} /></li>
            </ul>
            <ul className="list-none grid grid-cols-2 border-t mt-4 pt-4">
                <li><Vital name="Interaction to Next Paint" href="/inp" score={vitals.INP} thresholds={{
                    good: 200,
                    needsImprovement: 500
                }} /></li>
                <li><Vital name="First Input Delay" href="/inp" score={vitals.FID} thresholds={{
                    good: 100,
                    needsImprovement: 300
                }} /></li>
            </ul>
            <p className="p-4 pl-12">NOTE: Interaction web vitals (INP and FID) won&apos;t show until you change tabs.</p>
        </div>
    );
};

export default VitalsReport;