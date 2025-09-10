"use client";

import type { ToolUIPart } from "ai";
import { motion } from "motion/react";
import { Message, MessageContent } from "@/components/ui/ai-elements/message";
import { Response } from "@/components/ui/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ui/ai-elements/tool";
import LighthouseScoreRing from "@/components/ui/lighthouse-score-ring";
import RealUserMetrics from "@/components/ui/real-user-metrics";
import type {
  CloudflareScannerToolOutput,
  ScanSearchResponse,
} from "@/types/cloudflare-scanner";
import type {
  PageSpeedToolInput,
  PageSpeedToolOutput,
} from "@/types/pagespeed";

type AllToolsUIPart = ToolUIPart<{
  analyzePageSpeed: {
    input: PageSpeedToolInput;
    output: PageSpeedToolOutput;
  };
  scanUrlSecurity: {
    input: {
      url: string;
      visibility?: "Public" | "Unlisted";
      screenshotResolutions?: Array<"desktop" | "mobile" | "tablet">;
      customHeaders?: Record<string, string>;
      waitForResults?: boolean;
    };
    output: CloudflareScannerToolOutput;
  };
  searchSecurityScans: {
    input: {
      query: string;
      limit?: number;
      offset?: number;
    };
    output: ScanSearchResponse;
  };
}>;

interface MessageRendererProps {
  message: {
    id: string;
    role: "system" | "user" | "assistant";
    parts?: Array<{
      type: string;
      text?: string;
    }>;
  };
}

