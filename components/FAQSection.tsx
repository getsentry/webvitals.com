import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
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
    answer:
      "Currently, our tool can only analyze publicly accessible websites since we rely on Chrome User Experience Report data. For internal or password-protected sites, we recommend using Sentry's performance monitoring, which can track Web Vitals and other performance metrics from within your application.",
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
];

export default function FAQSection() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Web Vitals and our analysis tool.
          </p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
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
        </div>
      </div>
    </section>
  );
}