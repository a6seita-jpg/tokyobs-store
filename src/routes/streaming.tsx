import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { triggerRipple } from "@/lib/ripple";
import { purchaseUrl } from "@/lib/whatsapp";
import { QuantitySelector } from "@/components/QuantitySelector";

export const Route = createFileRoute("/streaming")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Assinaturas e Streaming" },
      { name: "description", content: "Crunchyroll, YouTube Premium, Netflix, Paramount+, Prime Video e mais. Entrega rápida." },
      { property: "og:title", content: "TOKYOBS Streaming" },
    ],
  }),
  component: StreamingPage,
});

type Variant = { label: string; price: number; description: string };
type Product = { id: string; title: string; logo: string; variants: Variant[] };

// Logos via Wikimedia/official assets (public). Stored remote to keep repo lean.
const PRODUCTS: Product[] = [
  {
    id: "crunchyroll",
    title: "Crunchyroll Premium Mega Fan",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Crunchyroll_Logo.svg/512px-Crunchyroll_Logo.svg.png",
    variants: [
      { label: "30 dias", price: 6.0, description: "Acesso Premium Mega Fan por 30 dias. Full HD." },
      { label: "90 dias Full Acesso", price: 29.9, description: "Acesso Premium Mega Fan por 90 dias. Full HD + Simulcast." },
    ],
  },
  {
    id: "youtube",
    title: "YouTube Premium + YouTube Music",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/512px-YouTube_Logo_2017.svg.png",
    variants: [
      { label: "30 dias via link e-mail", price: 8.9, description: "Ativação via link. Sem login na sua conta." },
      { label: "30 dias ativo e-mail", price: 6.9, description: "Ativação direto no seu e-mail." },
      { label: "30 dias renovável", price: 20.0, description: "Plano renovável mensalmente." },
    ],
  },
  {
    id: "netflix",
    title: "Netflix 4K Premium",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/512px-Netflix_2015_logo.svg.png",
    variants: [
      { label: "30 dias", price: 9.99, description: "Netflix 4K Premium 30 dias. 4 telas simultâneas, Ultra HD." },
    ],
  },
  {
    id: "paramount",
    title: "Paramount+",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Paramount_Plus.svg/512px-Paramount_Plus.svg.png",
    variants: [
      { label: "30 dias", price: 8.9, description: "Paramount+ 30 dias. Séries originais + filmes." },
      { label: "14 dias", price: 7.5, description: "Teste Paramount+ 14 dias." },
      { label: "7 dias Promo", price: 6.0, description: "Teste rápido Paramount+ 7 dias." },
    ],
  },
  {
    id: "prime",
    title: "Prime Video",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Prime_Video.png/512px-Prime_Video.png",
    variants: [
      { label: "30 dias", price: 8.9, description: "Prime Video 30 dias. Filmes + Séries Amazon Original." },
    ],
  },
];

const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

function ProductCard({ product }: { product: Product }) {
  const [vIdx, setVIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const variant = product.variants[vIdx];
  const total = variant.price * qty;

  const href = purchaseUrl({
    product: product.title,
    variation: variant.label,
    quantity: qty,
    total,
  });

  return (
    <article className="rounded-lg overflow-hidden border border-border bg-card flex flex-col">
      <div className="aspect-[16/9] bg-[#0a0a0a] flex items-center justify-center p-8 border-b border-border">
        <img
          src={product.logo}
          alt={product.title}
          className="max-h-20 w-auto object-contain"
          loading="lazy"
        />
      </div>
      <div className="p-5 flex flex-col gap-4 flex-1">
        <h3 className="text-lg font-light">{product.title}</h3>

        <select
          value={vIdx}
          onChange={(e) => { setVIdx(Number(e.target.value)); setQty(1); }}
          className="w-full h-11 px-3 rounded-md border border-input bg-background text-foreground focus:border-primary outline-none text-sm"
        >
          {product.variants.map((v, i) => (
            <option key={v.label} value={i}>
              {v.label} — {fmt(v.price)}
            </option>
          ))}
        </select>

        <p className="text-xs text-muted-foreground leading-relaxed min-h-[2.5rem]">
          {variant.description}
        </p>

        <div className="flex items-center justify-between gap-3 pt-1">
          <QuantitySelector value={qty} onChange={setQty} />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Total</div>
            <div className="text-xl font-light text-primary">{fmt(total)}</div>
          </div>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={triggerRipple}
          className="ripple-host mt-auto inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition text-sm"
        >
          <MessageCircle className="h-4 w-4" />
          Comprar via WhatsApp
        </a>
      </div>
    </article>
  );
}

function StreamingPage() {
  return (
    <main className="container-tk pt-28 pb-16 ink-wash-enter relative z-10">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          <span className="seal" /> Categoria
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extralight">Assinaturas</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Streaming, música e mais. Escolha a variação, defina a quantidade e finalize no WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
}
