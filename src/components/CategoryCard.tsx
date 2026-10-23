import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { triggerRipple } from "@/lib/ripple";

type Props = {
  to: string;
  label: string;
  image: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  PARAMOUNT: "#0064FF",
  NETFLIX: "#E50914",
  SPOTIFY: "#1ED760",
  "PRIME VIDEO": "#00A8E1",
  CRUNCHYROLL: "#FF7A00",
  "DISNEY+": "#113CCF",
  STEAM: "#1B74E4",
};

export function CategoryCard({ to, label, image }: Props) {
  const reducedMotion = useReducedMotion();
  const themeColor = CATEGORY_COLORS[label.toUpperCase()] ?? "#e63946";

  return (
    <Link
      to={to}
      onClick={triggerRipple}
      className="ripple-host group relative isolate aspect-[2/1] overflow-hidden rounded-lg border border-white/10 bg-[#0A0A0A] text-white category-hover"
      style={{ backgroundColor: "#0A0A0A", color: "#fff" }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-12 z-0 rounded-full blur-[65px]"
        style={{ backgroundColor: themeColor }}
        animate={reducedMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.12, 0.24, 0.12] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-1" style={{ background: "#e63946" }} />
          <h3 className="text-sm font-semibold tracking-wide text-white sm:text-base" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
            {label}
          </h3>
        </div>
      </div>
    </Link>
  );
}
