import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { AnimatedTitle, Reveal } from "@/components/PremiumMotion";
import { FAQ_ITEMS } from "@/lib/faq";
import { useChatWidget } from "@/hooks/useChatWidget";
export const Route = createFileRoute("/faq")({ head: () => ({ meta: [
  { title: "FAQ TOKYOBS — Perguntas frequentes" }, { name: "description", content: "Respostas para 15 dúvidas sobre compras, Pix, entrega, conta e suporte na TOKYOBS." }, { property: "og:title", content: "FAQ TOKYOBS — Perguntas frequentes" }, { property: "og:description", content: "Tire suas dúvidas sobre compras, pagamento e atendimento." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: FaqPage });
const CATEGORIES = ["Todas", "Compras", "Pagamento", "Pedidos", "Conta e suporte"];
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function FaqPage() {
  const [category, setCategory] = useState("Todas");
  const [search, setSearch] = useState("");
  const { openSupport } = useChatWidget();
  const visible = FAQ_ITEMS.filter(item => (category === "Todas" || item.category === category) && normalize(`${item.q} ${item.a}`).includes(normalize(search)));
  return <main className="container-tk relative z-10 pt-12 sm:pt-16 pb-16"><div className="max-w-3xl mx-auto"><Reveal><p className="text-xs text-primary uppercase tracking-[0.2em] flex items-center gap-2"><span className="seal"/>Respostas para sua compra</p><AnimatedTitle text="Perguntas frequentes" className="text-3xl sm:text-4xl mt-4 leading-tight"/><p className="text-muted-foreground mt-4">Tudo começa com uma boa resposta.</p><label className="flex items-center gap-3 mt-8 border border-input rounded-lg bg-card px-4"><Search className="h-5 w-5 text-muted-foreground"/><input value={search} onChange={e => setSearch(e.target.value)} aria-label="Buscar perguntas" placeholder="Busque uma dúvida…" className="h-12 min-w-0 flex-1 bg-transparent outline-none text-sm"/></label></Reveal>
    <div role="group" aria-label="Assuntos das perguntas" className="flex flex-wrap gap-2 mt-5 mb-6">{CATEGORIES.map(c => <Button size="sm" key={c} variant={c === category ? "default" : "secondary"} aria-pressed={c === category} onClick={() => setCategory(c)}>{c}</Button>)}</div>
    <p className="text-xs text-muted-foreground mb-4" aria-live="polite">{visible.length} {visible.length === 1 ? "pergunta" : "perguntas"}</p>
    {visible.length ? <Accordion type="single" collapsible>{visible.map(item => <AccordionItem key={item.q} value={item.q}><AccordionTrigger className="text-left text-sm sm:text-base py-5">{item.q}</AccordionTrigger><AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent></AccordionItem>)}</Accordion> : <div className="py-12 text-center"><p className="text-muted-foreground">Nenhuma pergunta encontrada.</p><Button variant="link" onClick={() => {setSearch(""); setCategory("Todas");}}>Limpar busca</Button></div>}
    <Reveal className="mt-12 border-t border-border pt-8 flex flex-wrap items-center justify-between gap-5"><div><h2 className="text-lg">Ainda precisa de ajuda?</h2><p className="text-sm text-muted-foreground mt-2">Fale com a equipe TOKYOBS.</p></div><Button className="rounded-full h-11" onClick={openSupport}><MessageCircle/>Falar com o suporte</Button></Reveal>
  </div></main>;
}
