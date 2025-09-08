# PageSpeed Insights Tool

The PageSpeed Insights tool provides comprehensive performance analysis of web pages using Google's PageSpeed Insights API. It measures Core Web Vitals and other performance metrics both from lab data (Lighthouse) and real user data (CrUX).

## Tool Available

### `pageSpeedInsightsTool` (analyzePageSpeed)
Analyzes web page performance and provides detailed performance metrics and recommendations.

## Features

### Core Web Vitals Analysis
- **Largest Contentful Paint (LCP)** - Loading performance metric
- **First Input Delay (FID)** - Interactivity metric  
- **Cumulative Layout Shift (CLS)** - Visual stability metric
- **First Contentful Paint (FCP)** - Initial loading metric
- **Total Blocking Time (TBT)** - Interactivity metric
- **Speed Index** - Perceived loading speed

### Performance Categories
- **Performance** - Overall performance score (0-100)
- **Accessibility** - Accessibility compliance score
- **Best Practices** - Web development best practices
- **SEO** - Search engine optimization score
- **PWA** - Progressive Web App features (optional)

### Data Sources
- **Field Data (CrUX)** - Real user metrics from Chrome User Experience Report
- **Origin Data** - Site-wide performance data
- **Lab Data (Lighthouse)** - Synthetic testing data with detailed metrics

### Device Analysis
- **Mobile** - Mobile device performance analysis
- **Desktop** - Desktop device performance analysis

## Input Parameters

```typescript
{
  url: string;                           // URL to analyze (required)
  strategy: "mobile" | "desktop";       // Device type (default: "desktop")
  categories: PageSpeedCategory[];       // Analysis categories
}
```

### Available Categories
- `"performance"` - Core Web Vitals and performance metrics
- `"accessibility"` - Accessibility compliance
- `"best-practices"` - Web development best practices  
- `"seo"` - SEO optimization
- `"pwa"` - Progressive Web App features

## Output Structure

```typescript
{
  url: string;                          // Analyzed URL
  strategy: "mobile" | "desktop";      // Device strategy used
  timestamp: string;                    // Analysis timestamp
  captchaResult: string;               // API captcha result
  version: string;                     // PageSpeed Insights API version
  
  fieldData: {                         // Real user data (CrUX)
    overallCategory: "FAST" | "AVERAGE" | "SLOW";
    metrics: {
      [metricName: string]: {
        percentile: number;             // 75th percentile value
        category: "FAST" | "AVERAGE" | "SLOW";
        distributions: Array<{
          min: number;                  // Range minimum
          max?: number;                 // Range maximum
          proportion: number;           // Percentage of users
        }>;
      }
    };
    id: string;                        // Page identifier
  } | null;
  
  originData: {                        // Site-wide performance data
    overallCategory: "FAST" | "AVERAGE" | "SLOW";
    metrics: {                         // Same structure as fieldData
      [metricName: string]: CoreWebVitalMetric;
    };
    id: string;                        // Origin identifier
  } | null;
  
  labData: {                          // Lighthouse synthetic data
    scores: {
      performance: number;             // 0-100 performance score
      accessibility: number;          // 0-100 accessibility score
      "best-practices": number;        // 0-100 best practices score
      seo: number;                     // 0-100 SEO score
      pwa: number;                     // 0-100 PWA score
    };
    metrics: {
      "first-contentful-paint": number;      // FCP in milliseconds
      "largest-contentful-paint": number;    // LCP in milliseconds
      "cumulative-layout-shift": number;     // CLS score
      "total-blocking-time": number;         // TBT in milliseconds
      "speed-index": number;                 // Speed Index
      interactive: number;                   // Time to Interactive
    };
    opportunities: Array<{
      title: string;                   // Improvement opportunity title
      description: string;             // Detailed description
      score: number;                   // Impact score
      displayValue?: string;           // Formatted value
    }>;
  } | null;
}
```

## Core Web Vitals Thresholds

### Largest Contentful Paint (LCP)
- **Good**: ≤ 2.5 seconds
- **Needs Improvement**: 2.5 - 4.0 seconds  
- **Poor**: > 4.0 seconds

### First Input Delay (FID)
- **Good**: ≤ 100 milliseconds
- **Needs Improvement**: 100 - 300 milliseconds
- **Poor**: > 300 milliseconds

### Cumulative Layout Shift (CLS)
- **Good**: ≤ 0.1
- **Needs Improvement**: 0.1 - 0.25
- **Poor**: > 0.25

## Performance Metrics Explanation

### Lab Data Metrics
- **First Contentful Paint (FCP)** - Time when first content appears
- **Largest Contentful Paint (LCP)** - Time when largest content element loads
- **Speed Index** - How quickly content visually populates
- **Total Blocking Time (TBT)** - Time between FCP and Time to Interactive
- **Cumulative Layout Shift (CLS)** - Visual stability of page loading
- **Time to Interactive (TTI)** - When page becomes fully interactive

### Field Data Categories
- **FAST** - Good user experience (green)
- **AVERAGE** - Moderate user experience (amber/orange)
- **SLOW** - Poor user experience (red)

## Data Availability

### Field Data (CrUX)
- Available for URLs with sufficient traffic
- Based on real Chrome users over 28-day period
- May be null for new or low-traffic sites

### Origin Data
- Site-wide performance across all pages
- Aggregated from same origin
- May be null for new sites

### Lab Data (Lighthouse)
- Always available for any accessible URL
- Synthetic testing in controlled environment
- Provides actionable recommendations

## Use Cases

### Performance Monitoring
- Track Core Web Vitals over time
- Compare mobile vs desktop performance
- Monitor impact of site changes

### SEO Optimization  
- Ensure good Core Web Vitals for search ranking
- Identify accessibility issues
- Check SEO best practices

### User Experience Analysis
- Understand real user performance
- Identify bottlenecks and optimization opportunities
- Validate performance improvements

### Competitive Analysis
- Compare performance against competitors
- Benchmark industry performance
- Identify areas for improvement

## Best Practices

### URL Testing
- Test both mobile and desktop versions
- Include query parameters if they affect performance
- Test different page types (homepage, product pages, etc.)

### Interpretation
- Focus on field data for real user impact
- Use lab data for debugging and optimization
- Consider both individual metrics and overall scores

### Optimization Priorities
1. **Core Web Vitals** - Highest priority for user experience and SEO
2. **Performance Score** - Overall site speed
3. **Accessibility** - User inclusivity
4. **Best Practices** - Technical optimization
5. **SEO** - Search engine optimization

## Rate Limits

- Google PageSpeed Insights API has rate limiting
- Tool includes proper error handling for rate limits
- Automatic retry logic with exponential backoff

## Error Handling

The tool handles various scenarios:
- **Invalid URLs** - Clear error messages
- **Network Issues** - Retry logic
- **API Errors** - Graceful degradation
- **Missing Data** - Null handling for unavailable metrics