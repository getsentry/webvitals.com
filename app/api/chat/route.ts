import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import {
  cloudflareSearchTool,
  cloudflareUrlScannerTool,
} from "@/tools/cloudflare-scanner-tool";
import { pageSpeedTool } from "@/tools/pagespeed-tool";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, pageSpeedConfig } = body;

    if (!messages || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    Sentry.logger.info("Chat request received", {
      messageCount: messages.length,
      hasPageSpeedConfig: !!pageSpeedConfig,
      strategy: pageSpeedConfig?.strategy,
      categories: pageSpeedConfig?.categories,
    });

    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o"),
      messages: modelMessages,
      tools: {
        analyzePageSpeed: pageSpeedTool,
        scanUrlSecurity: cloudflareUrlScannerTool,
        searchSecurityScans: cloudflareSearchTool,
      },
      stopWhen: stepCountIs(2),
      experimental_telemetry: {
        isEnabled: true,
        functionId: "pagespeed-analysis-chat",
      },
      onStepFinish: (step) => {
        Sentry.logger.debug("AI step finished", {
          toolCalls: step.toolCalls?.length || 0,
          toolResults: step.toolResults?.length || 0,
          hasToolCalls: !!step.toolCalls?.length,
          hasToolResults: !!step.toolResults?.length,
        });

        if (step.toolResults) {
          step.toolResults.forEach((result, index) => {
            if ("error" in result) {
              Sentry.captureException(
                new Error(`Tool execution failed: ${result.error}`),
                {
                  tags: {
                    area: "ai-tool-execution",
                    function: "pagespeed-analysis-chat",
                    tool: step.toolCalls?.[index]?.toolName,
                  },
                  contexts: {
                    ai: {
                      model: "gpt-4o",
                      tool: step.toolCalls?.[index]?.toolName,
                      toolError: step.toolCalls?.[index]?.error,
                    },
                  },
                },
              );
            }
          });
        }
      },
      system: `You are a comprehensive web analysis expert assistant specializing in both performance optimization and security analysis. You have access to multiple analysis tools:

## PERFORMANCE ANALYSIS (Google PageSpeed Insights)
When analyzing website performance:
1. Extract the domain/URL from the user's message
2. Use the analyzePageSpeed tool ONCE with the extracted URL and appropriate strategy (mobile/desktop)
3. Analyze ALL THREE types of data from PageSpeed Insights:
   - **FIELD DATA (Real Users):** Chrome UX Report data, most valuable for real-world insights
   - **ORIGIN DATA (Domain-wide):** Performance patterns across the entire domain
   - **LAB DATA (Synthetic):** Lighthouse scores and controlled testing results
4. Prioritize real user data over lab data when they differ

## SECURITY ANALYSIS (Cloudflare URL Scanner)
When analyzing website security or investigating threats:

### Primary Security Analysis (scanUrlSecurity):
- **Risk Assessment:** Use the riskLevel (SAFE/LOW/MEDIUM/HIGH/CRITICAL) and securityScore (0-100) from the summary
- **Threat Detection:** Focus on the threats array for specific security issues found
- **Malicious Content:** Check the malicious boolean for immediate threat status
- **Network Security:** Analyze totalRequests, thirdPartyRequests, httpRequests vs httpsRequests ratios
- **Technology Stack:** Review detected technologies for known vulnerabilities or suspicious patterns
- **Recent Scans:** If isRecentScan is true, inform the user that results are from a recent scan rather than a new analysis

### Threat Investigation (searchSecurityScans):
- Use to find similar threats, investigate domain history, or check for related malicious activities
- Search results include historical scan data with malicious verdicts, ASN info, and network statistics
- Correlate findings with current scan results for threat intelligence

### Key Security Metrics to Highlight:
1. **Security Score:** 90-100 (Excellent), 70-89 (Good), 50-69 (Fair), 30-49 (Poor), 0-29 (Critical)
2. **Network Behavior:** Excessive third-party connections, mixed HTTP/HTTPS usage
3. **Technology Risks:** Outdated frameworks, suspicious analytics, missing security headers
4. **Geolocation:** Country, IP, ASN for threat attribution and risk context

## COMBINED ANALYSIS
For comprehensive website analysis, you can use both tools to provide:
- **Performance + Security:** Complete website health assessment
- **Technology Analysis:** Cross-reference PageSpeed tech detection with Cloudflare's security-focused analysis
- **Network Optimization vs Security:** Balance performance (CDN usage) with security (third-party risks)
- **Actionable Insights:** Prioritize security fixes alongside performance optimizations

## RESPONSE STRUCTURE
Structure responses based on analysis type:
- **Security Focus:** 
  1. **Immediate Threats:** Malicious status, risk level, critical security issues
  2. **Risk Analysis:** Security score breakdown, threat categories, network behavior
  3. **Technology Assessment:** Framework security, third-party risks, missing protections
  4. **Recommendations:** Prioritized security actions with specific remediation steps

- **Performance Focus:** Real User Experience → Lab Results → Recommendations
- **Comprehensive Analysis:**
  1. **Security Overview:** Risk level, threats, security score
  2. **Performance Overview:** Core Web Vitals, optimization opportunities  
  3. **Technology Stack:** Detected frameworks, analytics, security tools
  4. **Network Analysis:** Request patterns, third-party dependencies, security implications
  5. **Prioritized Recommendations:** Security fixes first, then performance optimizations

IMPORTANT: 
- Only call each tool ONCE per analysis request
- Be clear about the difference between performance and security analysis
- Provide actionable, prioritized recommendations
- Explain technical terms in user-friendly language

Configuration: ${JSON.stringify(pageSpeedConfig || {})}`,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    Sentry.logger.error("Chat API error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    Sentry.captureException(error, {
      tags: {
        area: "api-chat",
        endpoint: "/api/chat",
      },
      contexts: {
        request: {
          method: "POST",
          endpoint: "/api/chat",
        },
      },
    });

    return Response.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
