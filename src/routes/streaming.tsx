import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { triggerRipple } from "@/lib/ripple";
import { purchaseUrl } from "@/lib/whatsapp";
import { QuantitySelector } from "@/components/QuantitySelector";

import crunchyrollLogo from "@/assets/logos/crunchyroll.jpg";
import youtubeLogo from "@/assets/logos/youtube.jpg";
import discordLogo from "@/assets/logos/discord.jpg";
import netflixLogo from "@/assets/logos/netflix.jpg";
import paramountLogo from "@/assets/logos/paramount.jpg";
import huluLogo from "@/assets/logos/hulu.jpg";
import chatgptLogo from "@/assets/logos/chatgpt.jpg";
import xboxLogo from "@/assets/logos/xbox.jpg";
import spotifyLogo from "@/assets/logos/spotify.jpg";

export const Route = createFileRoute("/streaming")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Assinaturas e Streaming" },
      { name: "description", content: "Crunchyroll, YouTube, Netflix, Paramount+, Prime, Hulu+Star+ESPN, ChatGPT, GamePass, Spotify e mais." },
      { property: "og:title", content: "TOKYOBS Assinaturas" },
    ],
  }),
  component: StreamingPage,
});

type Variant = { label: string; price: number; description: string[] };
type Product = {
  id: string;
  emoji: string;
  title: string;
  logo: string;
  intro?: string;
  variants: Variant[];
};

