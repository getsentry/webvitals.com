export const faqs = [
  {
    question: "Do Web Vitals still matter in the AI era?",
    answer:
      "More than ever. AI-generated code often creates performance-heavy applications with excessive JavaScript, unoptimized assets, and inefficient patterns. Fast sites convert better and rank higher regardless of how they're built. We're developing an MCP integration to bring real performance data directly into AI coding assistants like Claude and Cursor.",
  },
  {
    question: "What are Core Web Vitals?",
    answer:
      "Core Web Vitals are a set of specific factors that Google considers important in a webpage's overall user experience. They include Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and First Input Delay (FID). We also track additional metrics like First Contentful Paint (FCP) and Time to First Byte (TTFB) for comprehensive performance insights.",
  },
  {
    question: "How accurate is this analysis?",
    answer:
      "Our analysis uses real field data from Chrome User Experience Report (CrUX), which represents actual user experiences on your site. This field data provides a more accurate picture of real-world performance than synthetic lab tests, as it reflects the conditions your users actually experience.",
  },
  {
    question: "Why should I care about Web Vitals?",
    answer:
      "Web Vitals directly impact your site's search engine rankings, user experience, and conversion rates. Sites with better Web Vitals scores typically see higher engagement and better business outcomes.",
  },
  {
    question: "Can I analyze password-protected or internal sites?",
    answer: (
      <>
        Currently, our tool can only analyze publicly accessible websites since
        we rely on Chrome User Experience Report data. For internal or
        password-protected sites, we recommend using{" "}
        <a
          href="https://docs.sentry.io/product/insights/frontend/web-vitals/?ref=webvitals.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sentry's Web Vitals monitoring
        </a>
        , which can track Web Vitals and other performance metrics from within
        your application.
      </>
    ),
  },
  {
    question: "How often should I check my Web Vitals?",
    answer:
      "We recommend checking your Web Vitals regularly, especially after making significant changes to your site. Monthly checks are good for most sites, while high-traffic sites might benefit from weekly monitoring.",
  },
  {
    question:
      "How do Web Vitals work with Progressive Web Apps (PWAs) and Single Page Applications (SPAs)?",
    answer: (
      <>
        Current Core Web Vitals metrics only capture initial page loads, not SPA
        route transitions. This means client-side navigation performance isn't
        reflected in CrUX data or traditional Web Vitals measurements. Chrome is
        experimenting with a Soft Navigations API that defines navigation by
        three heuristics: user action, URL change, and DOM change. This
        experimental feature (available in Chrome 139+ via origin trial) aims to
        measure LCP, CLS, and INP for individual route changes. Until this
        becomes standard, the best approach for PWAs is implementing real user
        monitoring with tools like{" "}
        <a
          href="https://docs.sentry.io/product/insights/frontend/web-vitals/?ref=webvitals.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sentry's Web Vitals monitoring
        </a>
        , which can track performance across all navigation types and provide
        comprehensive insights into your app's actual user experience.
      </>
    ),
  },
  {
    question: "My site has good lab scores but bad field data - why?",
    answer: (
      <>
        Lab data from tools like Lighthouse uses simulated conditions, while
        field data from Chrome User Experience Report reflects real users with
        varying devices, networks, and browsers. Field data is more
        representative of actual user experience and what matters for SEO
        rankings. Learn more about{" "}
        <a
          href="https://blog.sentry.io/how-to-hack-your-google-lighthouse-scores-in-2024/?ref=webvitals.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          the difference between lab and field data
        </a>
        .
      </>
    ),
  },
  {
    question: "Can backend issues cause poor Web Vitals scores?",
    answer: (
      <>
        Absolutely. Poor database queries, excessive middleware, or slow
        server-side processing can significantly impact Time to First Byte
        (TTFB) and Largest Contentful Paint (LCP). Use application performance
        monitoring tools to trace performance issues through your entire stack.
        Read more about{" "}
        <a
          href="https://blog.sentry.io/your-bad-lcp-score-might-be-a-backend-issue/?ref=webvitals.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          how backend issues affect LCP
        </a>{" "}
        and{" "}
        <a
          href="https://blog.sentry.io/how-i-fixed-my-brutal-ttfb/?ref=webvitals.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          fixing TTFB problems
        </a>
        .
      </>
    ),
  },
  {
    question: "How do images affect Web Vitals beyond just load time?",
    answer: (
      <>
        Images impact multiple Core Web Vitals: oversized images hurt LCP,
        missing width/height attributes cause CLS, and even background images
        can contribute to layout shift. Use modern formats (WebP/AVIF), proper
        sizing, and lazy loading for below-the-fold content. Learn about{" "}
        <a
          href="https://blog.sentry.io/from-lcp-to-cls-improve-your-core-web-vitals-with-image-loading-best/?ref=webvitals.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          image loading best practices
        </a>
        ,{" "}
        <a
          href="https://blog.sentry.io/your-background-images-might-be-causing-cls/?ref=webvitals.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          how background images cause CLS
        </a>
        , and{" "}
        <a
          href="https://blog.sentry.io/low-effort-image-optimization-tips/?ref=webvitals.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          low-effort optimization tips
        </a>
        .
      </>
    ),
  },
  {
    question: "What's on the roadmap for WebVitals?",
    answer:
      "We're actively developing several exciting features: In-depth Lighthouse analysis with actionable recommendations, historical data tracking to monitor performance trends over time, unique shareable URLs for easy collaboration, user accounts to persist and track results across sessions, competitive benchmarking against similar sites, performance budgets with automated alerts, CI/CD integration for continuous monitoring, multi-page site analysis, custom performance thresholds, API access for automation, exportable PDF reports, team collaboration features, and integrations with popular tools like GitHub and Slack. Follow our progress and request features through our feedback channels!",
  },
];

