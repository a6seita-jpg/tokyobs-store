import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Como funciona a entrega?",
    a: "Entrega via conta compartilhada ou ativação. Você recebe login/senha em até 15min após confirmação.",
  },
  {
    q: "Quais formas de pagamento?",
    a: "PIX, Cartão, Boleto. Enviamos QR Code no WhatsApp.",
  },
  {
    q: "Os jogos são originais?",
    a: "Sim, 100% mídia digital original. Garantia TOKYOBS.",
  },
  {
    q: "Funciona no meu console?",
    a: "Confirmamos compatibilidade no Whats antes da venda.",
  },
  {
    q: "Posso parcelar?",
    a: "Consulte no Whats, temos opções de parcelamento.",
  },
];

export function FaqSection() {
  return (
    <section className="container-tk py-16 border-t border-border">
      <div className="max-w-2xl mx-auto">
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
      </div>
    </section>
  );
}
