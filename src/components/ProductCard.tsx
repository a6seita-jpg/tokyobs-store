import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { triggerRipple } from "@/lib/ripple";

const CARD_GLOW: Record<string, string> = {
  PS4: "#1476ff",
  PS5: "#1476ff",
  STEAM: "#1b74e4",
  NETFLIX: "#e50914",
  SPOTIFY: "#1ed760",
  "PRIME VIDEO": "#00a8e1",
  PARAMOUNT: "#0064ff",
  CRUNCHYROLL: "#ff7a00",
  "DISNEY+": "#113ccf",
};

export function ProductCard({ name }: { name: string }) {
  const reducedMotion = useReducedMotion();
  const themeColor = CARD_GLOW[name.toUpperCase()] ?? "#e63946";

  return (
    <Link
      to="/suporte"
      onClick={triggerRipple}
      className="ripple-host group relative isolate overflow-hidden rounded-md border border-white/10 bg-[#0A0A0A] p-4 text-white transition flex flex-col gap-2 hover:border-white/25"
      style={{ color: "#fff", backgroundColor: "#0A0A0A" }}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-12 -z-10 rounded-full blur-[55px]"
        style={{ backgroundColor: themeColor }}
        animate={reducedMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="text-xs tracking-widest uppercase text-white/65">PS4</span>
      <h4 className="min-h-[2.5rem] text-sm font-medium leading-tight text-white">{name}</h4>
      <span className="mt-2 text-xs text-white/90 group-hover:underline">Consultar preço →</span>
    </Link>
  );
}