export function getFaqSchemaText(faq: (typeof faqs)[0]): string {
  if (typeof faq.answer === "string") {
    return faq.answer;
  }

  // Handle specific JSX cases
  if (faq.question.includes("password-protected")) {
    return "Currently, our tool can only analyze publicly accessible websites since we rely on Chrome User Experience Report data. For internal or password-protected sites, we recommend using Sentry's Web Vitals monitoring, which can track Web Vitals and other performance metrics from within your application.";
  }

  if (faq.question.includes("Progressive Web Apps")) {
    return "Current Core Web Vitals metrics only capture initial page loads, not SPA route transitions. This means client-side navigation performance isn't reflected in CrUX data or traditional Web Vitals measurements. Chrome is experimenting with a Soft Navigations API that defines navigation by three heuristics: user action, URL change, and DOM change. This experimental feature (available in Chrome 139+ via origin trial) aims to measure LCP, CLS, and INP for individual route changes. Until this becomes standard, the best approach for PWAs is implementing real user monitoring with tools like Sentry's Web Vitals monitoring, which can track performance across all navigation types and provide comprehensive insights into your app's actual user experience.";
  }

  if (faq.question.includes("lab scores but bad field data")) {
    return "Lab data from tools like Lighthouse uses simulated conditions, while field data from Chrome User Experience Report reflects real users with varying devices, networks, and browsers. Field data is more representative of actual user experience and what matters for SEO rankings.";
  }

  if (faq.question.includes("backend issues cause poor Web Vitals")) {
    return "Absolutely. Poor database queries, excessive middleware, or slow server-side processing can significantly impact Time to First Byte (TTFB) and Largest Contentful Paint (LCP). Use application performance monitoring tools to trace performance issues through your entire stack.";
  }

  if (faq.question.includes("images affect Web Vitals beyond")) {
    return "Images impact multiple Core Web Vitals: oversized images hurt LCP, missing width/height attributes cause CLS, and even background images can contribute to layout shift. Use modern formats (WebP/AVIF), proper sizing, and lazy loading for below-the-fold content.";
  }

  return "";
}
