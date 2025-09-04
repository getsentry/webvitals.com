/**
 * Custom tech stack detection service
 * Analyzes HTTP headers, HTML content, and script patterns to identify technologies
 */

export interface TechStack {
  frameworks: Framework[];
  libraries: Library[];
  hosting: Hosting[];
  bundlers: Bundler[];
  cms: CMS[];
  analytics: Analytics[];
  cdn: CDN[];
}

export interface Framework {
  name: string;
  version?: string;
  confidence: number;
  evidence: string[];
}

export interface Library extends Framework {}
export interface Hosting extends Framework {}
export interface Bundler extends Framework {}
export interface CMS extends Framework {}
export interface Analytics extends Framework {}
export interface CDN extends Framework {}

export interface DetectionResult {
  url: string;
  techStack: TechStack;
  detectionTime: number;
  userAgent: string;
}

/**
 * HTTP Header patterns for technology detection
 */
const HEADER_PATTERNS = {
  // Server/Hosting detection
  server: {
    'Vercel': /vercel/i,
    'Netlify': /netlify/i,
    'Cloudflare': /cloudflare/i,
    'Apache': /apache/i,
    'Nginx': /nginx/i,
    'IIS': /iis/i,
  },
  powered_by: {
    'Next.js': /next\.?js/i,
    'Express': /express/i,
    'PHP': /php/i,
    'ASP.NET': /asp\.net/i,
  },
  // CDN detection
  'x-served-by': {
    'Fastly': /fastly/i,
    'Cloudflare': /cloudflare/i,
  },
  // Framework-specific headers
  'x-nextjs-cache': {
    'Next.js': /.*/,
  },
  'x-vercel-cache': {
    'Vercel': /.*/,
  },
  'x-nf-request-id': {
    'Netlify': /.*/,
  },
};

/**
 * HTML/Script content patterns for framework detection
 */
const CONTENT_PATTERNS = {
  // React detection
  react: {
    patterns: [
      /_next\/static\//, // Next.js
      /react/i,
      /data-reactroot/,
      /__NEXT_DATA__/,
      /\/_next\//,
    ],
    name: 'React',
    confidence: 0.8,
  },
  nextjs: {
    patterns: [
      /_next\/static\/chunks\//,
      /__NEXT_DATA__/,
      /_next\/webpack-runtime/,
      /next\/dist\//,
    ],
    name: 'Next.js',
    confidence: 0.9,
  },
  vue: {
    patterns: [
      /vue\.js/i,
      /vue\.min\.js/i,
      /data-v-/,
      /vue-router/i,
      /__nuxt/,
    ],
    name: 'Vue.js',
    confidence: 0.8,
  },
  nuxt: {
    patterns: [
      /__nuxt/,
      /_nuxt\//,
      /nuxt\.js/i,
    ],
    name: 'Nuxt.js',
    confidence: 0.9,
  },
  angular: {
    patterns: [
      /ng-version/,
      /angular/i,
      /ng-app/,
      /_angular/,
    ],
    name: 'Angular',
    confidence: 0.8,
  },
  svelte: {
    patterns: [
      /svelte/i,
      /_app\/version/,
      /sveltekit/i,
    ],
    name: 'Svelte',
    confidence: 0.8,
  },
  // Build tools/Bundlers
  webpack: {
    patterns: [
      /webpack/i,
      /__webpack_require__/,
      /webpackChunkName/,
    ],
    name: 'Webpack',
    confidence: 0.7,
  },
  vite: {
    patterns: [
      /@vite\/client/,
      /vite\/dist/,
      /__vite/,
    ],
    name: 'Vite',
    confidence: 0.8,
  },
  // CMS Detection
  wordpress: {
    patterns: [
      /wp-content/,
      /wp-includes/,
      /wp-json/,
      /wordpress/i,
    ],
    name: 'WordPress',
    confidence: 0.9,
  },
  drupal: {
    patterns: [
      /drupal/i,
      /sites\/default\/files/,
      /drupal\.js/,
    ],
    name: 'Drupal',
    confidence: 0.8,
  },
  shopify: {
    patterns: [
      /shopify/i,
      /cdn\.shopify\.com/,
      /shop\.js/,
    ],
    name: 'Shopify',
    confidence: 0.9,
  },
  // Analytics
  googleAnalytics: {
    patterns: [
      /google-analytics/i,
      /gtag/,
      /ga\.js/,
      /googletagmanager/i,
    ],
    name: 'Google Analytics',
    confidence: 0.9,
  },
  // CDNs
  cloudflare: {
    patterns: [
      /cloudflare/i,
      /cdnjs\.cloudflare\.com/,
    ],
    name: 'Cloudflare',
    confidence: 0.8,
  },
};

/**
 * Meta tag patterns for technology detection
 */
const META_PATTERNS = {
  generator: {
    'Next.js': /next\.?js/i,
    'Gatsby': /gatsby/i,
    'Hugo': /hugo/i,
    'Jekyll': /jekyll/i,
    'WordPress': /wordpress/i,
    'Drupal': /drupal/i,
    'Webflow': /webflow/i,
    'Wix': /wix/i,
    'Squarespace': /squarespace/i,
  },
  'theme-name': {
    'WordPress': /.*/,
  },
  'astro-view-transitions-enabled': {
    'Astro': /.*/,
  },
};

