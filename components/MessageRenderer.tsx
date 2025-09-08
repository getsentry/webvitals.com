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
import {
  formatScanResult,
  formatSearchResults,
} from "@/lib/cloudflare-scanner-utils";
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

function CloudflareScanOutput({
  output,
}: {
  output: CloudflareScannerToolOutput;
}) {
  if (!output.result) {
    return (
      <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Scan Submitted</span>
        </div>
        <div className="text-sm space-y-1">
          <p>
            <strong>Scan ID:</strong> {output.scanId}
          </p>
          <p>
            <strong>Status:</strong> {output.status}
          </p>
          <p className="text-gray-600">
            {output.status === "queued" && "Scan is queued for processing..."}
            {output.status === "running" && "Scan is currently running..."}
          </p>
        </div>
      </div>
    );
  }

  const formatted = formatScanResult(output.result);
  const riskColors = {
    SAFE: "green",
    LOW: "yellow",
    MEDIUM: "orange",
    HIGH: "red",
    CRITICAL: "red",
  };
  const riskColor = riskColors[formatted.security.riskLevel];

  return (
    <div className="space-y-4">
      {/* Security Overview */}
      <div
        className={`p-4 border rounded-lg ${
          formatted.security.malicious
            ? "border-red-200 bg-red-50"
            : "border-green-200 bg-green-50"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            🛡️ Security Analysis
            <span
              className={`px-2 py-1 rounded text-xs font-medium bg-${riskColor}-100 text-${riskColor}-800`}
            >
              {formatted.security.riskLevel}
            </span>
          </h3>
          <div className="text-sm font-mono">
            Score: {formatted.security.score}/100
          </div>
        </div>

        {formatted.security.threats.length > 0 && (
          <div className="mb-3">
            <strong className="text-red-700">Threats Detected:</strong>
            <ul className="list-disc list-inside mt-1 text-sm">
              {formatted.security.threats.map((threat, i) => (
                <li key={i} className="text-red-700">
                  {threat}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <strong>Recommendations:</strong>
          <ul className="list-disc list-inside mt-1 text-sm">
            {formatted.security.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Site Overview */}
      <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">🌐 Site Overview</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Domain:</strong> {formatted.overview.domain}
          </div>
          <div>
            <strong>Country:</strong> {formatted.overview.country}
          </div>
          <div>
            <strong>Server:</strong> {formatted.overview.server}
          </div>
          <div>
            <strong>Screenshot:</strong>{" "}
            {formatted.overview.hasScreenshot ? "✅" : "❌"}
          </div>
        </div>
      </div>

      {/* Network Analysis */}
      <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">🌐 Network Analysis</h3>
        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <div className="font-medium">{formatted.network.totalRequests}</div>
            <div className="text-gray-600">Total Requests</div>
          </div>
          <div>
            <div className="font-medium">{formatted.network.uniqueDomains}</div>
            <div className="text-gray-600">Domains</div>
          </div>
          <div>
            <div className="font-medium">
              {formatted.network.thirdPartyRequests}
            </div>
            <div className="text-gray-600">3rd Party</div>
          </div>
        </div>

        {formatted.network.suspiciousDomains.length > 0 && (
          <div>
            <strong className="text-orange-700">Suspicious Domains:</strong>
            <div className="mt-1 text-sm">
              {formatted.network.suspiciousDomains.join(", ")}
            </div>
          </div>
        )}
      </div>

      {/* Technologies */}
      {(formatted.technologies.webServer ||
        formatted.technologies.framework ||
        formatted.technologies.libraries.length > 0) && (
        <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Technologies</h3>
          <div className="space-y-2 text-sm">
            {formatted.technologies.webServer && (
              <div>
                <strong>Server:</strong> {formatted.technologies.webServer}
              </div>
            )}
            {formatted.technologies.framework && (
              <div>
                <strong>Framework:</strong> {formatted.technologies.framework}
              </div>
            )}
            {formatted.technologies.libraries.length > 0 && (
              <div>
                <strong>Libraries:</strong>{" "}
                {formatted.technologies.libraries.join(", ")}
              </div>
            )}
            {formatted.technologies.analytics.length > 0 && (
              <div>
                <strong>Analytics:</strong>{" "}
                {formatted.technologies.analytics.join(", ")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CloudflareSearchOutput({ output }: { output: ScanSearchResponse }) {
  if (!output.results?.length) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg">
        <p className="text-gray-600">No search results found.</p>
      </div>
    );
  }

  const formatted = formatSearchResults(output.results);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">🔍 Search Results</h3>
        <span className="text-sm text-gray-500">
          {output.results.length} results
        </span>
      </div>

      <div className="space-y-2">
        {formatted.map((result) => (
          <div
            key={result.scanId}
            className="p-3 border border-gray-200 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{result.domain}</div>
                <div className="text-xs text-gray-600 truncate">
                  {result.url}
                </div>
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <div>
                    {new Date(result.scanTime).toLocaleDateString()} •{" "}
                    {result.country} • {result.asn}
                  </div>
                  <div>
                    {result.ip} • {result.requests} requests •{" "}
                    {result.dataLength} bytes
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result.malicious && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                    Malicious
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
                  output={
                    pageSpeedTool.output ? (
                      <pre className="text-xs overflow-auto p-4 font-mono">
                        {JSON.stringify(pageSpeedTool.output, null, 2)}
                      </pre>
                    ) : null
                  }
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
                      <CloudflareScanOutput output={securityTool.output} />
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
                      <CloudflareSearchOutput output={searchTool.output} />
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
