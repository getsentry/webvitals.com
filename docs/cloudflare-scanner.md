# Cloudflare URL Scanner Tool

The Cloudflare URL Scanner tool provides comprehensive security analysis of URLs using Cloudflare's URL Scanner service. It can detect malware, phishing attempts, and other security threats.

## Tools Available

### 1. `cloudflareUrlScannerTool` (scanUrlSecurity)
Analyzes URLs for security threats and provides detailed security assessment.

### 2. `cloudflareSearchTool` (searchSecurityScans)  
Searches existing scan results using ElasticSearch query syntax.

## Features

### Security Analysis
- **Malware Detection** - Identifies malicious content and threats
- **Phishing Detection** - Detects phishing attempts and social engineering
- **Risk Assessment** - Provides risk levels (SAFE, LOW, MEDIUM, HIGH, CRITICAL)
- **Security Scoring** - Numerical security score (0-100)
- **Threat Categorization** - Lists specific threats detected

### Site Intelligence
- **Technology Stack Detection** - Identifies web technologies, frameworks, and libraries
- **Network Analysis** - Analyzes network requests and third-party connections
- **Geolocation Data** - Country, city, ASN, and IP information
- **SSL/TLS Analysis** - Certificate and security protocol information

### Smart Scanning
- **Recent Scan Reuse** - Automatically uses recent scans to avoid duplicate work
- **Intelligent Polling** - Waits for scan completion with exponential backoff
- **Error Handling** - Graceful handling of API errors and timeouts

## Input Parameters

### scanUrlSecurity Parameters
```typescript
{
  url: string;                          // URL to scan (required)
  visibility?: "Public" | "Unlisted";  // Scan visibility (default: "Unlisted")
  screenshotResolutions?: Array<"desktop" | "mobile" | "tablet">; // Screenshot formats
  customHeaders?: Record<string, string>; // Custom HTTP headers
}
```

### searchSecurityScans Parameters
```typescript
{
  query: string;    // ElasticSearch query (required)
  limit?: number;   // Results limit (1-100, default: 20)
  offset?: number;  // Results offset (default: 0)
}
```

## Output Structure

### Scan Tool Output
```typescript
{
  scanId: string;           // Unique scan identifier
  scanUrl: string;          // URL to full scan report
  status: ScanStatus;       // "queued" | "running" | "finished" | "failed"
  summary: {
    // Security Assessment (most important)
    malicious: boolean;                    // Is the site malicious?
    riskLevel: "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    securityScore: number;                 // Security score 0-100
    threats: string[];                     // All threats detected (no limit)
    
    // Essential Site Information  
    domain: string;                        // Primary domain
    finalUrl: string;                      // Final URL after redirects
    
    // Technology Stack (all detected technologies)
    technologies: Array<{
      name: string;                        // Technology name
      confidence: number;                  // Detection confidence (0-100)
      categories: string[];                // Technology categories
    }>;
    
    // Critical scan metadata
    scanId: string;                        // Scan identifier
    scanTime: string;                      // When scan was performed
    
    // Metadata
    isRecentScan?: boolean;                // Was this a recent scan reuse?
  }
}
```

### Search Tool Output
```typescript
{
  results: Array<{
    _id: string;                          // Scan ID
    page: {
      asn: string;                        // Autonomous System Number
      country: string;                    // Country code
      ip: string;                         // IP address
      url: string;                        // Scanned URL
    };
    result: string;                       // URL to full scan result
    stats: {
      dataLength: number;                 // Total data transferred
      requests: number;                   // Number of requests
      uniqCountries: number;              // Unique countries
      uniqIPs: number;                    // Unique IP addresses
    };
    task: {
      time: string;                       // Scan timestamp
      url: string;                        // Original URL
      uuid: string;                       // Scan UUID
      visibility: string;                 // Scan visibility
    };
    verdicts: {
      malicious: boolean;                 // Malicious verdict
    };
  }>
}
```

## Search Query Examples

The search tool supports ElasticSearch syntax for flexible querying:

```bash
# Search by domain
page.domain:"example.com"

# Search for malicious scans
verdicts.malicious:true

# Search by date range
date:[2024-01-01 TO 2024-12-31]

# Search for scans with specific technology
meta.processors.wappa.data.app:"WordPress"

# Complex queries
page.domain:microsoft AND verdicts.malicious:true AND NOT page.domain:microsoft.com
```

## Use Cases

### Security Assessment
- Analyze suspicious URLs before visiting
- Verify link safety in emails or messages
- Check third-party integrations for security risks
- Monitor domain reputation

### Threat Intelligence
- Research malware campaigns
- Track phishing patterns
- Analyze compromised websites
- Investigate security incidents

### Website Analysis
- Audit technology stack
- Check SSL/TLS configuration
- Analyze network behavior
- Monitor hosting infrastructure

## Rate Limits & Best Practices

- **Scan Reuse**: Tool automatically reuses recent scans (within 5 minutes)
- **Polling**: Scans typically complete within 30-60 seconds
- **Visibility**: Use "Unlisted" for private analysis, "Public" for community sharing
- **Custom Headers**: Add authentication headers for protected resources

## Error Handling

The tool handles various error conditions gracefully:
- **API Errors**: Provides detailed error messages
- **Timeout Handling**: Retries with exponential backoff
- **Rate Limiting**: Respects API rate limits
- **Network Issues**: Handles temporary connectivity problems

## Security Considerations

- All scans are performed through Cloudflare's infrastructure
- "Unlisted" scans are private and not searchable by others
- Custom headers are handled securely
- No sensitive data is logged or stored locally