export default function MessageRenderer({ message }: MessageRendererProps) {
  console.log("message", message);
  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      }}
      className="space-y-4"
    >
      {message.parts?.map((part, i) => {
        if (part.type === "text") {
          return (
            <Message key={`${message.id}-${i}`} from={message.role}>
              <MessageContent>
                {message.role === "user" ? (
                  <div className="whitespace-pre-wrap">{part.text}</div>
                ) : (
                  <Response>{part.text}</Response>
                )}
              </MessageContent>
            </Message>
          );
        }

        if (part.type === "tool-analyzePageSpeed") {
          const pageSpeedTool = part as AllToolsUIPart;

          const renderPageSpeedOutput = () => {
            if (!pageSpeedTool.output) return null;

            const output = pageSpeedTool.output as PageSpeedToolOutput;
            const hasVisualization = output.visualizations?.lighthouseScoreRing;
            const hasRealUserData =
              output.visualizations?.realUserMetrics?.fieldData ||
              output.visualizations?.realUserMetrics?.originData;

            if (hasVisualization || hasRealUserData) {
              return (
                <div className="space-y-6 p-4">
                  {hasVisualization &&
                    output.visualizations.lighthouseScoreRing && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Lighthouse Performance Score
                        </h3>
                        <div className="flex justify-center">
                          <LighthouseScoreRing
                            overallScore={
                              output.visualizations.lighthouseScoreRing
                                .overallScore
                            }
                            metrics={
                              output.visualizations.lighthouseScoreRing.metrics
                            }
                          />
                        </div>
                      </div>
                    )}

                  {hasRealUserData && (
                    <RealUserMetrics
                      fieldData={
                        output.visualizations.realUserMetrics.fieldData ||
                        undefined
                      }
                      originData={
                        output.visualizations.realUserMetrics.originData ||
                        undefined
                      }
                    />
                  )}

                  {/* Performance Opportunities */}
                  {output.insights.opportunities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Opportunities
                      </h3>
                      <div className="space-y-3">
                        {output.insights.opportunities
                          .slice(0, 5)
                          .map((opportunity, index) => (
                            <div
                              key={opportunity.id || `opportunity-${index}`}
                              className="p-4 border rounded-lg bg-card"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-foreground text-sm">
                                  {opportunity.title}
                                </h4>
                                {opportunity.displayValue && (
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {opportunity.displayValue}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {opportunity.description}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis Summary */}
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      Analysis Summary
                    </summary>
                    <div className="mt-2 p-4 bg-muted/50 rounded text-xs space-y-2">
                      <div>
                        <strong>URL:</strong> {output.url}
                      </div>
                      <div>
                        <strong>Strategy:</strong> {output.strategy}
                      </div>
                      <div>
                        <strong>Performance Score:</strong>{" "}
                        {output.insights.performanceScore}/100
                      </div>
                      <div>
                        <strong>Field Data:</strong>{" "}
                        {output.insights.coreWebVitals.fieldData
                          ? `Available (${output.insights.coreWebVitals.fieldData.overallCategory})`
                          : "Not Available"}
                      </div>
                      <div>
                        <strong>Origin Data:</strong>{" "}
                        {output.insights.coreWebVitals.originData
                          ? `Available (${output.insights.coreWebVitals.originData.overallCategory})`
                          : "Not Available"}
                      </div>
                      <div>
                        <strong>Opportunities:</strong>{" "}
                        {output.insights.opportunities.length} found
                      </div>
                      <div>
                        <strong>Diagnostics:</strong>{" "}
                        {output.insights.diagnostics.length} found
                      </div>
                      <div>
                        <strong>Timestamp:</strong>{" "}
                        {new Date(output.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </details>
                </div>
              );
            }

            // Fallback to JSON if no visualization data
            return (
              <pre className="text-xs overflow-auto p-4 font-mono">
                {JSON.stringify(output, null, 2)}
              </pre>
            );
          };

          return (
            <Tool
              key={`${message.id}-${i}`}
              defaultOpen={pageSpeedTool.state === "output-available"}
            >
              <ToolHeader
                type="tool-analyzePageSpeed"
                state={pageSpeedTool.state}
              />
              <ToolContent>
                <ToolInput input={pageSpeedTool.input} />
                <ToolOutput
                  output={renderPageSpeedOutput()}
                  errorText={pageSpeedTool.errorText}
                />
              </ToolContent>
            </Tool>
          );
        }

        if (part.type === "tool-scanUrlSecurity") {
          const securityTool = part as ToolUIPart<{
            scanUrlSecurity: {
              input: {
                url: string;
                visibility?: "Public" | "Unlisted";
                screenshotResolutions?: Array<"desktop" | "mobile" | "tablet">;
                customHeaders?: Record<string, string>;
                waitForResults?: boolean;
              };
              output: CloudflareScannerToolOutput;
            };
          }>;
          return (
            <Tool
              key={`${message.id}-${i}`}
              defaultOpen={securityTool.state === "output-available"}
            >
              <ToolHeader
                type="tool-scanUrlSecurity"
                state={securityTool.state}
              />
              <ToolContent>
                <ToolInput input={securityTool.input} />
                <ToolOutput
                  output={
                    securityTool.output ? (
                      <pre className="text-xs overflow-auto p-4 font-mono">
                        {JSON.stringify(securityTool.output, null, 2)}
                      </pre>
                    ) : null
                  }
                  errorText={securityTool.errorText}
                />
              </ToolContent>
            </Tool>
          );
        }

        if (part.type === "tool-searchSecurityScans") {
          const searchTool = part as ToolUIPart<{
            searchSecurityScans: {
              input: {
                query: string;
                limit?: number;
                offset?: number;
              };
              output: ScanSearchResponse;
            };
          }>;
          return (
            <Tool
              key={`${message.id}-${i}`}
              defaultOpen={searchTool.state === "output-available"}
            >
              <ToolHeader
                type="tool-searchSecurityScans"
                state={searchTool.state}
              />
              <ToolContent>
                <ToolInput input={searchTool.input} />
                <ToolOutput
                  output={
                    searchTool.output ? (
                      <pre className="text-xs overflow-auto p-4 font-mono">
                        {JSON.stringify(searchTool.output, null, 2)}
                      </pre>
                    ) : null
                  }
                  errorText={searchTool.errorText}
                />
              </ToolContent>
            </Tool>
          );
        }

        return null;
      })}
    </motion.div>
  );
}
