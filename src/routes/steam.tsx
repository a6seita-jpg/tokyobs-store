import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, ShoppingCart, Check } from "lucide-react";
import { triggerRipple } from "@/lib/ripple";
import { purchaseUrl, whatsappUrl } from "@/lib/whatsapp";
import { QuantitySelector } from "@/components/QuantitySelector";
import { useCart } from "@/hooks/useCart";
import img from "@/assets/cat-ps5.jpg";

export const Route = createFileRoute("/steam")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Steam · Jogos e Gift Cards" },
      { name: "description", content: "Jogos Steam e Gift Cards com entrega rápida. Atendimento humano via WhatsApp." },
      { property: "og:title", content: "TOKYOBS Steam" },
      { property: "og:image", content: img },
    ],
  }),
  component: SteamPage,
});

type Game = { name: string; price: number };

const GAMES: Game[] = [
  { name: "Baldurs Gate 3", price: 45 },
  { name: "Counter-Strike 2", price: 15 },
  { name: "Cyberpunk 2077", price: 35 },
  { name: "Dota 2 — Pacote de itens", price: 8 },
  { name: "Elden Ring", price: 55 },
  { name: "Grand Theft Auto V", price: 25 },
  { name: "Hades", price: 18 },
  { name: "Hogwarts Legacy", price: 40 },
  { name: "Hollow Knight", price: 12 },
  { name: "Lethal Company", price: 10 },
  { name: "Palworld", price: 22 },
  { name: "Phasmophobia", price: 14 },
  { name: "Portal 2", price: 9 },
  { name: "Red Dead Redemption 2", price: 50 },
  { name: "Rust", price: 20 },
  { name: "Sons of the Forest", price: 18 },
  { name: "Stardew Valley", price: 10 },
  { name: "Terraria", price: 8 },
  { name: "The Witcher 3", price: 15 },
  { name: "Valorant — Pacote VP", price: 12 },
  { name: "Wallpaper Engine", price: 6 },
].sort((a, b) => a.name.localeCompare(b.name));

const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

function SteamPage() {
  const [selected, setSelected] = useState<string>(GAMES[0].name);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const game = useMemo(() => GAMES.find((g) => g.name === selected) ?? GAMES[0], [selected]);
  const total = game.price * qty;
  const variation = `${game.name} (Steam Key / Gift)`;

  const href = purchaseUrl({ product: "Steam", variation, quantity: qty, total });

  const handleAdd = () => {
    addItem({
      product: "Steam",
      variation,
      unitPrice: game.price,
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
          Steam — Jogos e Gift Cards
        </h1>
      </div>

      <article className="max-w-2xl mx-auto rounded-lg overflow-hidden border border-border bg-card">
        <div className="aspect-[16/9] bg-muted overflow-hidden fade-up stagger-1">
          <img src={img} alt="Steam" className="h-full w-full object-cover" loading="lazy" />
        </div>

        <div className="p-6 sm:p-10 flex flex-col gap-5">
          <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground fade-up stagger-2">
            Selecione o jogo
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full h-12 px-3 rounded-md border border-input bg-background text-foreground focus:border-primary outline-none fade-up stagger-2"
          >
            {GAMES.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name} — {fmt(g.price)}
              </option>
            ))}
          </select>

          <p className="text-sm text-muted-foreground leading-relaxed fade-up stagger-3">
            Entrega via Steam Key ou Gift. Ativável globalmente. Entrega até 2h.
            Não encontrou o jogo? Consulte outros títulos no WhatsApp.
          </p>

          <div className="flex items-center justify-between gap-4 pt-2 fade-up stagger-4">
            <QuantitySelector value={qty} onChange={setQty} />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Total</div>
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

          <a
            href={whatsappUrl("Steam")}
            target="_blank"
            rel="noreferrer"
            className="text-center text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
          >
            Não encontrou o jogo? Consulte outros títulos no WhatsApp
          </a>
        </div>
      </article>
    </main>
  );
}