export class TechDetector {
  /**
   * Analyze a website's technology stack
   */
  async detectTechStack(url: string): Promise<DetectionResult> {
    const startTime = Date.now();
    
    try {
      // Fetch the webpage
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WebVitals.com Tech Detector 1.0 (https://webvitals.com)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const headers = Object.fromEntries(response.headers.entries());

      // Perform detection
      const techStack = this.analyzeTechStack(html, headers, url);
      
      return {
        url,
        techStack,
        detectionTime: Date.now() - startTime,
        userAgent: 'WebVitals.com Tech Detector 1.0',
      };
    } catch (error) {
      console.error('Tech detection failed:', error);
      throw error;
    }
  }

  /**
   * Analyze tech stack from HTML and headers
   */
  private analyzeTechStack(html: string, headers: Record<string, string>, url: string): TechStack {
    const detected: TechStack = {
      frameworks: [],
      libraries: [],
      hosting: [],
      bundlers: [],
      cms: [],
      analytics: [],
      cdn: [],
    };

    // Analyze HTTP headers
    this.analyzeHeaders(headers, detected);
    
    // Analyze HTML content
    this.analyzeContent(html, detected);
    
    // Analyze meta tags
    this.analyzeMetaTags(html, detected);
    
    // Analyze script URLs and content
    this.analyzeScripts(html, detected);
    
    // Remove duplicates and sort by confidence
    this.deduplicateAndSort(detected);

    return detected;
  }

  /**
   * Analyze HTTP headers for technology signatures
   */
  private analyzeHeaders(headers: Record<string, string>, detected: TechStack): void {
    for (const [headerName, headerValue] of Object.entries(headers)) {
      const normalizedHeader = headerName.toLowerCase().replace(/-/g, '_');
      const patterns = HEADER_PATTERNS[normalizedHeader as keyof typeof HEADER_PATTERNS];
      
      if (!patterns) continue;

      for (const [techName, pattern] of Object.entries(patterns)) {
        if (pattern.test(headerValue)) {
          this.addDetection(detected, techName, 0.9, [`Header: ${headerName}`]);
        }
      }
    }
  }

  /**
   * Analyze HTML content for framework patterns
   */
  private analyzeContent(html: string, detected: TechStack): void {
    for (const [key, config] of Object.entries(CONTENT_PATTERNS)) {
      let matchCount = 0;
      const evidence: string[] = [];

      for (const pattern of config.patterns) {
        if (pattern.test(html)) {
          matchCount++;
          evidence.push(`Pattern: ${pattern.source}`);
        }
      }

      if (matchCount > 0) {
        const confidence = Math.min(config.confidence * (matchCount / config.patterns.length), 1);
        this.addDetection(detected, config.name, confidence, evidence);
      }
    }
  }

  /**
   * Analyze meta tags for technology information
   */
  private analyzeMetaTags(html: string, detected: TechStack): void {
    const metaRegex = /<meta[^>]+name=["']([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = metaRegex.exec(html)) !== null) {
      const [, name, content] = match;
      const patterns = META_PATTERNS[name.toLowerCase() as keyof typeof META_PATTERNS];
      
      if (!patterns) continue;

      for (const [techName, pattern] of Object.entries(patterns)) {
        if (pattern.test(content)) {
          this.addDetection(detected, techName, 0.95, [`Meta: ${name}="${content}"`]);
        }
      }
    }
  }

  /**
   * Analyze script tags and URLs for technology signatures
   */
  private analyzeScripts(html: string, detected: TechStack): void {
    const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = scriptRegex.exec(html)) !== null) {
      const [, src] = match;
      
      // Check script URLs against patterns
      for (const [key, config] of Object.entries(CONTENT_PATTERNS)) {
        for (const pattern of config.patterns) {
          if (pattern.test(src)) {
            this.addDetection(detected, config.name, config.confidence * 0.9, [`Script: ${src}`]);
          }
        }
      }
    }
  }

  /**
   * Add a technology detection to the appropriate category
   */
  private addDetection(
    detected: TechStack, 
    techName: string, 
    confidence: number, 
    evidence: string[]
  ): void {
    const detection: Framework = {
      name: techName,
      confidence,
      evidence,
    };

    // Categorize the detection
    const category = this.categorizeTech(techName);
    detected[category].push(detection);
  }

  /**
   * Categorize a technology into the appropriate type
   */
  private categorizeTech(techName: string): keyof TechStack {
    const frameworks = ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby', 'Astro'];
    const cms = ['WordPress', 'Drupal', 'Shopify', 'Webflow', 'Wix', 'Squarespace'];
    const hosting = ['Vercel', 'Netlify', 'Cloudflare', 'Apache', 'Nginx', 'IIS'];
    const bundlers = ['Webpack', 'Vite'];
    const analytics = ['Google Analytics'];
    const cdn = ['Cloudflare', 'Fastly'];

    if (frameworks.includes(techName)) return 'frameworks';
    if (cms.includes(techName)) return 'cms';
    if (hosting.includes(techName)) return 'hosting';
    if (bundlers.includes(techName)) return 'bundlers';
    if (analytics.includes(techName)) return 'analytics';
    if (cdn.includes(techName)) return 'cdn';
    
    return 'libraries';
  }

  /**
   * Remove duplicate detections and sort by confidence
   */
  private deduplicateAndSort(detected: TechStack): void {
    for (const category of Object.keys(detected) as Array<keyof TechStack>) {
      const items = detected[category];
      
      // Group by name and merge evidence
      const grouped = new Map<string, Framework>();
      
      for (const item of items) {
        if (grouped.has(item.name)) {
          const existing = grouped.get(item.name)!;
          existing.confidence = Math.max(existing.confidence, item.confidence);
          existing.evidence.push(...item.evidence);
        } else {
          grouped.set(item.name, { ...item });
        }
      }
      
      // Sort by confidence and update array
      detected[category] = Array.from(grouped.values())
        .sort((a, b) => b.confidence - a.confidence);
    }
  }
}

// Export singleton instance
export const techDetector = new TechDetector();