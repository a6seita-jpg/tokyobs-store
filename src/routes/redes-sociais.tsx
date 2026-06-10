import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle, ShoppingCart, Check } from "lucide-react";
import { triggerRipple } from "@/lib/ripple";
import { purchaseUrl } from "@/lib/whatsapp";
import { QuantitySelector } from "@/components/QuantitySelector";
import { useCart } from "@/hooks/useCart";

import spotifyLogo from "@/assets/logos/spotify.jpg";
import xboxLogo from "@/assets/logos/xbox.jpg";

export const Route = createFileRoute("/redes-sociais")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Redes Sociais" },
      { name: "description", content: "Seguidores, curtidas e views para Instagram e TikTok. Entrega rápida e suporte 24h." },
      { property: "og:title", content: "TOKYOBS Redes Sociais" },
    ],
  }),
  component: RedesSociaisPage,
});

type Variant = { label: string; price: number; description: string[] };
type Product = {
  id: string;
  title: string;
  logo: string;
  intro?: string;
  variants: Variant[];
};

const PRODUCTS: Product[] = [
  {
    id: "instagram",
    title: "Instagram",
    logo: spotifyLogo,
    intro: "Seguidores, curtidas e views brasileiros",
    variants: [
      { label: "100 seguidores", price: 5.0, description: ["Seguidores brasileiros reais", "Entrega gradual e segura", "Não precisa de senha", "Solicite o link do perfil"] },
      { label: "500 seguidores", price: 15.0, description: ["Seguidores brasileiros reais", "Entrega gradual e segura", "Não precisa de senha", "Solicite o link do perfil"] },
      { label: "1000 seguidores", price: 25.0, description: ["Seguidores brasileiros reais", "Entrega gradual e segura", "Não precisa de senha", "Solicite o link do perfil"] },
      { label: "500 curtidas", price: 5.0, description: ["Curtidas brasileiras", "Distribuídas em posts", "Entrega rápida", "Link do post necessário"] },
      { label: "1000 curtidas", price: 8.0, description: ["Curtidas brasileiras", "Distribuídas em posts", "Entrega rápida", "Link do post necessário"] },
      { label: "5000 views", price: 6.0, description: ["Views em reels/stories", "Contagem visível", "Entrega rápida", "Link do conteúdo necessário"] },
    ],
  },
  {
    id: "tiktok",
    title: "TikTok",
    logo: xboxLogo,
    intro: "Seguidores, curtidas e views para TikTok",
    variants: [
      { label: "100 seguidores", price: 4.0, description: ["Seguidores globais", "Entrega gradual", "Não precisa de senha", "Link do perfil necessário"] },
      { label: "500 seguidores", price: 12.0, description: ["Seguidores globais", "Entrega gradual", "Não precisa de senha", "Link do perfil necessário"] },
      { label: "1000 seguidores", price: 20.0, description: ["Seguidores globais", "Entrega gradual", "Não precisa de senha", "Link do perfil necessário"] },
      { label: "500 curtidas", price: 4.0, description: ["Curtidas em vídeos", "Entrega rápida", "Link do vídeo necessário", "Contagem visível"] },
      { label: "1000 curtidas", price: 7.0, description: ["Curtidas em vídeos", "Entrega rápida", "Link do vídeo necessário", "Contagem visível"] },
      { label: "5000 views", price: 5.0, description: ["Views em vídeos", "Entrega rápida", "Link do vídeo necessário", "Contagem visível"] },
    ],
  },
];

const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

function CategoryGridCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { triggerRipple(e); onClick(); }}
      className="ripple-host group flex flex-col items-center justify-center gap-3 p-5 rounded-lg border border-border bg-card aspect-square category-hover"
    >
      <div className="w-20 h-20 flex items-center justify-center rounded-md bg-[#0a0a0a] overflow-hidden">
        <img src={product.logo} alt={product.title} className="max-h-16 max-w-16 object-contain" loading="lazy" />
      </div>
      <div className="text-center">
        <div className="text-sm font-light leading-tight">{product.title}</div>
      </div>
    </button>
  );
}

