import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Zap, Shield, Headphones } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PlatformCard } from "@/components/PlatformCard";
import { SearchBar } from "@/components/SearchBar";
import { FaqSection } from "@/components/FaqSection";
import { GridSkeleton } from "@/components/Skeleton";
import { StarSummary } from "@/components/StarRating";
import { useReviewStats } from "@/hooks/useReviews";

import catPs4 from "@/assets/banners/ps4.jpg";
import catEpic from "@/assets/banners/epic.jpg";
import catSteam from "@/assets/banners/steam.jpg";
import catRedes from "@/assets/banners/redes-sociais.jpg";
import catNetflix from "@/assets/banners/netflix.jpg";
import catHulu from "@/assets/banners/hulu.jpg";
import catYoutube from "@/assets/banners/youtube.jpg";
import catSpotify from "@/assets/banners/spotify.jpg";
import catCrunchy from "@/assets/banners/crunchyroll.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Sua loja gamer & streaming" },
      { name: "description", content: "Steam, PS4, Epic Games, Netflix, YouTube, Redes Sociais e muito mais. Preço justo, entrega rápida, suporte 24h." },
      { property: "og:title", content: "TOKYOBS" },
      { property: "og:description", content: "Sua loja gamer & streaming." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

const PLATFORMS = [
  { to: "/steam", label: "STEAM", image: catSteam, badge: "Keys & Jogos" },
  { to: "/ps4", label: "PS4", image: catPs4, badge: "PlayStation" },
  { to: "/ps5", label: "EPIC GAMES", image: catEpic, badge: "PC Games" },
  { to: "/redes-sociais", label: "REDES SOCIAIS", image: catRedes, badge: "Insta + TikTok" },
];

type Featured = {
  id: string; // matches review product_id format used on pages
  title: string;
  image: string;
  oldPrice: number;
  price: number;
  category: "Assinaturas" | "Steam" | "Redes Sociais" | "PS4";
  to: string;
};

const FEATURED: Featured[] = [
  { id: "steam:promo-1-7", title: "Combo Steam 7 Keys + 2 Brinde", image: catSteam, oldPrice: 39.9, price: 9.9, category: "Steam", to: "/steam" },
  { id: "streaming:netflix", title: "Netflix 30 dias 4K", image: catNetflix, oldPrice: 29.9, price: 11.75, category: "Assinaturas", to: "/streaming" },
  { id: "streaming:hulu", title: "Hulu + Star+ + ESPN", image: catHulu, oldPrice: 35.0, price: 11.0, category: "Assinaturas", to: "/streaming" },
  { id: "streaming:youtube", title: "YouTube Premium + Music", image: catYoutube, oldPrice: 24.9, price: 11.9, category: "Assinaturas", to: "/streaming" },
  { id: "streaming:crunchyroll", title: "Crunchyroll Mega Fan 30d", image: catCrunchy, oldPrice: 28.0, price: 11.0, category: "Assinaturas", to: "/streaming" },
  { id: "streaming:spotify", title: "Spotify Premium", image: catSpotify, oldPrice: 21.9, price: 11.0, category: "Assinaturas", to: "/streaming" },
  { id: "steam:rand-200", title: "Key Steam R$200,00+", image: catSteam, oldPrice: 39.9, price: 19.9, category: "Steam", to: "/steam" },
  { id: "steam:triplea", title: "Key Steam Triple A", image: catSteam, oldPrice: 79.9, price: 29.92, category: "Steam", to: "/steam" },
];

function Home() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="ink-wash-enter relative z-10">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Trust strip */}
      <section className="container-tk mt-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 rounded-xl p-3 sm:p-4" style={{ background: "rgba(20,20,20,0.6)", border: "1px solid #1f1f1f" }}>
          <TrustItem icon={<Zap className="h-4 w-4" />} label="Entrega rápida" sub="Até 2 horas" />
          <TrustItem icon={<Shield className="h-4 w-4" />} label="100% seguro" sub="Garantia total" />
          <TrustItem icon={<Headphones className="h-4 w-4" />} label="Suporte 24h" sub="Atendimento no site" />
        </div>
      </section>

      {/* Search */}
      <div className="mt-8">
        <SearchBar />
      </div>

      {/* Featured Platforms */}
      <section className="container-tk pt-10">
        <SectionTitle title="Plataformas em destaque" subtitle="Catálogo principal" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
          {PLATFORMS.map((p) => (
            <PlatformCard key={p.to} {...p} />
          ))}
        </div>
      </section>

      {/* Categorias produtos */}
      <section className="container-tk relative isolate pt-14 pb-20">
        <div aria-hidden="true" className="pointer-events-none absolute -z-10 left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-red-600/25 blur-[100px] sm:h-80 sm:w-80" />
        <SectionTitle title="Categorias do catálogo" subtitle="Produtos populares" />
        <CategoryTabs />
        {loading ? (
          <div className="mt-5">
            <GridSkeleton count={8} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
            {FEATURED.map((p) => (
              <FeaturedCard key={p.id} item={p} />
            ))}
          </div>
        )}
      </section>

      <FaqSection />
    </main>
  );
}

function TrustItem({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="h-9 w-9 grid place-items-center rounded-full shrink-0" style={{ background: "#e63946", color: "#fff" }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs sm:text-sm font-semibold truncate">{label}</div>
        <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{sub}</div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h2>
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-1">{subtitle}</div>
      </div>
      <div className="hidden sm:flex gap-1">
        <button aria-label="anterior" className="h-8 w-8 grid place-items-center rounded-md border" style={{ borderColor: "#2a2a2a", color: "#999" }}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button aria-label="próximo" className="h-8 w-8 grid place-items-center rounded-md border" style={{ borderColor: "#2a2a2a", color: "#999" }}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const TABS = ["Todos", "Assinaturas", "Steam", "Redes Sociais", "PS4"] as const;

function CategoryTabs() {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {TABS.map((t, i) => {
        const active = i === 0;
        return (
          <button
            key={t}
            className="h-8 px-4 rounded-full text-xs font-medium transition"
            style={{
              background: active ? "#e63946" : "transparent",
              border: active ? "1px solid #e63946" : "1px solid #2a2a2a",
              color: active ? "#fff" : "#aaa",
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

function FeaturedCard({ item }: { item: Featured }) {
  const { avg, count } = useReviewStats(item.id);
  const off = Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100);
  const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;
  return (
    <Link
      to={item.to as never}
      className="group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "#0a0a0a",
        borderColor: "#1f1f1f",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 1px #e63946, 0 10px 30px rgba(230,57,70,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {off > 0 && (
          <div
            className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ background: "#e63946", color: "#fff" }}
          >
            -{off}%
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.category}</div>
        <h3 className="text-sm font-semibold leading-tight line-clamp-2">{item.title}</h3>
        <StarSummary avg={avg} count={count} />
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="text-xs line-through text-muted-foreground">{fmt(item.oldPrice)}</div>
          <div
            className="text-sm font-bold px-2.5 py-1 rounded"
            style={{ background: "#e63946", color: "#fff" }}
          >
            {fmt(item.price)}
          </div>
        </div>
      </div>
    </Link>
  );
}
