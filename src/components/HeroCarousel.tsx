import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import promoSteam from "@/assets/hero/promo-steam.jpg";
import promoNetflix from "@/assets/hero/promo-netflix.jpg";
import promoSocial from "@/assets/hero/promo-social.jpg";
import promoPs4 from "@/assets/hero/promo-ps4.jpg";

type Slide = {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  to: string;
};

const SLIDES: Slide[] = [
  {
    image: promoSteam,
    title: "Combo Steam 7 Keys",
    subtitle: "Compre 1 leve 7 + 2 de brinde por R$ 9,90",
    cta: "Comprar agora",
    to: "/steam",
  },
  {
    image: promoNetflix,
    title: "Netflix 30 dias",
    subtitle: "Acesso premium 4K por apenas R$ 11,75",
    cta: "Assinar",
    to: "/streaming",
  },
  {
    image: promoSocial,
    title: "Seguidores e curtidas",
    subtitle: "Instagram e TikTok a partir de R$ 6,00",
    cta: "Quero mais alcance",
    to: "/redes-sociais",
  },
  {
    image: promoPs4,
    title: "PS4 Jogos Premium",
    subtitle: "Biblioteca completa em sua conta",
    cta: "Ver catálogo",
    to: "/ps4",
  },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const next = SLIDES[(i + 1) % SLIDES.length];

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const go = (d: number) => setI((x) => (x + d + SLIDES.length) % SLIDES.length);

  return (
    <section className="container-tk pt-8 sm:pt-12">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 sm:gap-4">
        {/* Main */}
        <div
          className="relative aspect-[16/9] sm:aspect-[2/1] rounded-xl overflow-hidden group"
          style={{ boxShadow: "0 0 0 1px #2a0d12, 0 0 40px rgba(230,57,70,0.25)" }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            width={1600}
            height={800}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            key={slide.image}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 p-5 sm:p-10 flex flex-col justify-center max-w-[60%]">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "var(--font-display)" }}>
              {slide.title}
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/85 max-w-md">
              {slide.subtitle}
            </p>
            <Link
              to={slide.to as never}
              className="mt-4 sm:mt-6 inline-flex w-fit h-10 sm:h-11 items-center px-5 rounded-full text-sm font-semibold transition hover:opacity-90"
              style={{ background: "#e63946", color: "#fff" }}
            >
              {slide.cta}
            </Link>
          </div>

          {/* Arrows */}
          <button
            aria-label="Anterior"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Próximo"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: idx === i ? 22 : 8,
                  background: idx === i ? "#e63946" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Side card (next promo preview) */}
        <Link
          to={next.to as never}
          className="relative hidden lg:block aspect-[2/1] lg:aspect-auto rounded-xl overflow-hidden group"
          style={{ boxShadow: "0 0 0 1px #2a0d12, 0 0 30px rgba(230,57,70,0.2)" }}
        >
          <img src={next.image} alt={next.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="text-xs uppercase tracking-widest text-[#e63946] font-semibold">A seguir</div>
            <div className="text-lg font-bold text-white mt-1" style={{ fontFamily: "var(--font-display)" }}>
              {next.title}
            </div>
            <button
              type="button"
              className="mt-3 h-8 px-3 rounded-full text-xs font-semibold"
              style={{ background: "#e63946", color: "#fff" }}
            >
              {next.cta}
            </button>
          </div>
        </Link>
      </div>
    </section>
  );
}
