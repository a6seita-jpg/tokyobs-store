import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, ShoppingCart, Check } from "lucide-react";
import { triggerRipple } from "@/lib/ripple";
import { purchaseUrl, whatsappUrl } from "@/lib/whatsapp";
import { QuantitySelector } from "@/components/QuantitySelector";
import { StockListPicker, type StockGroup } from "@/components/StockListPicker";
import { useCart } from "@/hooks/useCart";
import img from "@/assets/cat-ps5.jpg";

export const Route = createFileRoute("/steam")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Steam · Keys e Jogos" },
      { name: "description", content: "Keys Steam aleatórias e jogos específicos com melhor preço. Entrega rápida via WhatsApp." },
      { property: "og:title", content: "TOKYOBS Steam" },
      { property: "og:image", content: img },
    ],
  }),
  component: SteamPage,
});

const GROUPS: StockGroup[] = [
  {
    title: "Keys Aleatórias",
    items: [
      { id: "promo-1-7", label: "PROMOÇÃO COMPRE 1 LEVE 7 + 2 de Brinde", price: 4.9, stock: 13 },
      { id: "rand-200", label: "Key Steam R$200,00+", price: 14.9, stock: 27 },
      { id: "rand-100", label: "Key Steam R$100,00+", price: 9.9, stock: 2 },
      { id: "rand-30", label: "Key Steam R$30,00+", price: 3.91, stock: 29 },
      { id: "plus-1", label: "Steam Key Plus", price: 2.0, stock: 53 },
      { id: "triplea", label: "Steam Key Triple A", price: 24.92, stock: 11 },
      { id: "deluxe", label: "Steam Key Deluxe", price: 49.93, stock: 4 },
      { id: "plus-10", label: "10x Steam Key Plus", price: 18.9, stock: 3 },
      { id: "plus-20", label: "20x Steam Key Plus", price: 28.92, stock: 2 },
      { id: "plus-50", label: "50x Steam Key Plus", price: 49.9, stock: 1 },
    ],
  },
  {
    title: "Keys de Jogos Específicos",
    items: [
      { id: "007-rdr", label: "007 FIRST LIGHT DELUXE + RED DEAD STEAM", price: 2.9, stock: 4 },
      { id: "forza-gta", label: "FORZA HORIZON 6 + GTA V STEAM", price: 1.0, stock: 6 },
      { id: "pragmata", label: "PRAGMATA DELUXE EDITION", price: 1.9, stock: 5 },
      { id: "re-requiem", label: "RESIDENT EVIL REQUIEM 9 DELUXE EDITION", price: 1.0, stock: 6 },
      { id: "gtav", label: "GTA V COMPLETO", price: 1.9, stock: 4 },
      { id: "fifa26", label: "FIFA 2026 EA FC 26", price: 2.9, stock: 6 },
      { id: "fifa25", label: "FIFA 2025 EA FC 25", price: 1.9, stock: 4 },
      { id: "hogwarts", label: "HOGWARTS LEGACY", price: 1.9, stock: 3 },
      { id: "silksong", label: "HOLLOW KNIGHT SILKSONG", price: 1.9, stock: 2 },
      { id: "rdr2", label: "RED DEAD REDEMPTION 2", price: 1.9, stock: 4 },
      { id: "forza4", label: "FORZA HORIZON 4 TODAS AS DLCS", price: 1.9, stock: 1 },
    ],
  },
];

const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

function SteamPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const selected = useMemo(() => {
    for (const g of GROUPS) {
      const it = g.items.find((i) => i.id === selectedId);
      if (it) return it;
    }
    return null;
  }, [selectedId]);

  const total = selected ? selected.price * qty : 0;
  const variation = selected ? selected.label : "";
  const href = selected
    ? purchaseUrl({ product: "Steam", variation, quantity: qty, total })
    : "#";

  const handleAdd = () => {
    if (!selected) return;
    addItem({
      product: "Steam",
      variation,
      unitPrice: selected.price,
      quantity: qty,
      image: img,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <main className="container-tk pt-28 pb-16 ink-wash-enter relative z-10">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          <span className="seal" /> Categoria
        </div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-extralight">
          Steam — Keys e Jogos
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Melhor preço · Entrega imediata · Suporte 24h
        </p>
      </div>

      <article className="max-w-2xl mx-auto rounded-lg overflow-hidden border border-border bg-card">
        <div className="aspect-[16/9] bg-muted overflow-hidden fade-up stagger-1">
          <img src={img} alt="Steam" className="h-full w-full object-cover" loading="lazy" />
        </div>

        <div className="p-6 sm:p-10 flex flex-col gap-5">
          <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground fade-up stagger-2">
            Steam Keys
          </label>
          <div className="fade-up stagger-2">
            <StockListPicker
              groups={GROUPS}
              value={selectedId}
              onChange={(id) => { setSelectedId(id); setQty(1); }}
            />
          </div>

          {selected && (
            <div className="text-[13px] leading-relaxed fade-up" style={{ color: "#aaa" }}>
              <ul className="space-y-1">
                <li>• Key resgatável diretamente na Steam</li>
                <li>• Entrega digital em até 2h</li>
                <li>• Suporte 24h via WhatsApp</li>
                <li>• Estoque atual: {selected.stock} unidades</li>
              </ul>
            </div>
          )}

          {selected && (
            <>
              <div className="flex items-center justify-between gap-4 pt-2 fade-up stagger-4">
                <QuantitySelector value={qty} onChange={setQty} max={Math.max(1, selected.stock)} />
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{fmt(selected.price)} x {qty}</div>
                  <div key={total} className="text-2xl font-light text-primary price-flash">{fmt(total)}</div>
                </div>
              </div>

              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={triggerRipple}
                className="ripple-host inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition fade-up stagger-5"
              >
                <MessageCircle className="h-4 w-4" />
                Comprar via WhatsApp
              </a>

              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border transition fade-up stagger-5"
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

          <a
            href={whatsappUrl("Steam")}
            target="_blank"
            rel="noreferrer"
            className="text-center text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
          >
            Não encontrou o que procura? Fale no WhatsApp
          </a>
        </div>
      </article>
    </main>
  );
}
