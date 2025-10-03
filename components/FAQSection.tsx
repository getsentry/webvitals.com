import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Heading from "@/components/ui/heading";
import { faqs } from "@/lib/faqs";
import { Card, CardContent } from "./ui/card";

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
