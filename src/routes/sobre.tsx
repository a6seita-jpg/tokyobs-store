import { createFileRoute } from "@tanstack/react-router";
import { Package, Headphones, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a TOKYOBS" },
      { name: "description", content: "Loja de variedades focada em encontrar exatamente o que o cliente procura. Transparência, suporte 24h e garantia TOKYOBS." },
      { property: "og:title", content: "Sobre a TOKYOBS" },
      { property: "og:description", content: "Atendimento humano, catálogo atualizado e garantia em todas as vendas." },
    ],
  }),
  component: AboutPage,
});

const FEATURES = [
  { icon: Package, title: "Variedade de Produtos", desc: "Físicos, digitais, gamer, streaming — buscamos pra você." },
  { icon: Headphones, title: "24h Suporte", desc: "Atendimento humano pelo site, sempre disponível." },
  { icon: ShieldCheck, title: "100% Confiável", desc: "Transparência e garantia TOKYOBS em todas as vendas." },
];

function AboutPage() {
  return (
    <main className="container-tk pt-28 pb-12 ink-wash-enter">
      <header className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          <span className="seal" /> Sobre nós
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extralight">Sobre a TOKYOBS</h1>
      </header>

      <article className="max-w-2xl mx-auto space-y-6 text-base sm:text-lg leading-relaxed text-foreground/90">
        <p>
          A <strong>TOKYOBS</strong> é uma loja de variedades com foco em encontrar
          exatamente o que o cliente procura.
        </p>
        <p>
          Somos confiáveis e prezamos pelo compromisso. Cada cliente é tratado com transparência
          e respeito. Trabalhamos com diversos produtos digitais e físicos, entrega rápida e
          suporte 24h pelo site.
        </p>
        <p>
          Nossa missão é simplificar sua busca. Se você precisa de algo específico, fale conosco.
          Catálogo atualizado, atendimento humano e garantia TOKYOBS em todas as vendas.
        </p>
      </article>

      <section className="mt-16 grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border border-border bg-card p-6 text-center">
            <div className="mx-auto h-12 w-12 grid place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-light">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
