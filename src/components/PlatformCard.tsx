import { Link } from "@tanstack/react-router";

type Props = {
  to: string;
  label: string;
  image: string;
  badge?: string;
};

export function PlatformCard({ to, label, image, badge }: Props) {
  return (
    <Link
      to={to as never}
      className="group relative aspect-[3/4] rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "#0a0a0a",
        borderColor: "#1f1f1f",
        boxShadow: "0 0 0 1px transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 1px #e63946, 0 10px 30px rgba(230,57,70,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 1px transparent";
      }}
    >
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
      <div className="absolute inset-x-0 bottom-0 p-3 text-center">
        <div className="text-lg font-bold text-white tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
          {label}
        </div>
        {badge && (
          <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "#e63946" }}>
            {badge}
          </div>
        )}
      </div>
    </Link>
  );
}
