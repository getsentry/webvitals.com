"use client";

import React from "react";
import Footer from "@/components/Footer";
import VitalsReport from "./VitalsReport";

export default function DemoLayout({
  children,
  currentMetric,
}: {
  children: React.ReactNode;
  currentMetric?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
        
        <VitalsReport currentMetric={currentMetric} />
      </main>
      
      <Footer />
    </div>
  );
}