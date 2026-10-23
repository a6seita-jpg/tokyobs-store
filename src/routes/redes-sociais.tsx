import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Zap, ShoppingCart, Check, Instagram, Music2 } from "lucide-react";
import { triggerRipple } from "@/lib/ripple";
import { useBuyNow } from "@/lib/buyNow";
import { QuantitySelector } from "@/components/QuantitySelector";
import { StockListPicker, type StockGroup } from "@/components/StockListPicker";
import { useCart } from "@/hooks/useCart";
import banner from "@/assets/banners/redes-sociais.jpg";

export const Route = createFileRoute("/redes-sociais")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Redes Sociais" },
      { name: "description", content: "Seguidores, curtidas e views para Instagram e TikTok. Entrega rápida e suporte 24h." },
      { property: "og:title", content: "TOKYOBS Redes Sociais" },
      { property: "og:description", content: "Seguidores, curtidas e views para Instagram e TikTok na TOKYOBS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RedesSociaisPage,
});

const INSTAGRAM: StockGroup[] = [
  {
    title: "Instagram — Seguidores",
    items: [
      { id: "ig-100s", label: "100 SEGUIDORES +200 LIKES DE BRINDE", price: 6.0, stock: 100 },
      { id: "ig-500s", label: "500 SEGUIDORES +200 LIKES DE BRINDE", price: 9.0, stock: 100 },
      { id: "ig-1ks", label: "1K SEGUIDORES +200 LIKES DE BRINDE", price: 11.99, stock: 76 },
      { id: "ig-1k5s", label: "1K500 SEGUIDORES +200 LIKES DE BRINDE", price: 15.15, stock: 95 },
      { id: "ig-2ks", label: "2K SEGUIDORES +200 LIKES DE BRINDE", price: 18.0, stock: 96 },
    ],
  },
  {
    title: "Instagram — Curtidas",
    items: [
      { id: "ig-100c", label: "100 CURTIDAS", price: 6.0, stock: 9964 },
      { id: "ig-500c", label: "500 CURTIDAS", price: 8.0, stock: 9991 },
      { id: "ig-1000c", label: "1000 CURTIDAS", price: 10.0, stock: 9996 },
      { id: "ig-2000c", label: "2000 CURTIDAS", price: 13.0, stock: 9999 },
      { id: "ig-5000c", label: "5000 CURTIDAS", price: 21.0, stock: 9999 },
    ],
  },
  {
    title: "Instagram — Visualizações",
    items: [
      { id: "ig-100v", label: "100 VISUALIZAÇÕES", price: 6.0, stock: 9999 },
      { id: "ig-500v", label: "500 VISUALIZAÇÕES", price: 6.5, stock: 9999 },
      { id: "ig-1000v", label: "1000 VISUALIZAÇÕES", price: 7.0, stock: 9998 },
      { id: "ig-2000v", label: "2000 VISUALIZAÇÕES", price: 8.5, stock: 9998 },
      { id: "ig-5000v", label: "5000 VISUALIZAÇÕES", price: 10.0, stock: 9999 },
    ],
  },
];

