import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
};

// Premium-style [-] N [+] selector. 40x40 buttons, dark fill, red hover.
export function QuantitySelector({ value, onChange, min = 1, max = 99 }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  const btn =
    "flex items-center justify-center transition-colors border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#e63946] hover:border-[#e63946] disabled:opacity-40 disabled:hover:bg-[#1a1a1a] disabled:hover:border-[#333]";

  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label="Quantidade">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Diminuir"
        className={btn}
        style={{ width: 40, height: 40, borderRadius: 6 }}
      >
        <Minus className="h-4 w-4" />
      </button>
      <div
        className="flex items-center justify-center border border-[#333] bg-[#1a1a1a] text-white"
        style={{ width: 48, height: 40, borderRadius: 6, fontSize: 18, fontWeight: 500 }}
        aria-live="polite"
      >
        {value}
      </div>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Aumentar"
        className={btn}
        style={{ width: 40, height: 40, borderRadius: 6 }}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
