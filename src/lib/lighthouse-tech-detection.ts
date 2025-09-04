/**
 * Extract technology stack information from Lighthouse audit results
 * Uses Lighthouse's existing third-party detection and other audit data
 */

export interface TechStack {
  frameworks: string[];
  libraries: string[];
  analytics: string[];
  hosting: string[];
  cdn: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface LighthouseThirdParty {
  entity: string;
  transferSize: number;
  blockingTime: number;
}

/**
 * Technology mapping from Lighthouse third-party entities
 */
const TECH_MAPPING = {
  // Frameworks & Libraries
  frameworks: {
    'Next.js': ['next.js', 'nextjs'],
    'React': ['react', 'reactjs'],
    'Vue': ['vue.js', 'vuejs'],
    'Angular': ['angular', 'angularjs'],
    'jQuery': ['jquery'],
  },
  // Analytics
  analytics: {
    'Google Analytics': ['google analytics', 'google-analytics', 'googleanalytics'],
    'Google Tag Manager': ['google tag manager', 'googletagmanager'],
    'Facebook Pixel': ['facebook', 'facebook connect'],
    'Hotjar': ['hotjar'],
    'Mixpanel': ['mixpanel'],
  },
  // CDN & Hosting
  cdn: {
    'Cloudflare': ['cloudflare'],
    'Amazon CloudFront': ['amazon cloudfront', 'cloudfront'],
    'Fastly': ['fastly'],
    'KeyCDN': ['keycdn'],
  },
  hosting: {
    'Vercel': ['vercel'],
    'Netlify': ['netlify'],
    'AWS': ['amazon web services', 'amazonaws'],
  },
};

/**
 * Extract tech stack from Lighthouse audit results
 */
export function extractTechStackFromLighthouse(lighthouseResult: any): TechStack {
  const techStack: TechStack = {
    frameworks: [],
    libraries: [],
    analytics: [],
    hosting: [],
    cdn: [],
    confidence: 'medium',
  };

  // Extract from third-party summary audit
  if (lighthouseResult.audits?.['third-party-summary']) {
    const thirdParties = lighthouseResult.audits['third-party-summary'].details?.items || [];
    extractFromThirdParties(thirdParties, techStack);
  }

  // Extract from unused JavaScript audit
  if (lighthouseResult.audits?.['unused-javascript']) {
    const unusedJS = lighthouseResult.audits['unused-javascript'].details?.items || [];
    extractFromUnusedJS(unusedJS, techStack);
  }

  // Extract from network requests audit
  if (lighthouseResult.audits?.['network-requests']) {
    const networkRequests = lighthouseResult.audits['network-requests'].details?.items || [];
    extractFromNetworkRequests(networkRequests, techStack);
  }

  // Extract from final screenshot to detect hosting
  extractHostingFromURL(lighthouseResult.finalUrl, techStack);

  // Remove duplicates and determine confidence
  deduplicateAndAssessConfidence(techStack);

  return techStack;
}

/**
 * Extract technologies from third-party entities
 */
function extractFromThirdParties(thirdParties: LighthouseThirdParty[], techStack: TechStack): void {
  for (const thirdParty of thirdParties) {
    const entityName = thirdParty.entity.toLowerCase();
    
    // Check against our technology mapping
    for (const [category, techs] of Object.entries(TECH_MAPPING)) {
      for (const [techName, patterns] of Object.entries(techs)) {
        for (const pattern of patterns) {
          if (entityName.includes(pattern)) {
            const categoryKey = category as keyof Omit<TechStack, 'confidence'>;
            if (!techStack[categoryKey].includes(techName)) {
              techStack[categoryKey].push(techName);
            }
          }
        }
      }
    }
  }
}

/**
 * Extract framework info from unused JavaScript audit
 */
function extractFromUnusedJS(unusedJS: any[], techStack: TechStack): void {
  for (const item of unusedJS) {
    const url = item.url?.toLowerCase() || '';
    
    // Check for framework patterns in URLs
    if (url.includes('react') || url.includes('_next/')) {
      if (!techStack.frameworks.includes('React')) {
        techStack.frameworks.push('React');
      }
      if (url.includes('_next/') && !techStack.frameworks.includes('Next.js')) {
        techStack.frameworks.push('Next.js');
      }
    }
    
    if (url.includes('vue') && !techStack.frameworks.includes('Vue')) {
      techStack.frameworks.push('Vue');
    }
    
    if (url.includes('angular') && !techStack.frameworks.includes('Angular')) {
      techStack.frameworks.push('Angular');
    }
    
    if (url.includes('jquery') && !techStack.libraries.includes('jQuery')) {
      techStack.libraries.push('jQuery');
    }
  }
}

/**
 * Extract tech info from network requests
 */
function extractFromNetworkRequests(requests: any[], techStack: TechStack): void {
  for (const request of requests) {
    const url = request.url?.toLowerCase() || '';
    
    // Framework detection from script URLs
    if (url.includes('_next/static/') && !techStack.frameworks.includes('Next.js')) {
      techStack.frameworks.push('Next.js');
    }
    
    if (url.includes('_nuxt/') && !techStack.frameworks.includes('Nuxt.js')) {
      techStack.frameworks.push('Nuxt.js');
    }
    
    // CDN detection
    if (url.includes('cdnjs.cloudflare.com') && !techStack.cdn.includes('Cloudflare')) {
      techStack.cdn.push('Cloudflare');
    }
    
    if (url.includes('cdn.jsdelivr.net') && !techStack.cdn.includes('jsDelivr')) {
      techStack.cdn.push('jsDelivr');
    }
  }
}

/**
 * Extract hosting information from the final URL
 */
function extractHostingFromURL(finalUrl: string, techStack: TechStack): void {
  if (!finalUrl) return;
  
  try {
    const url = new URL(finalUrl);
    const hostname = url.hostname.toLowerCase();
    
    // Detect hosting platforms
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      if (!techStack.hosting.includes('Vercel')) {
        techStack.hosting.push('Vercel');
      }
    }
    
    if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
      if (!techStack.hosting.includes('Netlify')) {
        techStack.hosting.push('Netlify');
      }
    }
    
