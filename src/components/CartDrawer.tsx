import { Link } from "@tanstack/react-router";
import { X, Trash2, Zap, Plus, Minus } from "lucide-react";
import { useCart, fmtBRL } from "@/hooks/useCart";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, totalPrice, totalCount } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden={!isOpen}
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />
      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 z-[71] h-full w-full sm:w-[400px] bg-card border-l border-border shadow-2xl flex flex-col"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-out",
        }}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between px-5 h-14 border-b border-border">
          <div>
            <div className="text-xs tracking-[0.3em] text-muted-foreground uppercase">TOKYOBS</div>
            <div className="text-base font-light">Seu Pedido</div>
          </div>
          <button
            onClick={closeCart}
            aria-label="Fechar"
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full grid place-items-center text-center text-muted-foreground">
              <div>
                <div className="text-3xl mb-2">⌛</div>
                <p>Carrinho vazio.<br />Adicione produtos</p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex gap-3 p-3 rounded-md border border-border bg-background"
                  style={{ animation: "fade-up 0.25s ease-out both" }}
                >
                  <div
                    className="h-12 w-12 shrink-0 rounded-md overflow-hidden bg-muted grid place-items-center"
                  >
                    {it.image ? (
                      <img src={it.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="seal" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-light truncate">{it.product}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{it.variation}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(it.id, it.quantity - 1)}
                        className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted"
                        disabled={it.quantity <= 1}
                        aria-label="Menos"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm w-6 text-center">{it.quantity}</span>
                      <button
                        onClick={() => updateQty(it.id, it.quantity + 1)}
                        className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted"
                        aria-label="Mais"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <div className="ml-auto text-sm text-primary">
                        {fmtBRL(it.unitPrice * it.quantity)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-primary"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-border px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Total ({totalCount})
            </span>
            <span className="text-xl font-light text-primary">{fmtBRL(totalPrice)}</span>
          </div>
          <Link
            to="/carrinho"
            onClick={closeCart}
            aria-disabled={items.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
            style={{ opacity: items.length === 0 ? 0.5 : 1, pointerEvents: items.length === 0 ? "none" : "auto" }}
          >
            <Zap className="h-4 w-4" />
            Finalizar com Pix
          </Link>
        </footer>
      </aside>
    </>
  );
}
