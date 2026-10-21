import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, CreditCard, Zap } from "lucide-react";
import { triggerRipple } from "@/lib/ripple";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona — TOKYOBS" },
      { name: "description", content: "Em 3 passos: busque, consulte e receba seu produto em até 15 minutos." },
      { property: "og:title", content: "Como funciona — TOKYOBS" },
      { property: "og:description", content: "Busque, pague com Pix e receba em 15min." },
    ],
  }),
  component: ComoFuncionaPage,
});

const STEPS = [
  {
    icon: Search,
    title: "Passo 1 — Busca",
    text: "Digite o que você procura na barra de busca",
  },
  {
    icon: CreditCard,
    title: "Passo 2 — Pagamento",
    text: "Pague com Pix direto no site, com QR Code",
  },
  {
    icon: Zap,
    title: "Passo 3 — Recebe",
    text: "Receba seu produto em até 15min. Suporte 24h",
  },
];

function ComoFuncionaPage() {
  return (
    <main className="container-tk pt-28 pb-20 ink-wash-enter">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          <span className="seal" /> Guia
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extralight">Como funciona</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Simples, rápido e humano. Veja como comprar na TOKYOBS.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {STEPS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-lg border border-border bg-card p-8 flex flex-col items-center text-center gap-4"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 grid place-items-center text-primary">
              <Icon className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-light">{title}</h2>
            <p className="text-muted-foreground text-sm">{text}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/"
          onClick={triggerRipple}
          className="ripple-host inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          Começar agora
        </Link>
      </div>
    </main>
  );
}
