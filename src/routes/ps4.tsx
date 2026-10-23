import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { triggerRipple } from "@/lib/ripple";
import ps4Hero from "@/assets/banners/ps4.jpg";

export const Route = createFileRoute("/ps4")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — PS4 · Catálogo sob consulta" },
      { name: "description", content: "Catálogo PS4 com 161+ títulos. Mídia digital imediata." },
      { property: "og:title", content: "TOKYOBS PS4 — Catálogo sob consulta" },
      { property: "og:description", content: "161+ títulos PS4 em mídia digital." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ps4Page,
});

const GAMES = [
  "GTA V", "God of War Ragnarok", "Elden Ring", "Spider-Man 2",
  "FC 25", "Hogwarts Legacy", "The Last of Us Part 2", "Red Dead Redemption 2",
  "Cyberpunk 2077", "Resident Evil 4 Remake", "Call of Duty MW3", "Assassin's Creed Mirage",
];

function Ps4Page() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="container-tk pt-28 pb-12 ink-wash-enter">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          <span className="seal" /> PlayStation 4
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extralight">Catálogo PS4</h1>
      </div>

      <article className="max-w-3xl mx-auto rounded-lg overflow-hidden border border-border bg-card fade-up stagger-1">
        <div className="grid md:grid-cols-2">
          <div className="aspect-square md:aspect-auto bg-muted overflow-hidden">
            <img src={ps4Hero} alt="DualShock 4 e torii" className="h-full w-full object-cover" />
          </div>
          <div className="p-6 sm:p-8 flex flex-col items-start gap-4">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase bg-primary/10 text-primary px-3 py-1 rounded-full">
              Membro TOKYOBS tem prioridade
            </span>
            <h2 className="text-2xl sm:text-3xl font-light leading-tight">
              Catálogo PS4 Completo
            </h2>
            <p className="text-muted-foreground">
              161+ títulos disponíveis. Mídia digital imediata.
            </p>
            <div>
              <span className="block text-xs tracking-widest uppercase text-muted-foreground">Preço</span>
              <span className="text-4xl sm:text-5xl font-light text-primary tracking-tight">
                Sob consulta
              </span>
            </div>
            <Link
              to="/suporte"
              onClick={triggerRipple}
              className="ripple-host w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Consultar Disponibilidade
            </Link>
          </div>
        </div>
      </article>

      <section className="mt-16">
        <div className="flex items-end justify-between mb-6">
          <h3 className="text-xl font-light">Alguns títulos</h3>
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Vitrine</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {GAMES.map((g) => <ProductCard key={g} name={g} />)}
          </div>
        )}
        <p className="mt-8 text-center text-muted-foreground">
          + <span className="text-primary font-medium">149 títulos</span> disponíveis no catálogo completo
        </p>
      </section>
    </main>
  );
}
