import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Zap, ShoppingCart, Check } from "lucide-react";
import { triggerRipple } from "@/lib/ripple";
import { useBuyNow } from "@/lib/buyNow";
import { QuantitySelector } from "@/components/QuantitySelector";
import { StockListPicker, type StockGroup } from "@/components/StockListPicker";
import { useCart } from "@/hooks/useCart";

import crunchyrollLogo from "@/assets/logos/crunchyroll.jpg";
import youtubeLogo from "@/assets/logos/youtube.jpg";
import discordLogo from "@/assets/logos/discord.jpg";
import netflixLogo from "@/assets/logos/netflix.jpg";
import paramountLogo from "@/assets/logos/paramount.jpg";
import huluLogo from "@/assets/logos/hulu.jpg";
import chatgptLogo from "@/assets/logos/chatgpt.jpg";
import xboxLogo from "@/assets/logos/xbox.jpg";
import spotifyLogo from "@/assets/logos/spotify.jpg";
import primeLogo from "@/assets/logos/prime.jpg";

import crunchyrollBanner from "@/assets/banners/crunchyroll.jpg";
import youtubeBanner from "@/assets/banners/youtube.jpg";
import netflixBanner from "@/assets/banners/netflix.jpg";
import paramountBanner from "@/assets/banners/paramount.jpg";
import huluBanner from "@/assets/banners/hulu.jpg";
import chatgptBanner from "@/assets/banners/chatgpt.jpg";
import xboxBanner from "@/assets/banners/xbox.jpg";
import spotifyBanner from "@/assets/banners/spotify.jpg";
import primeBanner from "@/assets/banners/prime.jpg";
import { ReviewSection } from "@/components/ReviewSection";

export const Route = createFileRoute("/streaming")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Assinaturas e Streaming" },
      { name: "description", content: "Crunchyroll, YouTube, Netflix, Paramount+, Prime, Hulu+Star+ESPN, ChatGPT, GamePass, Spotify e mais." },
      { property: "og:title", content: "TOKYOBS Assinaturas" },
      { property: "og:description", content: "Assinaturas e streaming disponíveis na TOKYOBS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StreamingPage,
});

type Variant = { label: string; price: number; description: string[] };
type Product = {
  id: string;
  title: string;
  logo: string;
  banner?: string;
  intro?: string;
  variants: Variant[];
};

