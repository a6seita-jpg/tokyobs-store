import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import { SearchBar } from "@/components/SearchBar";
import { FaqSection } from "@/components/FaqSection";
import { GridSkeleton } from "@/components/Skeleton";
import catPs4 from "@/assets/banners/ps4.jpg";
import catEpic from "@/assets/banners/epic.jpg";
import catStreaming from "@/assets/banners/netflix.jpg";
import catSteam from "@/assets/banners/steam.jpg";
import catRedes from "@/assets/banners/redes-sociais.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — O que você procura, a gente tem" },
      { name: "description", content: "Variedade, preço justo e entrega rápida. Catálogo PS4, Epic Games, Streaming, Steam e Redes Sociais." },
      { property: "og:title", content: "TOKYOBS" },
      { property: "og:description", content: "O que você procura, a gente tem." },
    ],
  }),
  component: Home,
});

const CATEGORIES = [
  { to: "/ps4", label: "PS4", image: catPs4, guarded: true },
  { to: "/ps5", label: "Epic Games", image: catEpic },
  { to: "/streaming", label: "Assinaturas", image: catStreaming },
  { to: "/steam", label: "Steam", image: catSteam },
  { to: "/redes-sociais", label: "Redes Sociais", image: catRedes },
];

function Home() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="ink-wash-enter">
      {/* Hero */}
      <section className="relative">
        <div className="container-tk pt-16 sm:pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.4em] uppercase text-muted-foreground">
            <span className="seal" /> 東京 · TOKYOBS
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-extralight leading-tight max-w-4xl mx-auto">
            O que você procura,
            <br />
            <span className="text-primary">a gente tem.</span>
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed">
            Variedade, preço justo e entrega rápida. Fale conosco e encontre o que você precisa.
          </p>
        </div>
      </section>

      {/* Search bar */}
      <SearchBar />

      {/* Categories grid */}
      <section className="container-tk pb-20">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-light">Categorias</h2>
          <span className="text-xs text-muted-foreground tracking-widest uppercase">Catálogo</span>
        </div>
        {loading ? (
          <GridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {CATEGORIES.map((c) => (
              <CategoryCard key={c.to} {...c} />
            ))}
          </div>
        )}
      </section>

      {/* FAQ before footer */}
      <FaqSection />
    </main>
  );
}
