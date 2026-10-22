import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones, ShoppingBag, CreditCard, Package, UserRound, Gamepad2, MessageCircle, ArrowUpRight, ChevronRight } from "lucide-react";
import { useChatWidget } from "@/hooks/useChatWidget";
import { Button } from "@/components/ui/button";
import { AnimatedTitle, Reveal } from "@/components/PremiumMotion";
export const Route = createFileRoute("/suporte")({ head: () => ({ meta: [
  { title: "Suporte TOKYOBS — Central de atendimento" }, { name: "description", content: "Ajuda com compras, Pix, pedidos, contas e produtos. Fale com o atendimento humano da TOKYOBS." },
  { property: "og:title", content: "Suporte TOKYOBS — Central de atendimento" }, { property: "og:description", content: "Converse com a equipe sobre compras, pagamentos e produtos." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: SuportePage });
const TOPICS = [
  { icon: ShoppingBag, title: "Ajuda para comprar", text: "Escolha de produtos, variações e dúvidas sobre o carrinho." },
  { icon: CreditCard, title: "Pagamentos e Pix", text: "QR Code, copia-e-cola, comprovantes e pagamento em análise." },
  { icon: Package, title: "Pedidos e entrega", text: "Orientações sobre o pedido, recebimento e acompanhamento." },
  { icon: UserRound, title: "Minha conta", text: "Acesso, cadastro e informações do seu perfil." },
  { icon: Gamepad2, title: "Produtos e compatibilidade", text: "Disponibilidade, plataformas e requisitos de cada opção." },
  { icon: MessageCircle, title: "Outras dúvidas", text: "Problemas com a compra, sugestões e atendimento geral." },
];
function SuportePage() {
  const { openSupport } = useChatWidget();
  return <main className="container-tk pt-12 sm:pt-16 pb-16 relative z-10"><Reveal className="max-w-2xl"><p className="flex items-center gap-2 text-xs text-primary uppercase tracking-[0.2em]"><span className="seal"/>Central de atendimento</p><AnimatedTitle text="Suporte TOKYOBS" className="mt-4 text-4xl sm:text-5xl"/><p className="mt-5 text-muted-foreground leading-relaxed">Sua próxima compra merece atenção. Sobre o que você precisa falar?</p></Reveal>
    <section aria-label="Assuntos de suporte" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">{TOPICS.map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={i * 0.05}><Button variant="ghost" onClick={openSupport} className="premium-card w-full h-full min-h-[200px] p-6 border border-border bg-card rounded-lg flex flex-col items-start text-left whitespace-normal hover:bg-card hover:text-foreground"><span className="flex w-full justify-between items-center mb-5"><Icon className="h-6 w-6 text-primary"/><ArrowUpRight className="text-muted-foreground"/></span><h2 className="text-base">{title}</h2><p className="text-sm text-muted-foreground mt-2 leading-relaxed font-normal">{text}</p></Button></Reveal>)}</section>
    <Reveal className="border-y border-border mt-12 py-9 grid md:grid-cols-[1fr_auto] items-center gap-6"><div className="flex gap-4 items-start"><Headphones className="h-8 w-8 text-primary shrink-0"/><div><h2 className="text-xl">Uma conversa com nossa equipe</h2><p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">Para uma compra já realizada, abra o chat do pedido no checkout. Assim, as orientações ficam junto das informações da sua compra.</p></div></div><Button onClick={openSupport} className="rounded-full h-11"><MessageCircle/>Abrir chat de suporte</Button></Reveal>
    <section className="grid sm:grid-cols-2 gap-8 mt-10"><Reveal><h2 className="text-lg mb-3">Antes de enviar uma mensagem</h2><p className="text-sm text-muted-foreground leading-relaxed">Tenha o número do pedido e o nome do produto em mãos. Não envie senhas ou dados bancários sensíveis. O atendimento é humano; aguarde a resposta na conversa.</p></Reveal><Reveal delay={0.1}><h2 className="text-lg mb-3">Respostas rápidas</h2><p className="text-sm text-muted-foreground mb-4">Confira as dúvidas mais comuns sobre compras, Pix e pedidos.</p><Button asChild variant="link" className="p-0"><Link to="/faq">Ver perguntas frequentes<ChevronRight/></Link></Button></Reveal></section>
  </main>;
}
