"use client";

import { AlertCircleIcon, AlertTriangleIcon, InfoIcon } from "lucide-react";
import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AnalysisBreakdown } from "@/types/analysis-breakdown";

interface AnalysisBreakdownProps {
  data: AnalysisBreakdown;
  className?: string;
}

function getSeverityIcon(severity: "critical" | "warning" | "info") {
  switch (severity) {
    case "critical":
      return <AlertCircleIcon className="h-4 w-4 text-destructive" />;
    case "warning":
      return <AlertTriangleIcon className="h-4 w-4 text-warning" />;
    case "info":
      return <InfoIcon className="h-4 w-4 text-muted-foreground" />;
  }
}

function getSeverityColor(severity: "critical" | "warning" | "info") {
  switch (severity) {
    case "critical":
      return "border-l-destructive";
    case "warning":
      return "border-l-warning";
    case "info":
      return "border-l-muted-foreground";
  }
}

export default function AnalysisBreakdownDisplay({
  data,
  className,
}: AnalysisBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-2">
            <p className="text-foreground leading-relaxed">{data.overview}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {data.points.map((point, index) => (
              <AccordionItem
                key={index}
                value={`point-${index}`}
                className={`border-l-2 ${getSeverityColor(point.severity)} pl-4 border-r-0 border-t-0 border-b-0`}
              >
                <AccordionTrigger className="text-left hover:no-underline py-3">
                  <div className="flex items-center gap-3 w-full">
                    {getSeverityIcon(point.severity)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">
                        {point.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 overflow-hidden text-wrap">
                        {point.summary}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="ml-7">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {point.details}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {data.nextStep && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-medium text-foreground mb-2">Next Step</h4>
              <p className="text-sm text-muted-foreground">{data.nextStep}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
