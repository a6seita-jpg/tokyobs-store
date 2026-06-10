import { Link } from "@tanstack/react-router";
import { triggerRipple } from "@/lib/ripple";

type Props = {
  to: string;
  label: string;
  image: string;
};

export function CategoryCard({ to, label, image }: Props) {
  return (
    <Link
      to={to}
      onClick={triggerRipple}
      className="ripple-host group relative aspect-[2/1] overflow-hidden rounded-lg border bg-card category-hover"
      style={{ borderColor: "#1a1a1a" }}
    >
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1 h-4" style={{ background: "#e63946" }} />
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            {label}
          </h3>
        </div>
      </div>
    </Link>
  );
}
