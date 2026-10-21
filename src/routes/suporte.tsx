import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones, ShoppingCart, Clock } from "lucide-react";

export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Suporte" },
      { name: "description", content: "Fale com o suporte TOKYOBS. Atendimento humano 24h pelo site." },
      { property: "og:title", content: "TOKYOBS — Suporte" },
      { property: "og:description", content: "Atendimento humano 24h pelo site." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SuportePage,
});

function SuportePage() {
  return (
    <main className="container-tk pt-28 pb-20 ink-wash-enter relative z-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          <span className="seal" /> Atendimento
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extralight">Suporte</h1>
      </div>

      <div className="max-w-md mx-auto rounded-lg border border-border bg-card p-8 text-center space-y-5 fade-up">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 grid place-items-center text-primary">
          <Headphones className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-light">Chat de atendimento a caminho</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Estamos trazendo o atendimento direto para dentro do site.
          Enquanto isso, você pode montar seu pedido no carrinho e pagar com Pix —
          nossa equipe acompanha cada pedido.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Atendimento humano 24h
        </div>
        <Link
          to="/carrinho"
          className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          <ShoppingCart className="h-4 w-4" />
          Ir para o carrinho
        </Link>
      </div>
    </main>
  );
}
