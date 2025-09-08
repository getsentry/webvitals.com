import type { ScanResult, ScanVerdicts } from "@/types/cloudflare-scanner";

/**
 * Security risk level based on scan results
 */
export type SecurityRiskLevel = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Formatted security summary
 */
export interface SecuritySummary {
  riskLevel: SecurityRiskLevel;
  malicious: boolean;
  threats: string[];
  recommendations: string[];
  score: number; // 0-100, higher is safer
}

/**
 * Determine security risk level from scan verdicts
 */
export function getSecurityRiskLevel(
  verdicts: ScanVerdicts,
): SecurityRiskLevel {
  if (verdicts.overall?.malicious) {
    const threatCount = [
      verdicts.phishing?.detected,
      verdicts.malware?.detected,
      verdicts.spam?.detected,
    ].filter(Boolean).length;

    if (threatCount >= 2) return "CRITICAL";
    if (verdicts.malware?.detected) return "HIGH";
    if (verdicts.phishing?.detected) return "HIGH";
    return "MEDIUM";
  }

  // Check for suspicious indicators even if not flagged as malicious
  const overallCategories = verdicts.overall?.categories || [];
  if (
    overallCategories.some(
      (cat) =>
        cat.toLowerCase().includes("suspicious") ||
        cat.toLowerCase().includes("risk"),
    )
  ) {
    return "LOW";
  }

  return "SAFE";
}

/**
 * Calculate security score (0-100, higher is safer)
 */
export function calculateSecurityScore(result: ScanResult): number {
  let score = 100;
  const verdicts = result.verdicts;

  // Major deductions for confirmed threats
  if (verdicts.overall?.malicious) score -= 60;
  // Note: The actual API doesn't provide separate malware/phishing/spam verdicts in the current structure
  // if (verdicts.malware?.detected) score -= 30;
  // if (verdicts.phishing?.detected) score -= 25;
  // if (verdicts.spam?.detected) score -= 15;

  // Minor deductions for risk indicators
  const categories = verdicts.overall?.categories || [];
  score -= categories.length * 5; // 5 points per category

  // Deductions for suspicious network behavior
  const requests = result.data?.requests || [];
  const requestUrls = requests
    .flatMap((req) => [
      req.request?.request?.url,
      ...(req.requests?.map((r) => r.request?.url) || []),
    ])
    .filter(Boolean);

  const domains = new Set(
    requestUrls
      .map((url) => {
        try {
          return new URL(url!).hostname;
        } catch {
          return null;
        }
      })
      .filter((domain): domain is string => Boolean(domain)),
  );

  const thirdPartyRatio =
    domains.size > 1 ? (domains.size - 1) / domains.size : 0;

  if (thirdPartyRatio > 0.8) score -= 10; // Too many third parties
  if (requestUrls.some((url: any) => url && !url.startsWith("https:")))
    score -= 5; // Mixed content

  // Positive points for security indicators
  const hasCSP =
    requestUrls.some(
      (url: any) => url && url.includes("content-security-policy"),
    ) ||
    Object.keys(result.page || {}).some((k) => k.toLowerCase().includes("csp"));
  if (hasCSP) score += 5;

  const hasHTTPS = result.page?.url?.startsWith("https:");
  if (hasHTTPS) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate security summary from scan result
 */
export function generateSecuritySummary(result: ScanResult): SecuritySummary {
  const verdicts = result.verdicts;
  const riskLevel = getSecurityRiskLevel(verdicts);
  const score = calculateSecurityScore(result);

  const threats: string[] = [];
  const recommendations: string[] = [];

  // Note: Current API structure only provides overall malicious verdict
  // if (verdicts.malware?.detected) {
  //   threats.push("Malware detected");
  //   recommendations.push("Do not visit or interact with this site");
  // }

  // if (verdicts.phishing?.detected) {
  //   threats.push("Phishing attempt identified");
  //   recommendations.push("Do not enter personal information on this site");
  // }

  // if (verdicts.spam?.detected) {
  //   threats.push("Spam content identified");
  //   recommendations.push("Be cautious of promotional content");
  // }

  // Check the overall malicious verdict and categories
  if (verdicts.overall?.malicious) {
    threats.push("Site flagged as malicious");
    recommendations.push("Do not visit or interact with this site");
  }

  // Check for specific categories that might indicate threats
  const categories = verdicts.overall?.categories || [];
  categories.forEach((category: string) => {
    threats.push(`Flagged category: ${category}`);
  });

  // Check for other risk indicators
  const requests = result.data?.requests || [];
  const requestUrls = requests
    .flatMap((req) => [
      req.request?.request?.url,
      ...(req.requests?.map((r) => r.request?.url) || []),
    ])
    .filter(Boolean);

  const hasHTTP = requestUrls.some(
    (url: any) => url && url.startsWith("http:") && !url.startsWith("https:"),
  );
  if (hasHTTP) {
    threats.push("Mixed HTTP/HTTPS content");
    recommendations.push("Site uses insecure connections");
  }

  const uniqueDomains = new Set(
    requestUrls
      .map((url: any) => {
        try {
          return new URL(url).hostname;
        } catch {
          return null;
        }
      })
      .filter((domain): domain is string => Boolean(domain)),
  ).size;
  if (uniqueDomains > 20) {
    threats.push("Excessive third-party connections");
    recommendations.push("Site connects to many external domains");
  }

  if (threats.length === 0 && riskLevel === "SAFE") {
    recommendations.push("Site appears safe based on current analysis");
  }

  return {
    riskLevel,
    malicious: verdicts.overall?.malicious || false,
    threats,
    recommendations,
    score,
  };
}

/**
 * Generate common search queries
 */
export const COMMON_SEARCH_QUERIES = {
  maliciousToday: "verdicts.malicious:true AND date:>now-1d",
  phishingThisWeek: "verdicts.phishing.detected:true AND date:>now-7d",
  highRiskDomains: "verdicts.malicious:true AND NOT page.domain:*.com",
  newThreats: "verdicts.malicious:true AND date:>now-1h",
  suspiciousRedirects:
    "page.url:* AND NOT task.url:page.url AND verdicts.malicious:true",
  mobileMalware: "verdicts.malicious:true AND task.strategy:mobile",
  recentScans: "date:>now-1d",
  topDomains: 'meta.processors.radarRank.bucket:"top 1000"',
};

/**
 * Build search query for domain investigation
 */
export function buildDomainInvestigationQuery(domain: string): string {
  return `page.domain:${domain} OR domain:${domain}`;
}

/**
 * Build search query for similar threats
 */
export function buildSimilarThreatsQuery(result: ScanResult): string {
  const queries: string[] = [];

  // Use available screenshot hashes from the official API structure
  if (result.page?.screenshot?.dhash) {
    queries.push(`page.screenshot.dhash:${result.page.screenshot.dhash}`);
  }

  if (result.page?.screenshot?.phash) {
    queries.push(`page.screenshot.phash:${result.page.screenshot.phash}`);
  }

  // Use domain for similarity matching if no hash is available
  if (result.page?.domain && queries.length === 0) {
    queries.push(`page.domain:${result.page.domain}`);
  }

  return queries.join(" OR ");
}
