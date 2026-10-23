import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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

const KANJI = ["東", "京", "夢", "力", "星", "光", "龍", "月"];

export function HeroCarousel() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const next = SLIDES[(i + 1) % SLIDES.length];
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const go = (d: number) => setI((x) => (x + d + SLIDES.length) % SLIDES.length);

  return (
    <section className="container-tk pt-8 sm:pt-12">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[2fr_1fr]">
        <div
          className="group relative isolate aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] sm:aspect-[2/1]"
          style={{ boxShadow: "0 0 0 1px #2a0d12, 0 0 40px rgba(230,57,70,0.25)" }}
        >
          {!reducedMotion && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
              {KANJI.map((character, idx) => (
                <motion.span
                  key={character}
                  className="absolute top-[-12%] select-none font-mono text-lg text-white/20 sm:text-2xl"
                  style={{ left: `${8 + idx * 12}%` }}
                  animate={{ y: ["0%", "1250%"], opacity: [0, 0.5, 0.2, 0] }}
                  transition={{ duration: 10 + (idx % 4) * 2, repeat: Infinity, delay: idx * 1.1, ease: "linear" }}
                >
                  {character}
                </motion.span>
              ))}
            </div>
          )}
          <img
            src={slide.image}
            alt={slide.title}
            width={1600}
            height={800}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            key={slide.image}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
          <div className="absolute inset-0 z-[2] p-5 sm:p-10 flex flex-col justify-center max-w-[60%]">
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

          <button aria-label="Anterior" onClick={() => go(-1)} className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button aria-label="Próximo" onClick={() => go(1)} className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100">
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className="h-1.5 rounded-full transition-all"
                style={{ width: idx === i ? 22 : 8, background: idx === i ? "#e63946" : "rgba(255,255,255,0.5)" }}
              />
            ))}
          </div>
        </div>

        <Link
          to={next.to as never}
          className="group relative hidden aspect-[2/1] overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] lg:block lg:aspect-auto"
          style={{ boxShadow: "0 0 0 1px #2a0d12, 0 0 30px rgba(230,57,70,0.2)" }}
        >
          <img src={next.image} alt={next.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#e63946]">A seguir</div>
            <div className="mt-1 text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{next.title}</div>
            <span className="mt-3 inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold" style={{ background: "#e63946", color: "#fff" }}>
              {next.cta}
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
