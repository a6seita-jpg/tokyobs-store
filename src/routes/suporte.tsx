import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones, ShoppingCart, Clock, MessageCircle } from "lucide-react";
import { useChatWidget } from "@/hooks/useChatWidget";

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
  const { openSupport } = useChatWidget();
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
        <h2 className="text-xl font-light">Atendimento direto no site</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Fale com nossa equipe pelo chat — tire dúvidas sobre produtos,
          pedidos e pagamentos. Respondemos em instantes.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Atendimento humano 24h
        </div>
        <button
          onClick={openSupport}
          className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          <MessageCircle className="h-4 w-4" />
          Abrir chat de suporte
        </button>
        <Link
          to="/carrinho"
          className="inline-flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Ir para o carrinho
        </Link>
      </div>
    </main>
  );
}
