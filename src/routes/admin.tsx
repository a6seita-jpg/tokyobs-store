import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Package, Clock, CheckCircle2, AlertTriangle, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { listOrders, updateOrder, subscribeOrders, STATUS_LABEL, type Order, type OrderStatus } from "@/lib/orders";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminChats } from "@/components/AdminChats";
import { listThreads, subscribeChat } from "@/lib/chat";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Admin — TOKYOBS" },
      { name: "description", content: "Painel administrativo TOKYOBS: pedidos e estatísticas." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel Admin — TOKYOBS" },
      { property: "og:description", content: "Pedidos e atendimento TOKYOBS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const STATUS_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  aguardando_pagamento: { bg: "rgba(234,179,8,0.15)", color: "#eab308" },
  em_analise: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  expirado: { bg: "rgba(239,68,68,0.15)", color: "#f87171" },
  entregue: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
};

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function AdminPage() {
  const { hydrated, user, isAdmin, isGuest, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"orders" | "chats">("orders");
  const [unread, setUnread] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos");
  const [comprovante, setComprovante] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !user && !isGuest) requireAuth("Acesso restrito ao administrador");
  }, [hydrated, user, isGuest, requireAuth]);

  useEffect(() => {
    if (!isAdmin) return;
    const refreshOrders = () => setOrders(listOrders());
    refreshOrders();
    return subscribeOrders(refreshOrders);
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const update = () => setUnread(listThreads().reduce((n, t) => n + t.unreadForAdmin, 0));
    update();
    return subscribeChat(update);
  }, [isAdmin]);

  const stats = useMemo(() => {
    const ativos = orders.filter((o) => o.status !== "expirado");
    return {
      total: orders.length,
      pendentes: orders.filter((o) => o.status === "aguardando_pagamento").length,
      emAnalise: orders.filter((o) => o.status === "em_analise").length,
      entregues: orders.filter((o) => o.status === "entregue").length,
      receita: ativos.reduce((s, o) => s + o.total, 0),
    };
  }, [orders]);

  if (!hydrated) return null;

  if (!user) {
    return (
      <main className="container-tk pt-32 pb-16 text-center ink-wash-enter">
        <h1 className="text-2xl font-light">Acesso restrito</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Entre com a conta de administrador para ver o painel.
        </p>
        <button
          onClick={() => requireAuth("Acesso restrito ao administrador")}
          className="mt-6 h-11 px-8 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90"
        >
          Fazer login
        </button>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="container-tk pt-32 pb-16 text-center ink-wash-enter">
        <AlertTriangle className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-3 text-2xl font-light">Área do administrador</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sua conta ({user.email}) não tem permissão de administrador.
        </p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-6 h-11 px-8 rounded-full border border-border hover:border-primary transition"
        >
          Voltar para a loja
        </button>
      </main>
    );
  }

  const visible = filter === "todos" ? orders : orders.filter((o) => o.status === filter);

  const setStatus = (id: string, status: OrderStatus) => {
    const updated = updateOrder(id, { status });
    if (!updated) return;
    setOrders(listOrders());
    toast.success(`Pedido ${id} → ${STATUS_LABEL[status]}`);
  };

  return (
    <main className="container-tk pt-28 pb-16 ink-wash-enter">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            <span className="seal" /> Admin
          </div>
          <h1 className="mt-2 text-3xl font-extralight">Painel de pedidos</h1>
        </div>
        <span className="text-xs text-muted-foreground">Logado como {user.email}</span>
      </div>

      <div role="tablist" aria-label="Painel administrativo" className="flex gap-2 border-b border-border pb-4 mb-6">
        <Button role="tab" aria-selected={tab === "orders"} variant={tab === "orders" ? "default" : "ghost"} onClick={() => setTab("orders")}>Pedidos</Button>
        <Button role="tab" aria-selected={tab === "chats"} variant={tab === "chats" ? "default" : "ghost"} onClick={() => setTab("chats")}>Chats {unread > 0 && <span className="bg-card text-primary rounded-full px-1.5 text-xs">{unread}</span>}</Button>
      </div>
      {tab === "chats" ? <AdminChats authorName={user.nickname} /> : <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon={<Package className="h-4 w-4" />} label="Pedidos" value={String(stats.total)} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Aguardando" value={String(stats.pendentes)} accent="#eab308" />
        <StatCard icon={<Eye className="h-4 w-4" />} label="Em análise" value={String(stats.emAnalise)} accent="#60a5fa" />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Receita ativa" value={brl(stats.receita)} accent="#4ade80" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["todos", "aguardando_pagamento", "em_analise", "entregue", "expirado"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="h-9 px-4 rounded-full text-xs border transition"
            style={
              filter === f
                ? { background: "#e63946", borderColor: "#e63946", color: "#fff" }
                : { background: "transparent", borderColor: "#2a2a2a", color: "#b3b3b3" }
            }
          >
            {f === "todos" ? "Todos" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum pedido {filter === "todos" ? "ainda" : `com status "${STATUS_LABEL[filter]}"`}.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm">{o.id}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(o.createdAt).toLocaleString("pt-BR")} · {o.buyer.nickname} ({o.buyer.email})
                  </p>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: STATUS_STYLE[o.status].bg, color: STATUS_STYLE[o.status].color }}
                >
                  {STATUS_LABEL[o.status]}
                </span>
              </div>

              <ul className="mt-3 text-sm text-foreground/80 flex flex-col gap-1">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span>{it.quantity}× {it.product}{it.variation ? ` — ${it.variation}` : ""}</span>
                    <span>{brl(it.unitPrice * it.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                <span className="font-semibold">Total: {brl(o.total)}</span>
                <div className="flex flex-wrap gap-2">
                  {o.comprovante && (
                    <button
                      onClick={() => setComprovante(o.comprovante ?? null)}
                      className="h-9 px-3 rounded-full text-xs border border-border hover:border-primary transition"
                    >
                      Ver comprovante
                    </button>
                  )}
                  {o.status === "em_analise" && (
                    <button
                      onClick={() => setStatus(o.id, "entregue")}
                      className="h-9 px-4 rounded-full text-xs font-semibold"
                      style={{ background: "#16a34a", color: "#fff" }}
                    >
                      Marcar como entregue
                    </button>
                  )}
                  {o.status === "aguardando_pagamento" && (
                    <button
                      onClick={() => setStatus(o.id, "em_analise")}
                      className="h-9 px-4 rounded-full text-xs font-semibold"
                      style={{ background: "#2563eb", color: "#fff" }}
                    >
                      Confirmar pagamento
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      </>}
      {/* Modal comprovante */}
      {comprovante && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setComprovante(null)}
        >
          <img
            src={comprovante}
            alt="Comprovante de pagamento"
            className="max-h-[80vh] max-w-full rounded-lg border border-border"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground" style={accent ? { color: accent } : undefined}>
        {icon}
        {label}
      </div>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
