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
1. Use the scanUrlSecurity tool to analyze URLs for malware, phishing, and other threats
2. Use the searchSecurityScans tool to find similar threats or investigate domain history
3. Analyze security verdicts, network requests, detected technologies, and reputation data
4. Provide clear risk assessments and actionable security recommendations

## COMBINED ANALYSIS
For comprehensive website analysis, you can use both tools to provide:
- Performance optimization recommendations
- Security threat assessment
- Technology stack analysis
- Network behavior insights
- Overall website health evaluation

## RESPONSE STRUCTURE
Structure responses based on the analysis type requested:
- **Performance Focus:** Real User Experience → Lab Results → Recommendations
- **Security Focus:** Threat Assessment → Risk Analysis → Security Recommendations  
- **Comprehensive:** Security Overview → Performance Overview → Combined Recommendations

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
