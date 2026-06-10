import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type CartItem = {
  id: string;          // unique key: product+variation
  product: string;
  variation: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

type CartCtx = {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  /** When set, triggers a brief badge bump animation in the header. */
  bumpKey: number;
};

const Ctx = createContext<CartCtx>(null as never);
const KEY = "tk-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartCtx["addItem"] = (raw) => {
    const id = raw.id ?? `${raw.product}::${raw.variation}`;
    setItems((curr) => {
      const idx = curr.findIndex((x) => x.id === id);
      if (idx >= 0) {
        const next = [...curr];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + raw.quantity };
        return next;
      }
      return [...curr, { ...raw, id }];
    });
    setBumpKey((k) => k + 1);
    toast.success("Produto adicionado!", {
      description: `${raw.product} — ${raw.variation}`,
    });
  };

  const updateQty: CartCtx["updateQty"] = (id, qty) => {
    setItems((curr) =>
      curr
        .map((x) => (x.id === id ? { ...x, quantity: Math.max(1, qty) } : x))
    );
  };

  const removeItem: CartCtx["removeItem"] = (id) => {
    setItems((curr) => curr.filter((x) => x.id !== id));
  };

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((s, x) => s + x.quantity, 0);
  const totalPrice = items.reduce((s, x) => s + x.quantity * x.unitPrice, 0);

  const value = useMemo<CartCtx>(() => ({
    items, totalCount, totalPrice,
    isOpen, openCart: () => setOpen(true), closeCart: () => setOpen(false),
    addItem, updateQty, removeItem, clearCart, bumpKey,
  }), [items, totalCount, totalPrice, isOpen, bumpKey]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx);

/** Format helper shared with components. */
export const fmtBRL = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

/** Build the WhatsApp finalize link from a cart. */
const PHONE = "5573988810368";
export function buildCartWhatsAppUrl(items: CartItem[], total: number) {
  const lines = items.map(
    (i) => `${i.quantity}x ${i.product} - ${i.variation} - ${fmtBRL(i.unitPrice * i.quantity)}`,
  );
  const msg =
    `OLÁ TOKYOBS\n\n` +
    `Meu pedido:\n` +
    `${lines.join("\n")}\n\n` +
    `Total: ${fmtBRL(total)}\n` +
    `Forma de pagamento: Pix`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}