    if (hostname.includes('github.io')) {
      if (!techStack.hosting.includes('GitHub Pages')) {
        techStack.hosting.push('GitHub Pages');
      }
    }
    
    if (hostname.includes('cloudflare')) {
      if (!techStack.cdn.includes('Cloudflare')) {
        techStack.cdn.push('Cloudflare');
      }
    }
  } catch (error) {
    console.warn('Failed to parse URL for hosting detection:', error);
  }
}

/**
 * Remove duplicates and assess overall confidence
 */
function deduplicateAndAssessConfidence(techStack: TechStack): void {
  // Remove duplicates
  techStack.frameworks = [...new Set(techStack.frameworks)];
  techStack.libraries = [...new Set(techStack.libraries)];
  techStack.analytics = [...new Set(techStack.analytics)];
  techStack.hosting = [...new Set(techStack.hosting)];
  techStack.cdn = [...new Set(techStack.cdn)];
  
  // Assess confidence based on number of detections
  const totalDetections = 
    techStack.frameworks.length + 
    techStack.libraries.length + 
    techStack.analytics.length + 
    techStack.hosting.length + 
    techStack.cdn.length;
  
  if (totalDetections >= 5) {
    techStack.confidence = 'high';
  } else if (totalDetections >= 2) {
    techStack.confidence = 'medium';
  } else {
    techStack.confidence = 'low';
  }
}

/**
 * Get a human-readable summary of the detected tech stack
 */
export function getTechStackSummary(techStack: TechStack): string {
  const parts: string[] = [];
  
  if (techStack.frameworks.length > 0) {
    parts.push(`Framework: ${techStack.frameworks.join(', ')}`);
  }
  
  if (techStack.hosting.length > 0) {
    parts.push(`Hosting: ${techStack.hosting.join(', ')}`);
  }
  
  if (techStack.analytics.length > 0) {
    parts.push(`Analytics: ${techStack.analytics.join(', ')}`);
  }
  
  if (techStack.cdn.length > 0) {
    parts.push(`CDN: ${techStack.cdn.join(', ')}`);
  }
  
  if (techStack.libraries.length > 0) {
    parts.push(`Libraries: ${techStack.libraries.join(', ')}`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'No specific technologies detected';
}