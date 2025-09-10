# Performance Scoring: Lighthouse vs Sentry Comparison

This document outlines the key differences between Lighthouse/PageSpeed Insights performance scoring and Sentry's Web Vitals scoring system for future feature development.

## Lighthouse Performance Score (Lab Data)

**Used by:** Google PageSpeed Insights API, Lighthouse CI, Chrome DevTools

### Metrics & Weights
- **FCP (First Contentful Paint)**: 10%
- **SI (Speed Index)**: 10% 
- **LCP (Largest Contentful Paint)**: 25%
- **TBT (Total Blocking Time)**: 30%
- **CLS (Cumulative Layout Shift)**: 25%

### Thresholds
All thresholds are the same for desktop and mobile:
- **FCP**: Good ≤1.8s, Poor >3s
- **SI**: Good ≤3.4s, Poor >5.8s  
- **LCP**: Good ≤2.5s, Poor >4s
- **TBT**: Good ≤200ms, Poor >600ms
- **CLS**: Good ≤0.1, Poor >0.25

### Data Source
- **Lab Data**: Controlled testing environment
- **Single page load**: Synthetic test in controlled conditions
- **Predictable**: Same conditions every time
- **Limited**: Doesn't reflect real user experience

---

## Sentry Performance Score (Real User Data)

**Used by:** Sentry Web Vitals monitoring, real user monitoring (RUM)

### Metrics & Weights
- **LCP (Largest Contentful Paint)**: 30%
- **FCP (First Contentful Paint)**: 15%
- **INP (Interaction to Next Paint)**: 30%
- **CLS (Cumulative Layout Shift)**: 15% 
- **TTFB (Time to First Byte)**: 10%

### Thresholds (Desktop vs Mobile)

**Desktop:**
- **LCP**: Good ≤1.2s, Poor >2.4s
- **FCP**: Good ≤900ms, Poor >1.6s
- **INP**: Good ≤200ms, Poor >500ms
- **CLS**: Good ≤0.1, Poor >0.25
- **TTFB**: Good ≤200ms, Poor >400ms

**Mobile:**
- **LCP**: Good ≤2.5s, Poor >4s
- **FCP**: Good ≤1.8s, Poor >3s
- **INP**: Good ≤200ms, Poor >500ms
- **CLS**: Good ≤0.1, Poor >0.25
- **TTFB**: Good ≤800ms, Poor >1.8s

### Data Source  
- **Field Data**: Real user experiences from Chrome UX Report (CrUX)
- **28-day collection**: Rolling window of actual user sessions
- **Realistic**: Reflects actual user conditions (network, device, etc.)
- **Comprehensive**: Includes user interactions (INP)

---

## Real-User Experience Data (CrUX)

**Available in PageSpeed Insights API** for comparison with Sentry:

### Metrics Available
- **FCP (First Contentful Paint)**: Good ≤1.8s, Poor >3s
- **LCP (Largest Contentful Paint)**: Good ≤2.5s, Poor >4s
- **INP (Interaction to Next Paint)**: Good ≤200ms, Poor >500ms
- **CLS (Cumulative Layout Shift)**: Good ≤0.1, Poor >0.25
- **TTFB (Time to First Byte)**: Good ≤800ms, Poor >1.8s (experimental)

### Data Availability
- **Page-level**: Specific URL data (if sufficient traffic)
- **Origin-level**: Domain-wide aggregation (fallback)
- **75th percentile**: Represents experience for most users
- **28-day window**: Rolling collection period

---

## Key Differences for Feature Development

### 1. **Metric Composition**
- **Lighthouse**: Uses TBT & SI (synthetic lab metrics)
- **Sentry**: Uses INP & TTFB (real user interaction metrics)

### 2. **Interactivity Measurement**
- **Lighthouse TBT**: Measures main thread blocking during page load
- **Sentry INP**: Measures actual user interaction responsiveness

### 3. **Performance Thresholds**
- **Lighthouse**: Same thresholds for desktop/mobile
- **Sentry**: Stricter thresholds for desktop, more lenient for mobile

### 4. **Data Sources**
- **Lighthouse**: Controlled lab environment, predictable
- **Sentry**: Real user conditions, variable network/device performance

### 5. **Use Cases**
- **Lighthouse**: Development/testing, CI/CD, baseline performance
- **Sentry**: Production monitoring, real user impact, business metrics

---

## Implementation Strategy

### Current Tool Implementation
- **Primary**: Lighthouse Performance Score Ring (matches PageSpeed API exactly)
- **Secondary**: Real-User Metrics cards (CrUX data display)
- **Future**: Sentry-style performance ring for comparative analysis

### Future Features
1. **Comparative Analysis**: Show both Lighthouse vs Sentry scores side-by-side
2. **Trend Analysis**: Track how lab scores correlate with real user experience  
3. **Threshold Explanations**: Help users understand why scores differ
4. **Actionable Insights**: Prioritize fixes based on real user impact vs lab performance

### Technical Notes
- CrUX data may not be available for low-traffic sites
- INP requires user interaction, not available in lab testing
- TTFB in CrUX represents server response time experienced by real users
- Sentry weights interactivity (INP) much higher than Lighthouse (TBT)