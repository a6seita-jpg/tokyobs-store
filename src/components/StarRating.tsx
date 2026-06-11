import { Star } from "lucide-react";
import { useState } from "react";

type Props = {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
  className?: string;
};

export function StarRating({ value, size = 16, onChange, className = "" }: Props) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;
  const display = hover || value;

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        const half = !filled && n - 0.5 <= display;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => onChange?.(n)}
            className={interactive ? "cursor-pointer hover:scale-110 transition" : "cursor-default"}
            aria-label={`${n} estrelas`}
          >
            <Star
              style={{ width: size, height: size }}
              className={filled || half ? "fill-[#ffb400] stroke-[#ffb400]" : "stroke-[#555]"}
            />
          </button>
        );
      })}
    </div>
  );
}

export function StarSummary({ avg, count, size = 14 }: { avg: number; count: number; size?: number }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <StarRating value={Math.round(avg)} size={size} />
      <span className="text-xs text-muted-foreground">
        {count > 0 ? `${avg.toFixed(1)} (${count})` : "Sem avaliações"}
      </span>
    </div>
  );
}
