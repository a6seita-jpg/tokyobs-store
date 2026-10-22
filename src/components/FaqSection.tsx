import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { FAQ_ITEMS } from "@/lib/faq";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/PremiumMotion";

const FAQ = FAQ_ITEMS.slice(0, 5);

export function FaqSection() {
  return (
    <section className="container-tk py-16 border-t border-border">
      <Reveal className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            <span className="seal" /> FAQ
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extralight">Dúvidas Frequentes</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="text-center mt-6"><Button asChild variant="link"><Link to="/faq">Todas as perguntas frequentes</Link></Button></div>
      </Reveal>
    </section>
  );
}
