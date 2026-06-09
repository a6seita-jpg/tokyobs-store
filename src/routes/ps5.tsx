import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { triggerRipple } from "@/lib/ripple";
import { purchaseUrl, whatsappUrl } from "@/lib/whatsapp";
import { QuantitySelector } from "@/components/QuantitySelector";
import img from "@/assets/cat-ps5.jpg";

// EPIC GAMES page (mounted at /ps5 to preserve existing route tree).
export const Route = createFileRoute("/ps5")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Epic Games · Full Acesso + Email" },
      { name: "description", content: "Jogos Epic Games com conta + email. Full acesso, entrega rápida." },
      { property: "og:title", content: "TOKYOBS Epic Games" },
      { property: "og:image", content: img },
    ],
  }),
  component: EpicGamesPage,
});

type Game = { name: string; price: number };

const GAMES: Game[] = [
  { name: "Alien Isolation", price: 8 },
  { name: "ARK Survival", price: 10 },
  { name: "Beyond Blue", price: 8 },
  { name: "Borderlands 3", price: 8 },
  { name: "Cities Skylines", price: 9 },
  { name: "F1 Manager 2024", price: 10 },
  { name: "Fallout 3 GOTY", price: 8 },
  { name: "Fallout New Vegas Ultimate", price: 8 },
  { name: "Farming Simulator 19", price: 15 },
  { name: "Farming Simulator 22", price: 10 },
  { name: "Football Manager 2020", price: 9 },
  { name: "Football Manager 2024", price: 20 },
  { name: "Frostpunk", price: 8 },
  { name: "Hell Let Loose", price: 10 },
  { name: "Ghostrunner", price: 8 },
  { name: "Ghostwire: Tokyo", price: 9 },
  { name: "GTA V", price: 85 },
  { name: "Jurassic World Evolution", price: 8 },
  { name: "Killing Floor 2", price: 8 },
  { name: "Lego Star Wars Skywalker Saga", price: 9 },
  { name: "MudRunner", price: 8 },
  { name: "Marvels Guardians of the Galaxy", price: 9 },
  { name: "NBA 2K21", price: 10 },
  { name: "Nioh: The Complete Edition", price: 10 },
  { name: "Overcooked! + Overcooked 2", price: 11 },
  { name: "PC Building Simulator", price: 11 },
  { name: "Sid Meiers Civilization VI", price: 10 },
  { name: "Star Wars Battlefront II Celebration", price: 10 },
  { name: "Stranded Deep", price: 10 },
  { name: "The Hunter Call of the Wild", price: 9 },
  { name: "The Outer Worlds Spacers", price: 9 },
].sort((a, b) => a.name.localeCompare(b.name));

const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

function EpicGamesPage() {
  const [selected, setSelected] = useState<string>(GAMES[0].name);
  const [qty, setQty] = useState(1);

  const game = useMemo(() => GAMES.find((g) => g.name === selected) ?? GAMES[0], [selected]);
  const total = game.price * qty;

  const href = purchaseUrl({
    product: "Epic Games",
    variation: `${game.name} (Full Acesso + Email)`,
    quantity: qty,
    total,
  });

  return (
    <main className="container-tk pt-28 pb-16 ink-wash-enter relative z-10">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          <span className="seal" /> Categoria
        </div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-extralight">
          🎮 EPIC GAMES - Full Acesso + Email
        </h1>
      </div>

      <article className="max-w-2xl mx-auto rounded-lg overflow-hidden border border-border bg-card">
        <div className="aspect-[16/9] bg-muted overflow-hidden">
          <img src={img} alt="Epic Games" className="h-full w-full object-cover" loading="lazy" />
        </div>

        <div className="p-6 sm:p-10 flex flex-col gap-5">
          <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Selecione o jogo
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full h-12 px-3 rounded-md border border-input bg-background text-foreground focus:border-primary outline-none"
          >
            {GAMES.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name} — {fmt(g.price)}
              </option>
            ))}
          </select>

          <p className="text-sm text-muted-foreground leading-relaxed">
            ⚠ Conta com e-mail. Você pode trocar o e-mail após 30/90 dias. Entrega até 24h.
            Não encontrou o jogo? Consulte outros títulos no WhatsApp
          </p>

          <div className="flex items-center justify-between gap-4 pt-2">
            <QuantitySelector value={qty} onChange={setQty} />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Total</div>
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

          <a
            href={whatsappUrl("Epic Games")}
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
