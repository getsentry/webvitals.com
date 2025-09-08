/**
 * Cloudflare URL Scanner API types for security and malware analysis
 */

export type ScanVisibility = "Public" | "Unlisted";
export type ScanStatus = "Queued" | "InProgress" | "Finished";
export type ScreenshotResolution = "desktop" | "mobile" | "tablet";

/**
 * Scan submission request
 */
export interface ScanSubmissionRequest {
  url: string;
  screenshotsResolutions?: ScreenshotResolution[];
  customagent?: string;
  referer?: string;
  customHeaders?: Record<string, string>;
  visibility?: ScanVisibility;
}

/**
 * Scan submission response
 */
export interface ScanSubmissionResponse {
  uuid: string;
  api: string;
  visibility: string;
  url: string;
  message: string;
}

/**
 * Scan task information
 */
export interface ScanTask {
  uuid: string;
  url: string;
  success: boolean;
  status: ScanStatus;
  time: string;
  visibility: string;
  screenshotResolutions: ScreenshotResolution[];
}

/**
 * Page information from scan
 */
export interface ScanPage {
  url: string;
  domain: string;
  ip: string;
  country: string;
  server: string;
  city: string;
  asn: number;
  asnname: string;
  screenshot?: {
    hash: string;
  };
  domStructHash?: string;
  favicon?: {
    hash: string;
  };
  history?: Array<{
    url: string;
    statusCode: number;
  }>;
}

/**
 * Network request information
 */
export interface NetworkRequest {
  url: string;
  hostname: string;
  path: string;
  method: string;
  statusCode: number;
  size: number;
  type: string;
  initiator?: string;
}

/**
 * Cookie information
 */
export interface ScanCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
}

/**
 * Console log entry
 */
export interface ConsoleEntry {
  level: string;
  message: string;
  timestamp: string;
  source?: string;
}

/**
 * Performance timing data
 */
export interface PerformanceData {
  navigationStart: number;
  domContentLoadedEventEnd: number;
  loadEventEnd: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
}

/**
 * Technology detection result
 */
export interface DetectedTechnology {
  name: string;
  version?: string;
  categories: string[];
  confidence: number;
  website: string;
  description?: string;
}

/**
 * Domain categorization
 */
export interface DomainCategories {
  categories: string[];
  confidence: number;
}

/**
 * Phishing detection result
 */
export interface PhishingDetection {
  detected: boolean;
  type?: string;
  confidence?: number;
  reasons?: string[];
}

/**
 * Certificate information
 */
export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  fingerprint: string;
  serialNumber: string;
  signatureAlgorithm: string;
}

/**
 * Verdict information for malicious content detection
 */
export interface ScanVerdicts {
  overall: {
    malicious: boolean;
    categories?: string[];
  };
  phishing?: {
    detected: boolean;
    verdict?: string;
  };
  malware?: {
    detected: boolean;
    verdict?: string;
  };
  spam?: {
    detected: boolean;
    verdict?: string;
  };
}

/**
 * Meta processor results
 */
export interface MetaProcessors {
  domainCategories?: DomainCategories;
  phishing?: PhishingDetection;
  radarRank?: {
    bucket: string;
    rank?: number;
  };
  wappa?: DetectedTechnology[];
}

/**
 * Complete scan result response
 */
export interface ScanResult {
  task: ScanTask;
  page: ScanPage;
  data: {
    requests: NetworkRequest[];
    cookies: ScanCookie[];
    globals?: Record<string, unknown>;
    console: ConsoleEntry[];
    performance: PerformanceData;
  };
  meta: {
    processors: MetaProcessors;
  };
  lists: {
    ips: string[];
    asns: number[];
    domains: Array<{
      domain: string;
      dns?: Record<string, string[]>;
    }>;
    hashes: string[];
    certificates: CertificateInfo[];
  };
  verdicts: ScanVerdicts;
}

/**
 * Search query parameters
 */
export interface ScanSearchParams {
  q: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
}

/**
 * Search result item
 */
export interface ScanSearchResult {
  task: {
    uuid: string;
    url: string;
    time: string;
    visibility: string;
  };
  page: {
    url: string;
    domain: string;
    country?: string;
    screenshot?: string;
  };
  meta?: {
    processors?: {
      radarRank?: {
        bucket: string;
      };
    };
  };
  verdicts?: {
    overall?: {
      malicious: boolean;
    };
  };
}

/**
 * Search response
 */
export interface ScanSearchResponse {
  success: boolean;
  result: {
    search: ScanSearchResult[];
    meta: {
      count: number;
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
    };
  };
}

/**
 * Tool input/output types
 */
export interface CloudflareScannerToolInput {
  url: string;
  visibility?: ScanVisibility;
  screenshotResolutions?: ScreenshotResolution[];
  customHeaders?: Record<string, string>;
  waitForResults?: boolean;
}

export interface CloudflareScannerSearchInput {
  query: string;
  limit?: number;
  offset?: number;
}

export interface CloudflareScannerToolOutput {
  scanId: string;
  scanUrl: string;
  status: ScanStatus;
  result?: ScanResult;
}
