import type {
  DetectedTechnology,
  ScanResult,
  ScanSearchResult,
  ScanVerdicts,
} from "@/types/cloudflare-scanner";

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
 * Formatted scan overview
 */
export interface ScanOverview {
  url: string;
  domain: string;
  finalUrl: string;
  country: string;
  server: string;
  scanTime: string;
  status: string;
  hasScreenshot: boolean;
}

/**
 * Network analysis summary
 */
export interface NetworkSummary {
  totalRequests: number;
  uniqueDomains: number;
  uniqueIps: number;
  httpRequests: number;
  httpsRequests: number;
  thirdPartyRequests: number;
  suspiciousDomains: string[];
  largestRequests: Array<{
    url: string;
    size: number;
    type: string;
  }>;
}

/**
 * Technology stack information
 */
export interface TechStackSummary {
  webServer?: string;
  framework?: string;
  cms?: string;
  analytics: string[];
  libraries: string[];
  security: string[];
  advertising: string[];
  other: DetectedTechnology[];
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
  if (verdicts.malware?.detected) score -= 30;
  if (verdicts.phishing?.detected) score -= 25;
  if (verdicts.spam?.detected) score -= 15;

  // Minor deductions for risk indicators
  const categories = verdicts.overall?.categories || [];
  score -= categories.length * 5; // 5 points per category

  // Deductions for suspicious network behavior
  const requests = result.data?.requests || [];
  const uniqueDomains = new Set(requests.map((r) => r.hostname)).size;
  const thirdPartyRatio =
    uniqueDomains > 1 ? (uniqueDomains - 1) / uniqueDomains : 0;

  if (thirdPartyRatio > 0.8) score -= 10; // Too many third parties
  if (requests.some((r) => !r.url.startsWith("https:"))) score -= 5; // Mixed content

  // Positive points for security indicators
  const hasCSP = result.data?.requests?.some(
    (r) =>
      r.url.includes("content-security-policy") ||
      Object.keys(result.page || {}).some((k) =>
        k.toLowerCase().includes("csp"),
      ),
  );
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

  if (verdicts.malware?.detected) {
    threats.push("Malware detected");
    recommendations.push("Do not visit or interact with this site");
  }

  if (verdicts.phishing?.detected) {
    threats.push("Phishing attempt identified");
    recommendations.push("Do not enter personal information on this site");
  }

  if (verdicts.spam?.detected) {
    threats.push("Spam content identified");
    recommendations.push("Be cautious of promotional content");
  }

  // Check for other risk indicators
  const requests = result.data?.requests || [];
  const hasHTTP = requests.some(
    (r) => r.url.startsWith("http:") && !r.url.startsWith("https:"),
  );
  if (hasHTTP) {
    threats.push("Mixed HTTP/HTTPS content");
    recommendations.push("Site uses insecure connections");
  }

  const uniqueDomains = new Set(requests.map((r) => r.hostname)).size;
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
 * Extract scan overview information
 */
export function getScanOverview(result: ScanResult): ScanOverview {
  return {
    url: result.task.url,
    domain: result.page?.domain || new URL(result.task.url).hostname,
    finalUrl: result.page?.url || result.task.url,
    country: result.page?.country || "Unknown",
    server: result.page?.server || "Unknown",
    scanTime: result.task.time,
    status: result.task.status,
    hasScreenshot: !!result.page?.screenshot?.hash,
  };
}

/**
 * Analyze network requests
 */
export function analyzeNetworkRequests(result: ScanResult): NetworkSummary {
  const requests = result.data?.requests || [];
  const domains = new Set(requests.map((r) => r.hostname));
  const ips = new Set(result.lists?.ips || []);

  const baseDomain = result.page?.domain || new URL(result.task.url).hostname;
  const thirdPartyRequests = requests.filter((r) => r.hostname !== baseDomain);

  const httpRequests = requests.filter((r) => r.url.startsWith("http:"));
  const httpsRequests = requests.filter((r) => r.url.startsWith("https:"));

  // Identify suspicious domains (basic heuristics)
  const suspiciousDomains = Array.from(domains).filter((domain) => {
    return (
      domain.includes("bit.ly") ||
      domain.includes("tinyurl") ||
      domain.includes("t.co") ||
      domain.split(".").length > 4 || // Very deep subdomains
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain) // IP addresses
    );
  });

  // Find largest requests
  const largestRequests = requests
    .filter((r) => r.size > 0)
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)
    .map((r) => ({
      url: r.url.length > 50 ? `${r.url.substring(0, 50)}...` : r.url,
      size: r.size,
      type: r.type,
    }));

  return {
    totalRequests: requests.length,
    uniqueDomains: domains.size,
    uniqueIps: ips.size,
    httpRequests: httpRequests.length,
    httpsRequests: httpsRequests.length,
    thirdPartyRequests: thirdPartyRequests.length,
    suspiciousDomains,
    largestRequests,
  };
}

/**
 * Extract and categorize detected technologies
 */
export function extractTechStack(result: ScanResult): TechStackSummary {
  const technologies = result.meta?.processors?.wappa || [];

  const categorized: TechStackSummary = {
    analytics: [],
    libraries: [],
    security: [],
    advertising: [],
    other: [],
  };

  technologies.forEach((tech) => {
    const categories = tech.categories.map((c) => c.toLowerCase());

    if (categories.includes("web servers")) {
      categorized.webServer = tech.name;
    } else if (categories.includes("web frameworks")) {
      categorized.framework = tech.name;
    } else if (categories.includes("cms")) {
      categorized.cms = tech.name;
    } else if (categories.some((c) => c.includes("analytics"))) {
      categorized.analytics.push(tech.name);
    } else if (
      categories.some(
        (c) => c.includes("javascript") || c.includes("libraries"),
      )
    ) {
      categorized.libraries.push(tech.name);
    } else if (categories.some((c) => c.includes("security"))) {
      categorized.security.push(tech.name);
    } else if (categories.some((c) => c.includes("advertising"))) {
      categorized.advertising.push(tech.name);
    } else {
      categorized.other.push(tech);
    }
  });

  return categorized;
}

/**
 * Format scan result for display
 */
export function formatScanResult(result: ScanResult): {
  overview: ScanOverview;
  security: SecuritySummary;
  network: NetworkSummary;
  technologies: TechStackSummary;
} {
  return {
    overview: getScanOverview(result),
    security: generateSecuritySummary(result),
    network: analyzeNetworkRequests(result),
    technologies: extractTechStack(result),
  };
}

/**
 * Format search results for display
 */
export function formatSearchResults(results: ScanSearchResult[]): Array<{
  scanId: string;
  url: string;
  domain: string;
  scanTime: string;
  malicious: boolean;
  country?: string;
  rank?: string;
}> {
  return results.map((result) => ({
    scanId: result.task.uuid,
    url: result.task.url,
    domain: result.page.domain,
    scanTime: result.task.time,
    malicious: result.verdicts?.overall?.malicious || false,
    country: result.page.country,
    rank: result.meta?.processors?.radarRank?.bucket,
  }));
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

  if (result.page?.domStructHash) {
    queries.push(`hash:${result.page.domStructHash}`);
  }

  if (result.page?.screenshot?.hash) {
    queries.push(`page.screenshot.hash:${result.page.screenshot.hash}`);
  }

  if (result.page?.favicon?.hash) {
    queries.push(`page.favicon.hash:${result.page.favicon.hash}`);
  }

  return queries.join(" OR ");
}
