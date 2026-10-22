import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Package, Headphones, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedTitle, Reveal } from "@/components/PremiumMotion";
import banner from "@/assets/hero/promo-ps4.jpg";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [
    { title: "Sobre a TOKYOBS — Nossa essência" },
    { name: "description", content: "Conheça a TOKYOBS, sua loja de jogos, assinaturas e produtos digitais com atendimento humano." },
    { property: "og:title", content: "Sobre a TOKYOBS — Nossa essência" },
    { property: "og:description", content: "Variedade, transparência e atendimento humano em cada compra." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: AboutPage,
});
const JOURNEY = [
  { n: "01", title: "Uma busca, muitas possibilidades", text: "A TOKYOBS nasce da ideia de reunir o que você procura em um só lugar. Uma loja de variedades com atenção às necessidades de cada cliente." },
  { n: "02", title: "Um catálogo para o seu dia a dia", text: "Jogos para PC e PS4, assinaturas e serviços para redes sociais. Opções organizadas por categoria, com variações e preços para comparar antes de escolher." },
  { n: "03", title: "Atendimento que acompanha", text: "Das dúvidas antes da compra às orientações sobre o pedido, nossa equipe atende pelo site. Cada pedido pode ter sua própria conversa." },
  { n: "04", title: "O próximo capítulo", text: "Continuamos aprimorando a experiência de compra e ouvindo quem escolhe a TOKYOBS. Sua dúvida ou sugestão faz parte dessa jornada." },
];
function AboutPage() {
  return <main className="relative z-10 pb-16">
    <section className="relative overflow-hidden min-h-[370px] sm:min-h-[420px] flex items-center">
      <img src={banner} alt="Universo de jogos PlayStation na TOKYOBS" className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0 cover-shade"/>
      <div className="container-tk relative w-full py-16 text-washi"><p className="text-xs uppercase tracking-[0.25em] mb-5 flex items-center gap-2"><span className="seal"/>Nossa essência</p><AnimatedTitle text="Sobre a TOKYOBS" className="text-4xl sm:text-5xl max-w-xl leading-tight"/><p className="mt-5 max-w-lg text-sm sm:text-base leading-relaxed text-washi/80">O que você procura, a gente tem. Jogos, entretenimento e novas possibilidades, com atenção em cada escolha.</p></div>
    </section>
    <section className="container-tk pt-12 sm:pt-16"><Reveal className="grid md:grid-cols-[1fr_1.3fr] gap-6 md:gap-16 pb-12 border-b border-border"><div><p className="text-xs text-primary uppercase tracking-[0.2em]">Além do catálogo</p><h2 className="text-2xl sm:text-3xl mt-3">Uma loja.<br/>Muitas conexões.</h2></div><div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed"><p>Somos uma loja de variedades com foco em encontrar exatamente o que o cliente procura. Acreditamos em compras com informações claras e atendimento com respeito.</p><p>Na TOKYOBS, você encontra Assinaturas, Steam, Epic Games, Redes Sociais e PS4. Quando precisar de uma orientação específica, nossa equipe está a uma conversa de distância.</p></div></Reveal></section>
    <section className="container-tk py-14"><Reveal><p className="text-xs text-primary uppercase tracking-[0.2em]">Nossa jornada</p><h2 className="text-2xl sm:text-3xl mt-3 mb-10">De uma ideia à sua próxima compra</h2></Reveal><div className="max-w-3xl ml-2 border-l border-border">{JOURNEY.map((item, i) => <Reveal key={item.n} delay={i * 0.06} className="relative pl-8 sm:pl-12 pb-10 last:pb-0"><span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-primary"/><p className="text-xs font-mono text-primary mb-2">{item.n}</p><h3 className="text-lg sm:text-xl">{item.title}</h3><p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.text}</p></Reveal>)}</div></section>
    <section className="border-y border-border"><div className="container-tk grid sm:grid-cols-3 gap-8 py-10">{[{ icon: Package, title: "Variedade", text: "Categorias para jogar, assistir e se conectar." }, { icon: ShieldCheck, title: "Transparência", text: "Descrições, opções e valores antes de finalizar." }, { icon: Headphones, title: "Atendimento humano", text: "Uma equipe para conversar sobre sua compra." }].map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={i * 0.08}><Icon className="text-primary h-6 w-6 mb-4"/><h3 className="text-base">{title}</h3><p className="text-sm text-muted-foreground mt-2">{text}</p></Reveal>)}</div></section>
    <Reveal className="container-tk pt-12 flex flex-wrap justify-between items-center gap-5"><h2 className="text-xl sm:text-2xl">Vamos encontrar o que você procura?</h2><Button asChild className="rounded-full h-11"><Link to="/suporte">Fale com a TOKYOBS<ArrowUpRight/></Link></Button></Reveal>
  </main>;
}