const PRODUCTS: Product[] = [
  {
    id: "crunchyroll",
    title: "Crunchyroll Premium Mega Fan",
    logo: crunchyrollLogo,
    banner: crunchyrollBanner,
    intro: "Acesso Premium Mega Fan",
    variants: [
      { label: "30 dias", price: 11.0, description: ["Full HD + 4K disponível", "Simulcast de lançamentos", "Sem anúncios", "Entrega até 2h via login"] },
      { label: "90 dias Full Acesso", price: 34.9, description: ["Full HD + 4K disponível", "Simulcast de lançamentos", "Sem anúncios", "Acesso por 90 dias"] },
    ],
  },
  {
    id: "youtube",
    title: "YouTube Premium + YouTube Music",
    logo: youtubeLogo,
    banner: youtubeBanner,
    intro: "YouTube Premium + YouTube Music",
    variants: [
      { label: "30 dias via link e-mail", price: 13.9, description: ["Sem anúncios no YouTube", "Music offline e background", "Ativação via link, sem login na sua conta", "Ativação imediata"] },
      { label: "30 dias ativo e-mail", price: 11.9, description: ["Sem anúncios no YouTube", "Music offline e background", "Ativação direto no seu e-mail", "Ativação imediata"] },
      { label: "30 dias renovável", price: 25.0, description: ["Sem anúncios no YouTube", "Music offline e background", "Plano renovável mensalmente", "Ativação imediata"] },
    ],
  },
  {
    id: "discord",
    title: "Discord Nitro",
    logo: discordLogo,
    intro: "Discord Nitro Full",
    variants: [
      { label: "30 dias", price: 14.9, description: ["Emojis e stickers animados em qualquer servidor", "Upload até 500MB", "Streaming HD 1080p 60fps", "Ativação imediata"] },
    ],
  },
  {
    id: "netflix",
    title: "Netflix 4K Premium",
    logo: netflixLogo,
    banner: netflixBanner,
    intro: "Netflix 4K Premium",
    variants: [
      { label: "30 dias", price: 14.99, description: ["4 telas simultâneas", "Ultra HD 4K + HDR", "Catálogo completo", "Entrega rápida"] },
    ],
  },
  {
    id: "netflix-shared",
    title: "Netflix Compartilhada",
    logo: netflixLogo,
    banner: netflixBanner,
    intro: "Netflix Compartilhada — 1 tela HD",
    variants: [
      { label: "7 dias", price: 11.75, description: ["1 tela em HD", "Catálogo completo Netflix", "Tela individual reservada", "Entrega rápida"] },
      { label: "15 dias", price: 12.99, description: ["1 tela em HD", "Catálogo completo Netflix", "Tela individual reservada", "Entrega rápida"] },
    ],
  },
  {
    id: "paramount",
    title: "Paramount+",
    logo: paramountLogo,
    banner: paramountBanner,
    intro: "Paramount+ Full Acesso",
    variants: [
      { label: "30 dias", price: 13.9, description: ["Séries originais + filmes", "Conteúdo CBS, MTV, Nickelodeon", "Full HD", "Entrega rápida"] },
      { label: "14 dias", price: 12.5, description: ["Teste Paramount+ 14 dias", "Catálogo completo", "Full HD", "Entrega rápida"] },
      { label: "7 dias Promo", price: 11.0, description: ["Teste rápido Paramount+ 7 dias", "Catálogo completo", "Full HD", "Entrega rápida"] },
    ],
  },
  {
    id: "prime",
    title: "Prime Video",
    logo: primeLogo,
    banner: primeBanner,
    intro: "Prime Video Full Acesso",
    variants: [
      { label: "30 dias", price: 13.9, description: ["Filmes + Séries Amazon Original", "Full HD", "Multi-dispositivo", "Entrega rápida"] },
      { label: "14 dias", price: 12.9, description: ["Teste Prime Video 14 dias", "Catálogo completo", "Full HD", "Entrega rápida"] },
      { label: "7 dias Promo", price: 11.0, description: ["Teste rápido Prime Video 7 dias", "Catálogo completo", "Full HD", "Entrega rápida"] },
    ],
  },
  {
    id: "hulu",
    title: "Hulu + Star+ + ESPN",
    logo: huluLogo,
    banner: huluBanner,
    intro: "Combo Hulu + Star+ + ESPN",
    variants: [
      { label: "30 dias", price: 12.9, description: ["Esportes ao vivo ESPN", "Séries Hulu + Star+", "Full HD", "Entrega rápida"] },
      { label: "10 dias", price: 11.9, description: ["Teste combo 10 dias", "Esportes + séries", "Full HD", "Entrega rápida"] },
      { label: "7 dias", price: 11.0, description: ["Teste combo 7 dias", "Esportes + séries", "Full HD", "Entrega rápida"] },
    ],
  },
  {
    id: "chatgpt",
    title: "ChatGPT 5.2 Plus",
    logo: chatgptLogo,
    banner: chatgptBanner,
    intro: "ChatGPT 5.2 Plus",
    variants: [
      { label: "30 dias", price: 14.9, description: ["GPT-4o ilimitado", "Geração de imagens DALL-E 3", "Acesso prioritário", "30 dias full acesso"] },
      { label: "30 dias + Gmail novo", price: 22.9, description: ["GPT-4o ilimitado", "Conta Gmail nova criada", "Acesso prioritário", "30 dias full acesso"] },
    ],
  },
  {
    id: "gamepass",
    title: "GamePass Ultimate",
    logo: xboxLogo,
    banner: xboxBanner,
    intro: "GamePass Ultimate",
    variants: [
      { label: "7 dias + brinde", price: 11.0, description: ["Catálogo Ultimate completo", "PC + Console + Cloud", "Brinde digital incluso", "Entrega rápida"] },
      { label: "15 dias + brinde", price: 11.99, description: ["Catálogo Ultimate completo", "PC + Console + Cloud", "Brinde digital incluso", "Entrega rápida"] },
      { label: "30 dias + brinde", price: 13.49, description: ["Catálogo Ultimate completo", "PC + Console + Cloud", "Brinde digital incluso", "Entrega rápida"] },
      { label: "30 dias Console", price: 13.49, description: ["Versão Console", "Catálogo Ultimate completo", "Acesso direto no seu Xbox", "Entrega rápida"] },
    ],
  },
  {
    id: "spotify",
    title: "Spotify Premium",
    logo: spotifyLogo,
    banner: spotifyBanner,
    intro: "Spotify Premium",
    variants: [
      { label: "Link 3 meses", price: 11.0, description: ["Spotify Premium 3 meses via link", "Sem login na sua conta", "Música offline", "Sem anúncios"] },
      { label: "50 links 3 meses", price: 17.99, description: ["Pacote 50 contas Spotify 3 meses", "Ideal para revenda", "Sem login compartilhado", "Entrega imediata"] },
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
  const [vId, setVId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const groups: StockGroup[] = useMemo(() => [{
    title: "Variações disponíveis",
    items: product.variants.map((v) => ({
      id: v.label,
      label: v.label,
      price: v.price,
      stock: 99,
    })),
  }], [product]);

  const variant = useMemo(
    () => product.variants.find((v) => v.label === vId) ?? null,
    [vId, product]
  );
  const total = variant ? variant.price * qty : 0;

  const buyNow = useBuyNow();

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
          Voltar para Assinaturas
        </button>
      </div>

      {product.banner && (
        <div className="aspect-[16/9] bg-muted overflow-hidden fade-up stagger-1">
          <img src={product.banner} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="p-6 sm:p-10 flex flex-col items-center gap-6">
        {!product.banner && (
          <div className="w-[120px] h-[120px] flex items-center justify-center rounded-md bg-[#0a0a0a] overflow-hidden fade-up stagger-1">
            <img src={product.logo} alt={product.title} className="max-h-[100px] max-w-[100px] object-contain" />
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-extralight text-center fade-up stagger-2">{product.title}</h1>

        <div className="w-full flex flex-col gap-4">
          <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground fade-up stagger-3">
            Selecione a variação
          </label>
          <div className="fade-up stagger-3">
            <StockListPicker
              groups={groups}
              value={vId}
              onChange={(id) => { setVId(id); setQty(1); }}
            />
          </div>

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

              <button
                type="button"
                onClick={(e) => { triggerRipple(e); buyNow({ product: product.title, variation: variant.label, unitPrice: variant.price, quantity: qty, image: product.logo }); }}
                className="ripple-host inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition fade-up"
              >
                <Zap className="h-4 w-4" />
                Comprar agora com Pix
              </button>

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

      <div className="px-6 sm:px-10 pb-8">
        <ReviewSection productId={`streaming:${product.id}`} productName={product.title} />
      </div>
    </article>
  );
}

function StreamingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = PRODUCTS.find((p) => p.id === selectedId) ?? null;

  return (
    <main className="container-tk pt-28 pb-16 ink-wash-enter relative z-10">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          <span className="seal" /> Categoria
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extralight">Assinaturas</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {selected
            ? "Escolha a variação, defina a quantidade e finalize com Pix."
            : "Selecione uma categoria para ver as variações disponíveis."}
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