const TIKTOK: StockGroup[] = [
  {
    title: "TikTok — Seguidores",
    items: [
      { id: "tk-10s", label: "10 SEGUIDORES TIKTOK", price: 6.09, stock: 211 },
      { id: "tk-100s", label: "100 SEGUIDORES TIKTOK", price: 8.39, stock: 188 },
      { id: "tk-1ks", label: "1000 SEGUIDORES TIKTOK", price: 32.89, stock: 445 },
      { id: "tk-10ks", label: "10000 SEGUIDORES TIKTOK", price: 224.9, stock: 360 },
    ],
  },
  {
    title: "TikTok — Curtidas",
    items: [
      { id: "tk-100c", label: "100 CURTIDAS TIKTOK BRASIL", price: 6.11, stock: 481 },
      { id: "tk-1kc", label: "1000 CURTIDAS TIKTOK BRASIL", price: 24.9, stock: 215 },
      { id: "tk-10kc", label: "10000 CURTIDAS TIKTOK BRASIL", price: 134.9, stock: 91 },
    ],
  },
  {
    title: "TikTok — Visualizações",
    items: [
      { id: "tk-500v", label: "500 VIEWS MUNDIAIS", price: 6.12, stock: 150 },
      { id: "tk-1kv", label: "1000 VIEWS MUNDIAIS", price: 6.42, stock: 125 },
      { id: "tk-10kv", label: "10000 VIEWS MUNDIAIS", price: 16.92, stock: 156 },
      { id: "tk-100kv", label: "100000 VIEWS MUNDIAIS", price: 84.78, stock: 160 },
    ],
  },
  {
    title: "TikTok — Salvos",
    items: [
      { id: "tk-100sv", label: "100 SALVOS BRASIL", price: 6.13, stock: 160 },
      { id: "tk-1ksv", label: "1000 SALVOS BRASIL", price: 7.29, stock: 159 },
      { id: "tk-10ksv", label: "10000 SALVOS BRASIL", price: 22.67, stock: 160 },
    ],
  },
  {
    title: "TikTok — Compartilhamentos",
    items: [
      { id: "tk-100sh", label: "100 COMPARTILHAMENTOS BRASIL", price: 6.14, stock: 158 },
      { id: "tk-1ksh", label: "1000 COMPARTILHAMENTOS BRASIL", price: 7.28, stock: 156 },
      { id: "tk-10ksh", label: "10000 COMPARTILHAMENTOS BRASIL", price: 22.78, stock: 159 },
    ],
  },
];

const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

type TabKey = "instagram" | "tiktok";

const TABS: { key: TabKey; label: string; icon: typeof Instagram; groups: StockGroup[] }[] = [
  { key: "instagram", label: "Instagram", icon: Instagram, groups: INSTAGRAM },
  { key: "tiktok", label: "TikTok", icon: Music2, groups: TIKTOK },
];

function RedesSociaisPage() {
  const [tab, setTab] = useState<TabKey>("instagram");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const active = TABS.find((t) => t.key === tab)!;
  const selected = useMemo(() => {
    for (const g of active.groups) {
      const it = g.items.find((i) => i.id === selectedId);
      if (it) return it;
    }
    return null;
  }, [selectedId, active]);

  const total = selected ? selected.price * qty : 0;
  const productLabel = active.label;
  const buyNow = useBuyNow();

  const handleAdd = () => {
    if (!selected) return;
    addItem({
      product: productLabel,
      variation: selected.label,
      unitPrice: selected.price,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <main className="container-tk pt-28 pb-16 ink-wash-enter relative z-10">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          <span className="seal" /> Categoria
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extralight">Redes Sociais</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Seguidores, curtidas, views, salvos e compartilhamentos.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex gap-2 mb-6 fade-up">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => { setTab(t.key); setSelectedId(null); setQty(1); }}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-md border transition text-sm"
                style={{
                  background: isActive ? "#1a1a2e" : "transparent",
                  borderColor: isActive ? "#ffd700" : "#333",
                  color: "#fff",
                }}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <article className="rounded-lg border border-border bg-card overflow-hidden fade-up">
          <div className="aspect-[16/9] bg-muted overflow-hidden fade-up">
            <img src={banner} alt="Redes Sociais" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="p-6 sm:p-10 flex flex-col gap-5">
            <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {active.label} — Selecione o pacote
            </label>
            <StockListPicker
              groups={active.groups}
              value={selectedId}
              onChange={(id) => { setSelectedId(id); setQty(1); }}
            />

            {selected && (
              <div className="text-[13px] leading-relaxed fade-up" style={{ color: "#aaa" }}>
                <ul className="space-y-1">
                  <li>• Entrega gradual e segura</li>
                  <li>• Não precisa de senha — só o link</li>
                  <li>• Início em até 1h após confirmação</li>
                  <li>• Estoque atual: {selected.stock} unidades</li>
                </ul>
              </div>
            )}

            {selected && (
              <>
                <div className="flex items-center justify-between gap-4 pt-2 fade-up">
                  <QuantitySelector value={qty} onChange={setQty} max={Math.max(1, Math.min(selected.stock, 999))} />
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {fmt(selected.price)} x {qty}
                    </div>
                    <div key={total} className="text-2xl font-light text-primary price-flash">{fmt(total)}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { triggerRipple(e); buyNow({ product: productLabel, variation: selected.label, unitPrice: selected.price, quantity: qty, image: banner }); }}
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
        </article>
      </div>
    </main>
  );
}
