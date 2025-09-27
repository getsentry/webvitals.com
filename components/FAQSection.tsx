import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Heading from "@/components/ui/heading";
import { Card, CardContent } from "./ui/card";

const faqs = [
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
          href="https://docs.sentry.io/product/insights/frontend/web-vitals/"
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
    question: "What's the difference between lab and field data?",
    answer:
      "Lab data comes from controlled testing environments using tools like Lighthouse, while field data comes from real users visiting your site through the Chrome User Experience Report. Our tool uses field data to show you real-world performance, which is more representative of your users' actual experiences.",
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
          href="https://docs.sentry.io/product/insights/frontend/web-vitals/"
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
    question: "What's on the roadmap for WebVitals?",
    answer:
      "We're actively developing several exciting features: In-depth Lighthouse analysis with actionable recommendations, historical data tracking to monitor performance trends over time, unique shareable URLs for easy collaboration, user accounts to persist and track results across sessions, competitive benchmarking against similar sites, performance budgets with automated alerts, CI/CD integration for continuous monitoring, multi-page site analysis, custom performance thresholds, API access for automation, exportable PDF reports, team collaboration features, and integrations with popular tools like GitHub and Slack. Follow our progress and request features through our feedback channels!",
  },
];

export default function FAQSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Heading level={2} className="mb-4">
            Frequently Asked Questions
          </Heading>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Web Vitals and our analysis tool.
          </p>
        </div>
        <Card className="py-2">
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-card-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
