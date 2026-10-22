import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useCart, fmtBRL } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { createOrder } from "@/lib/orders";
import { useState } from "react";
import { toast } from "sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Carrinho" },
      { name: "description", content: "Revise seu pedido e finalize com Pix na TOKYOBS." },
      { property: "og:title", content: "TOKYOBS — Carrinho" },
      { property: "og:description", content: "Revise seu pedido e finalize com Pix na TOKYOBS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CarrinhoPage,
});

function CarrinhoPage() {
  const { items, updateQty, removeItem, clearCart, totalPrice, totalCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const finalize = async () => {
    if (items.length === 0) return;
    const buyer = user
      ? { email: user.email, nickname: user.nickname }
      : { email: "convidado@tokyobs.store", nickname: "Convidado" };
    setSaving(true);
    try {
      const order = await createOrder(items, totalPrice, buyer);
      clearCart();
      await navigate({ to: "/checkout/pix", search: { order: order.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o pedido.");
    } finally { setSaving(false); }
  };

  return (
    <main className="container-tk pt-28 pb-20 ink-wash-enter relative z-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          <span className="seal" /> Pedido
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extralight">Seu Carrinho</h1>
      </div>

      {items.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 fade-up">
          <p className="text-muted-foreground mb-6">Carrinho vazio. Explore o catálogo e monte seu pedido.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="flex flex-col gap-3">
            {items.map((it, i) => (
              <motion.li
                key={it.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex gap-3 p-4 rounded-lg border border-border bg-card"
              >
                <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden bg-muted grid place-items-center">
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
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm w-6 text-center">{it.quantity}</span>
                    <button
                      onClick={() => updateQty(it.id, it.quantity + 1)}
                      className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-muted"
                      aria-label="Aumentar quantidade"
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
                  aria-label="Remover item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.li>
            ))}
          </ul>

          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="rounded-lg border border-border bg-card p-6 h-fit lg:sticky lg:top-24"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Total ({totalCount})
              </span>
              <span className="text-2xl font-light text-primary">{fmtBRL(totalPrice)}</span>
            </div>
            <button
              onClick={finalize}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              <Zap className="h-4 w-4" />
              {saving ? "Criando pedido..." : "Finalizar com Pix"}
            </button>
            <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              Pagamento instantâneo via Pix. Você terá 15 minutos para concluir após gerar o código.
            </div>
          </motion.aside>
        </div>
      )}
    </main>
  );
}