const PRODUCTS: Product[] = [
  {
    id: "crunchyroll",
    emoji: "🎬",
    title: "Crunchyroll Premium Mega Fan",
    logo: crunchyrollLogo,
    intro: "Acesso Premium Mega Fan",
    variants: [
      {
        label: "30 dias",
        price: 6.0,
        description: [
          "Full HD + 4K disponível",
          "Simulcast de lançamentos",
          "Sem anúncios",
          "Entrega até 2h via login",
        ],
      },
      {
        label: "90 dias Full Acesso",
        price: 29.9,
        description: [
          "Full HD + 4K disponível",
          "Simulcast de lançamentos",
          "Sem anúncios",
          "Acesso por 90 dias",
        ],
      },
    ],
  },
  {
    id: "youtube",
    emoji: "▶️",
    title: "YouTube Premium + YouTube Music",
    logo: youtubeLogo,
    intro: "YouTube Premium + YouTube Music",
    variants: [
      {
        label: "30 dias via link e-mail",
        price: 8.9,
        description: [
          "Sem anúncios no YouTube",
          "Music offline e background",
          "Ativação via link, sem login na sua conta",
          "Ativação imediata",
        ],
      },
      {
        label: "30 dias ativo e-mail",
        price: 6.9,
        description: [
          "Sem anúncios no YouTube",
          "Music offline e background",
          "Ativação direto no seu e-mail",
          "Ativação imediata",
        ],
      },
      {
        label: "30 dias renovável",
        price: 20.0,
        description: [
          "Sem anúncios no YouTube",
          "Music offline e background",
          "Plano renovável mensalmente",
          "Ativação imediata",
        ],
      },
    ],
  },
  {
    id: "discord",
    emoji: "💬",
    title: "Discord Nitro",
    logo: discordLogo,
    intro: "Discord Nitro Full",
    variants: [
      {
        label: "30 dias",
        price: 9.9,
        description: [
          "Emojis e stickers animados em qualquer servidor",
          "Upload até 500MB",
          "Streaming HD 1080p 60fps",
          "Ativação imediata",
        ],
      },
    ],
  },
  {
    id: "netflix",
    emoji: "📺",
    title: "Netflix 4K Premium",
    logo: netflixLogo,
    intro: "Netflix 4K Premium",
    variants: [
      {
        label: "30 dias",
        price: 9.99,
        description: [
          "4 telas simultâneas",
          "Ultra HD 4K + HDR",
          "Catálogo completo",
          "Entrega rápida",
        ],
      },
    ],
  },
  {
    id: "netflix-shared",
    emoji: "📺",
    title: "Netflix Compartilhada",
    logo: netflixLogo,
    intro: "Netflix Compartilhada — 1 tela HD",
    variants: [
      {
        label: "7 dias",
        price: 6.75,
        description: [
          "1 tela em HD",
          "Catálogo completo Netflix",
          "Tela individual reservada",
          "Entrega rápida",
        ],
      },
      {
        label: "15 dias",
        price: 7.99,
        description: [
          "1 tela em HD",
          "Catálogo completo Netflix",
          "Tela individual reservada",
          "Entrega rápida",
        ],
      },
    ],
  },
  {
    id: "paramount",
    emoji: "🟦",
    title: "Paramount+",
    logo: paramountLogo,
    intro: "Paramount+ Full Acesso",
    variants: [
      {
        label: "30 dias",
        price: 8.9,
        description: [
          "Séries originais + filmes",
          "Conteúdo CBS, MTV, Nickelodeon",
          "Full HD",
          "Entrega rápida",
        ],
      },
      {
        label: "14 dias",
        price: 7.5,
        description: ["Teste Paramount+ 14 dias", "Catálogo completo", "Full HD", "Entrega rápida"],
      },
      {
        label: "7 dias Promo",
        price: 6.0,
        description: ["Teste rápido Paramount+ 7 dias", "Catálogo completo", "Full HD", "Entrega rápida"],
      },
    ],
  },
  {
    id: "prime",
    emoji: "🟧",
    title: "Prime Video",
    logo: youtubeLogo, // fallback – replaced visually via text. We'll show Prime as text logo block.
    intro: "Prime Video Full Acesso",
    variants: [
      {
        label: "30 dias",
        price: 8.9,
        description: ["Filmes + Séries Amazon Original", "Full HD", "Multi-dispositivo", "Entrega rápida"],
      },
      {
        label: "14 dias",
        price: 7.9,
        description: ["Teste Prime Video 14 dias", "Catálogo completo", "Full HD", "Entrega rápida"],
      },
      {
        label: "7 dias Promo",
        price: 6.0,
        description: ["Teste rápido Prime Video 7 dias", "Catálogo completo", "Full HD", "Entrega rápida"],
      },
    ],
  },
  {
    id: "hulu",
    emoji: "🔵",
    title: "Hulu + Star+ + ESPN",
    logo: huluLogo,
    intro: "Combo Hulu + Star+ + ESPN",
    variants: [
      {
        label: "30 dias",
        price: 7.9,
        description: ["Esportes ao vivo ESPN", "Séries Hulu + Star+", "Full HD", "Entrega rápida"],
      },
      {
        label: "10 dias",
        price: 6.9,
        description: ["Teste combo 10 dias", "Esportes + séries", "Full HD", "Entrega rápida"],
      },
      {
        label: "7 dias",
        price: 6.0,
        description: ["Teste combo 7 dias", "Esportes + séries", "Full HD", "Entrega rápida"],
      },
    ],
  },
  {
    id: "chatgpt",
    emoji: "🤖",
    title: "ChatGPT 5.2 Plus",
    logo: chatgptLogo,
    intro: "ChatGPT 5.2 Plus",
    variants: [
      {
        label: "30 dias",
        price: 9.9,
        description: [
          "GPT-4o ilimitado",
          "Geração de imagens DALL-E 3",
          "Acesso prioritário",
          "30 dias full acesso",
        ],
      },
      {
        label: "30 dias + Gmail novo",
        price: 17.9,
        description: [
          "GPT-4o ilimitado",
          "Conta Gmail nova criada",
          "Acesso prioritário",
          "30 dias full acesso",
        ],
      },
    ],
  },
  {
    id: "gamepass",
    emoji: "🎮",
    title: "GamePass Ultimate",
    logo: xboxLogo,
    intro: "GamePass Ultimate",
    variants: [
      {
        label: "7 dias + brinde",
        price: 6.0,
        description: ["Catálogo Ultimate completo", "PC + Console + Cloud", "Brinde digital incluso", "Entrega rápida"],
      },
      {
        label: "15 dias + brinde",
        price: 6.99,
        description: ["Catálogo Ultimate completo", "PC + Console + Cloud", "Brinde digital incluso", "Entrega rápida"],
      },
      {
        label: "30 dias + brinde",
        price: 8.49,
        description: ["Catálogo Ultimate completo", "PC + Console + Cloud", "Brinde digital incluso", "Entrega rápida"],
      },
      {
        label: "30 dias Console",
        price: 8.49,
        description: ["Versão Console", "Catálogo Ultimate completo", "Acesso direto no seu Xbox", "Entrega rápida"],
      },
    ],
  },
  {
    id: "spotify",
    emoji: "🎵",
    title: "Spotify Premium",
    logo: spotifyLogo,
    intro: "Spotify Premium",
    variants: [
      {
        label: "Link 3 meses",
        price: 6.0,
        description: ["Spotify Premium 3 meses via link", "Sem login na sua conta", "Música offline", "Sem anúncios"],
      },
      {
        label: "50 links 3 meses",
        price: 12.99,
        description: ["Pacote 50 contas Spotify 3 meses", "Ideal para revenda", "Sem login compartilhado", "Entrega imediata"],
      },
    ],
  },
];

