import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type StockItem = {
  id: string;
  label: string;
  price: number;
  stock: number;
};

export type StockGroup = {
  title: string;
  items: StockItem[];
};

type Props = {
  groups: StockGroup[];
  value: string | null;
  onChange: (id: string) => void;
  placeholder?: string;
};

const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

export function StockListPicker({ groups, value, onChange, placeholder = "Escolha um produto" }: Props) {
  const [open, setOpen] = useState(false);
  const allItems = groups.flatMap((g) => g.items);
  const selected = allItems.find((i) => i.id === value) ?? null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 h-12 px-4 rounded-md border bg-[#1a1a2e] text-white transition"
        style={{ borderColor: selected ? "#ffd700" : "#333" }}
      >
        <span className="text-sm truncate">
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          {selected && <span className="text-sm font-semibold">{fmt(selected.price)}</span>}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="mt-2 max-h-[420px] overflow-y-auto rounded-md border border-[#333] bg-[#0f0f1a] fade-up">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#888] bg-[#13131f] border-b border-[#222]">
                {g.title}
              </div>
              {g.items.map((it) => {
                const isSel = it.id === value;
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => {
                      onChange(it.id);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left border-b border-[#1c1c2a] hover:bg-[#1a1a2e] transition"
                    style={{
                      borderLeft: isSel ? "3px solid #ffd700" : "3px solid transparent",
                      background: isSel ? "#1a1a2e" : "transparent",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white truncate">{it.label}</div>
                      <div className="text-[11px] text-[#888] mt-0.5">{it.stock} em estoque</div>
                    </div>
                    <div className="text-sm font-semibold text-white shrink-0">{fmt(it.price)}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
