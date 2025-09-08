/**
 * Cloudflare URL Scanner API types for security and malware analysis
 */

export type ScanVisibility = "Public" | "Unlisted";
export type ScanStatus = "queued" | "running" | "finished" | "failed";
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
 * Scan submission response (matches Create URL Scan API)
 */
export interface ScanSubmissionResponse {
  api: string;
  message: string;
  result: string;
  url: string;
  uuid: string;
  visibility: string;
  options?: {
    useragent?: string;
  };
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
 * Complete scan result response (matches official API documentation)
 */
export interface ScanResult {
  data: {
    console: Array<{
      message: {
        level: string;
        source: string;
        text: string;
        url: string;
      };
    }>;
    cookies: Array<{
      domain: string;
      expires: number;
      httpOnly: boolean;
      name: string;
      path: string;
      priority: string;
      sameParty: boolean;
      secure: boolean;
      session: boolean;
      size: number;
      sourcePort: number;
      sourceScheme: string;
      value: string;
    }>;
    globals: Array<{
      prop: string;
      type: string;
    }>;
    links: Array<{
      href: string;
      text: string;
    }>;
    performance: Array<{
      duration: number;
      entryType: string;
      name: string;
      startTime: number;
    }>;
    requests: Array<{
      request: {
        documentURL: string;
        hasUserGesture: boolean;
        initiator: {
          host: string;
          type: string;
          url: string;
        };
        redirectHasExtraInfo: boolean;
        request: {
          initialPriority: string;
          isSameSite: boolean;
          method: string;
          mixedContentType: string;
          referrerPolicy: string;
          url: string;
          headers: Record<string, any>;
        };
        requestId: string;
        type: string;
        wallTime: number;
        frameId: string;
        loaderId: string;
        primaryRequest: boolean;
        redirectResponse?: {
          charset: string;
          mimeType: string;
          protocol: string;
          remoteIPAddress: string;
          remotePort: number;
          securityHeaders: Array<{
            name: string;
            value: string;
          }>;
          securityState: string;
          status: number;
          statusText: string;
          url: string;
          headers: Record<string, any>;
        };
      };
      response: {
        asn: {
          asn: string;
          country: string;
          description: string;
          ip: string;
          name: string;
          org: string;
        };
        dataLength: number;
        encodedDataLength: number;
        geoip: {
          city: string;
          country: string;
          country_name: string;
          geonameId: string;
          ll: number[];
          region: string;
        };
        hasExtraInfo: boolean;
        requestId: string;
        response: {
          charset: string;
          mimeType: string;
          protocol: string;
          remoteIPAddress: string;
          remotePort: number;
          securityDetails?: {
            certificateId: number;
            certificateTransparencyCompliance: string;
            cipher: string;
            encryptedClientHello: boolean;
            issuer: string;
            keyExchange: string;
            keyExchangeGroup: string;
            protocol: string;
            sanList: string[];
            serverSignatureAlgorithm: number;
            subjectName: string;
            validFrom: number;
            validTo: number;
          };
          securityHeaders: Array<{
            name: string;
            value: string;
          }>;
          securityState: string;
          status: number;
          statusText: string;
          url: string;
          headers: Record<string, any>;
        };
        size: number;
        type: string;
        contentAvailable: boolean;
        hash: string;
      };
      requests: Array<{
        documentURL: string;
        frameId: string;
        hasUserGesture: boolean;
        initiator: {
          type: string;
        };
        loaderId: string;
        redirectHasExtraInfo: boolean;
        request: {
          headers: Record<string, string>;
          initialPriority: string;
          isSameSite: boolean;
          method: string;
          mixedContentType: string;
          referrerPolicy: string;
          url: string;
        };
        requestId: string;
        type: string;
        wallTime: number;
      }>;
    }>;
  };
  lists: {
    asns: string[];
    certificates: Array<{
      issuer: string;
      subjectName: string;
      validFrom: number;
      validTo: number;
    }>;
    continents: string[];
    countries: string[];
    domains: string[];
    hashes: string[];
    ips: string[];
    linkDomains: string[];
    servers: string[];
    urls: string[];
  };
  meta: {
    processors: {
      asn?: {
        data: Array<{
          asn: string;
          country: string;
          description: string;
          ip: string;
          name: string;
        }>;
      };
      dns?: {
        data: Array<{
          address: string;
          dnssec_valid: boolean;
          name: string;
          type: string;
        }>;
      };
      domainCategories?: {
        data: Array<{
          inherited: Record<string, any>;
          isPrimary: boolean;
          name: string;
        }>;
      };
      geoip?: {
        data: Array<{
          geoip: {
            city: string;
            country: string;
            country_name: string;
            ll: number[];
            region: string;
          };
          ip: string;
        }>;
      };
      phishing?: {
        data: string[];
      };
      radarRank?: {
        data: Array<{
          bucket: string;
          hostname: string;
          rank: number;
        }>;
      };
      wappa?: {
        data: Array<{
          app: string;
          categories: Array<{
            name: string;
            priority: number;
          }>;
          confidence: Array<{
            confidence: number;
            name: string;
            pattern: string;
            patternType: string;
          }>;
          confidenceTotal: number;
          icon: string;
          website: string;
        }>;
      };
      urlCategories?: {
        data: Array<{
          content: Array<{
            id: number;
            name: string;
            super_category_id: number;
          }>;
          inherited: {
            content: Array<{
              id: number;
              name: string;
              super_category_id: number;
            }>;
            from: string;
            risks: Array<{
              id: number;
              name: string;
              super_category_id: number;
            }>;
          };
          name: string;
          risks: Array<{
            id: number;
            name: string;
            super_category_id: number;
          }>;
        }>;
      };
    };
  };
  page: {
    apexDomain: string;
    asn: string;
    asnname: string;
    city: string;
    country: string;
    domain: string;
    ip: string;
    mimeType: string;
    server: string;
    status: string;
    title: string;
    tlsAgeDays: number;
    tlsIssuer: string;
    tlsValidDays: number;
    tlsValidFrom: string;
    url: string;
    screenshot?: {
      dhash: string;
      mm3Hash: number;
      name: string;
      phash: string;
    };
  };
  scanner: {
    colo: string;
    country: string;
  };
  stats: {
    domainStats: Array<{
      count: number;
      countries: string[];
      domain: string;
      encodedSize: number;
      index: number;
      initiators: string[];
      ips: string[];
      redirects: number;
      size: number;
    }>;
    ipStats: Array<{
      asn: {
        asn: string;
        country: string;
        description: string;
        ip: string;
        name: string;
        org: string;
      };
      countries: string[];
      domains: string[];
      encodedSize: number;
      geoip: {
        city: string;
        country: string;
        country_name: string;
        ll: number[];
        region: string;
      };
      index: number;
      ip: string;
      ipv6: boolean;
      redirects: number;
      requests: number;
      size: number;
      count: number;
    }>;
    IPv6Percentage: number;
    malicious: number;
    protocolStats: Array<{
      count: number;
      countries: string[];
      encodedSize: number;
      ips: string[];
      protocol: string;
      size: number;
    }>;
    resourceStats: Array<{
      compression: number;
      count: number;
      countries: string[];
      encodedSize: number;
      ips: string[];
      percentage: number;
      size: number;
      type: string;
    }>;
    securePercentage: number;
    secureRequests: number;
    serverStats: Array<{
      count: number;
      countries: string[];
      encodedSize: number;
      ips: string[];
      server: string;
      size: number;
    }>;
    tlsStats: Array<{
      count: number;
      countries: string[];
      encodedSize: number;
      ips: string[];
      protocols: Record<string, number>;
      securityState: string;
      size: number;
    }>;
    totalLinks: number;
    uniqASNs: number;
    uniqCountries: number;
  };
  task: {
    apexDomain: string;
    domain: string;
    domURL: string;
    method: string;
    options: {
      customHeaders: Record<string, any>;
      screenshotsResolutions: string[];
    };
    reportURL: string;
    screenshotURL: string;
    source: string;
    success: boolean;
    time: string;
    url: string;
    uuid: string;
    visibility: string;
    status?: ScanStatus;
  };
  verdicts: {
    overall: {
      categories: string[];
      hasVerdicts: boolean;
      malicious: boolean;
      tags: string[];
    };
  };
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
 * Search result item (matches Search Scans API)
 */
export interface ScanSearchResult {
  _id: string;
  page: {
    asn: string;
    country: string;
    ip: string;
    url: string;
  };
  result: string; // URL to the full scan result
  stats: {
    dataLength: number;
    requests: number;
    uniqCountries: number;
    uniqIPs: number;
  };
  task: {
    time: string;
    url: string;
    uuid: string;
    visibility: string;
  };
  verdicts: {
    malicious: boolean;
  };
}

/**
 * Search response (matches Search Scans API)
 */
export interface ScanSearchResponse {
  results: ScanSearchResult[];
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
  summary?: {
    // Security Assessment
    malicious: boolean;
    hasVerdicts: boolean;
    riskLevel: "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    securityScore: number; // 0-100
    threats: string[];

    // Site Information
    domain: string;
    finalUrl: string;
    country?: string;
    server?: string;
    ip?: string;

    // Network Analysis
    totalRequests: number;
    uniqueDomains: number;
    thirdPartyRequests: number;
    httpRequests: number;
    httpsRequests: number;

    // Technology Stack
    technologies: {
      detected: string[];
      webServer?: string;
      framework?: string;
      analytics: string[];
      security: string[];
    };

    // Resources
    reportUrl?: string;
    screenshotUrl?: string;
    hasScreenshot: boolean;
  };
}