const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

function CategoryCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { triggerRipple(e); onClick(); }}
      className="ripple-host group flex flex-col items-center justify-center gap-3 p-5 rounded-lg border border-border bg-card hover:border-primary transition-colors aspect-square"
    >
      <div className="w-20 h-20 flex items-center justify-center rounded-md bg-[#0a0a0a] overflow-hidden">
        <img src={product.logo} alt={product.title} className="max-h-16 max-w-16 object-contain" loading="lazy" />
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground">{product.emoji}</div>
        <div className="text-sm font-light leading-tight">{product.title}</div>
      </div>
    </button>
  );
}

function ProductDetail({ product, onBack }: { product: Product; onBack: () => void }) {
  const [vIdx, setVIdx] = useState<number | "">("");
  const [qty, setQty] = useState(1);

  const variant = useMemo(() => (vIdx === "" ? null : product.variants[vIdx]), [vIdx, product]);
  const total = variant ? variant.price * qty : 0;

  const href = variant
    ? purchaseUrl({
        product: product.title,
        variation: variant.label,
        quantity: qty,
        total,
      })
    : "#";

  return (
    <article className="max-w-2xl mx-auto rounded-lg border border-border bg-card overflow-hidden">
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

      <div className="p-6 sm:p-10 flex flex-col items-center gap-6">
        <div className="w-[120px] h-[120px] flex items-center justify-center rounded-md bg-[#0a0a0a] overflow-hidden">
          <img src={product.logo} alt={product.title} className="max-h-[100px] max-w-[100px] object-contain" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extralight text-center">{product.title}</h1>

        <div className="w-full flex flex-col gap-4">
          <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Selecione a variação
          </label>
          <select
            value={vIdx}
            onChange={(e) => {
              const v = e.target.value;
              setVIdx(v === "" ? "" : Number(v));
              setQty(1);
            }}
            className="w-full h-12 px-3 rounded-md border border-input bg-background text-foreground focus:border-primary outline-none"
          >
            <option value="">— Escolha uma opção —</option>
            {product.variants.map((v, i) => (
              <option key={v.label} value={i}>
                {v.label} — {fmt(v.price)}
              </option>
            ))}
          </select>

          {variant && (
            <div className="text-[13px] leading-relaxed" style={{ color: "#aaa" }}>
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
              <div className="flex items-center justify-between gap-4 pt-2">
                <QuantitySelector value={qty} onChange={setQty} max={999} />
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {fmt(variant.price)} x {qty}
                  </div>
                  <div className="text-2xl font-light text-primary">{fmt(total)}</div>
                </div>
              </div>

              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={triggerRipple}
                className="ripple-host inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
              >
                <MessageCircle className="h-4 w-4" />
                Comprar via WhatsApp
              </a>
            </>
          )}
        </div>
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
            ? "Escolha a variação, defina a quantidade e finalize no WhatsApp."
            : "Selecione uma categoria para ver as variações disponíveis."}
        </p>
      </div>

      {selected ? (
        <ProductDetail product={selected} onBack={() => setSelectedId(null)} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {PRODUCTS.map((p) => (
            <CategoryCard key={p.id} product={p} onClick={() => setSelectedId(p.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