function ProductDetail({ product, onBack }: { product: Product; onBack: () => void }) {
  const [vIdx, setVIdx] = useState<number | "">("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const variant = useMemo(() => (vIdx === "" ? null : product.variants[vIdx]), [vIdx, product]);
  const total = variant ? variant.price * qty : 0;

  const href = variant
    ? purchaseUrl({ product: product.title, variation: variant.label, quantity: qty, total })
    : "#";

  const handleAdd = () => {
    if (!variant) return;
    addItem({
      product: product.title,
      variation: variant.label,
      unitPrice: variant.price,
      quantity: qty,
      image: product.logo,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article
      key={product.id}
      className="max-w-2xl mx-auto rounded-lg border border-border bg-card overflow-hidden fade-up"
    >
      <div className="p-4 border-b border-border">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar para Redes Sociais
        </button>
      </div>

      <div className="p-6 sm:p-10 flex flex-col items-center gap-6">
        <div className="w-[120px] h-[120px] flex items-center justify-center rounded-md bg-[#0a0a0a] overflow-hidden fade-up stagger-1">
          <img src={product.logo} alt={product.title} className="max-h-[100px] max-w-[100px] object-contain" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extralight text-center fade-up stagger-2">{product.title}</h1>

        <div className="w-full flex flex-col gap-4">
          <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground fade-up stagger-3">
            Selecione a variação
          </label>
          <select
            value={vIdx}
            onChange={(e) => {
              const v = e.target.value;
              setVIdx(v === "" ? "" : Number(v));
              setQty(1);
            }}
            className="w-full h-12 px-3 rounded-md border border-input bg-background text-foreground focus:border-primary outline-none fade-up stagger-3"
          >
            <option value="">— Escolha uma opção —</option>
            {product.variants.map((v, i) => (
              <option key={v.label} value={i}>
                {v.label} — {fmt(v.price)}
              </option>
            ))}
          </select>

          {variant && (
            <div className="text-[13px] leading-relaxed fade-up" style={{ color: "#aaa" }}>
              {product.intro && <div className="mb-2 text-foreground/80 text-sm">{product.intro}</div>}
              <ul className="space-y-1">
                {variant.description.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
            </div>
          )}

          {variant && (
            <>
              <div className="flex items-center justify-between gap-4 pt-2 fade-up">
                <QuantitySelector value={qty} onChange={setQty} max={999} />
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {fmt(variant.price)} x {qty}
                  </div>
                  <div key={total} className="text-2xl font-light text-primary price-flash">{fmt(total)}</div>
                </div>
              </div>

              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={triggerRipple}
                className="ripple-host inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition fade-up"
              >
                <MessageCircle className="h-4 w-4" />
                Comprar via WhatsApp
              </a>

              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border transition fade-up"
                style={{
                  background: added ? "#e63946" : "#0a0a0a",
                  color: "#fff",
                  borderColor: "#e63946",
                }}
              >
                {added ? (<><Check className="h-4 w-4" /> Adicionado</>) : (<><ShoppingCart className="h-4 w-4" /> Adicionar ao Carrinho</>)}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function RedesSociaisPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = PRODUCTS.find((p) => p.id === selectedId) ?? null;

  return (
    <main className="container-tk pt-28 pb-16 ink-wash-enter relative z-10">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          <span className="seal" /> Categoria
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extralight">Redes Sociais</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {selected
            ? "Escolha a variação, defina a quantidade e finalize no WhatsApp."
            : "Selecione uma plataforma para ver as variações disponíveis."}
        </p>
      </div>

      {selected ? (
        <ProductDetail product={selected} onBack={() => setSelectedId(null)} />
      ) : (
        <div key="grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 fade-up">
          {PRODUCTS.map((p) => (
            <CategoryGridCard key={p.id} product={p} onClick={() => setSelectedId(p.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
