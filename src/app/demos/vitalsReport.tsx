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
        <div>
            <ul className="list-none">
                <li><Vital name="FCP" score={vitals.FCP} thresholds={{
                    good: 1000,
                    needsImprovement: 2500
                }} /></li>
                <li><Vital name="LCP" score={vitals.LCP} thresholds={{
                    good: 2500,
                    needsImprovement: 4000
                }} /></li>
                <li><Vital name="TTFB" score={vitals.TTFB} thresholds={{
                    good: 100,
                    needsImprovement: 300
                }} /></li>
                <li><Vital name="INP" score={vitals.INP} thresholds={{
                    good: 50,
                    needsImprovement: 250
                }} /></li>
                <li><Vital name="FID" score={vitals.FID} thresholds={{
                    good: 100,
                    needsImprovement: 300
                }} /></li>
                <li><Vital name="CLS" score={vitals.CLS} thresholds={{
                    good: 0.1,
                    needsImprovement: 0.25
                }} /></li>
            </ul>
        </div>
    );
};

export default VitalsReport;