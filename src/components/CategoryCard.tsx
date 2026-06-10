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
      className="ripple-host group relative aspect-square overflow-hidden rounded-md border border-border bg-card category-hover"
    >
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <div className="flex items-center gap-1.5">
          <span className="seal" />
          <h3 className="text-sm sm:text-base font-light tracking-wide">{label}</h3>
        </div>
      </div>
    </Link>
  );
}
