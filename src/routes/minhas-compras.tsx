import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, Package, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { listOrders, STATUS_LABEL, type Order } from "@/lib/orders";
import { listThreads, reopenOrderChat, subscribeChat, type ChatThread } from "@/lib/chat";
import { ChatPanel } from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/minhas-compras")({
  head: () => ({ meta: [{ title: "Minhas compras — TOKYOBS" }, { name: "robots", content: "noindex" }] }),
  component: PurchasesPage,
});

const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (v: number) => new Date(v).toLocaleDateString("pt-BR");

function PurchasesPage() {
  const { hydrated, user, requireAuth } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [busyOrder, setBusyOrder] = useState<string | null>(null);

  const refresh = async () => {
    if (!user) return;
    try {
      const [o, t] = await Promise.all([listOrders(), listThreads()]);
      setOrders(o);
      setThreads(t.filter((thread) => thread.kind === "order"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar suas compras.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { setLoading(false); return; }
    void refresh();
    const unsubscribe = subscribeChat(() => { void refresh(); });
    return unsubscribe;
  }, [hydrated, user?.email]);

  const openOrReopen = async (order: Order) => {
    setBusyOrder(order.id);
    try {
      const existing = threads.filter((t) => t.orderId === order.id).sort((a,b) => b.updatedAt-a.updatedAt)[0];
      if (existing?.status === "aberto") {
        setActiveThread(existing.id);
      } else {
        const id = await reopenOrderChat(order.id, user?.nickname ?? "");
        await refresh();
        setActiveThread(id);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível abrir o atendimento.");
    } finally { setBusyOrder(null); }
  };

  if (!hydrated || loading) return <main className="container-tk pt-32 pb-16"><div className="h-32 animate-pulse rounded-xl bg-muted" /></main>;
  if (!user) return <main className="container-tk pt-32 pb-16 text-center"><Package className="mx-auto h-9 w-9 text-primary" /><h1 className="mt-4 text-2xl">Entre para ver suas compras</h1><p className="mt-2 text-sm text-muted-foreground">Seu histórico e os atendimentos ficam vinculados à sua conta.</p><Button className="mt-5" onClick={() => requireAuth("Entre para acessar suas compras")}>Fazer login</Button></main>;

  return <main className="container-tk min-h-[70vh] pt-28 pb-16">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[.25em] text-primary">TOKYOBS / CONTA</p><h1 className="mt-2 text-3xl font-semibold">Minhas compras</h1><p className="mt-2 text-sm text-muted-foreground">Consulte seus pedidos e continue o atendimento de cada compra.</p></div><Link to="/perfil" className="text-sm text-primary hover:underline">Meu perfil</Link></div>
    {error && <p role="alert" className="mb-4 rounded-lg border border-destructive/40 p-3 text-sm text-destructive">{error}</p>}
    {orders.length === 0 ? <section className="rounded-xl border border-border bg-card p-8 text-center"><Package className="mx-auto h-8 w-8 text-muted-foreground"/><p className="mt-3">Você ainda não tem compras salvas.</p><Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">Explorar a loja</Link></section> :
    <div className="grid gap-4">{orders.map((order) => {
      const orderThreads = threads.filter((t) => t.orderId === order.id).sort((a,b) => b.updatedAt-a.updatedAt);
      const latest = orderThreads[0];
      return <article key={order.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">Pedido {order.id}</p><p className="mt-1 text-xs text-muted-foreground">{date(order.createdAt)} · {order.items.length} item(ns)</p></div><span className="rounded-full border border-border px-3 py-1 text-xs">{STATUS_LABEL[order.status]}</span></div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-lg font-semibold">{money(order.total)}</p><p className="text-xs text-muted-foreground">{latest ? `Atendimento: ${latest.status}` : "Nenhum atendimento iniciado"}</p></div><Button size="sm" onClick={() => void openOrReopen(order)} disabled={busyOrder === order.id}>{busyOrder === order.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin"/> : <MessageCircle className="mr-2 h-4 w-4"/>}{latest?.status === "aberto" ? "Ver conversa" : latest ? "Reabrir atendimento" : "Falar sobre pedido"}</Button></div>
        {orderThreads.length > 0 && <details className="mt-4 border-t border-border pt-3"><summary className="cursor-pointer text-xs text-muted-foreground">Histórico de atendimentos ({orderThreads.length})</summary><div className="mt-3 space-y-2">{orderThreads.map((t) => <button key={t.id} onClick={() => setActiveThread(t.id)} className="flex w-full items-center justify-between gap-3 rounded-md border border-border p-3 text-left text-xs hover:border-primary"><span>Conversa · {date(t.updatedAt)} · {t.messages.length} mensagens</span><span className={t.status === "aberto" ? "text-emerald-400" : "text-muted-foreground"}>{t.status}</span></button>)}</div></details>}
      </article>;
    })}</div>}
    {activeThread && <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Histórico do atendimento"><div className="flex h-[85dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-xl border border-border bg-card sm:h-[70dvh] sm:rounded-xl"><div className="flex items-center justify-between border-b border-border p-4"><div><p className="font-semibold">Atendimento do pedido</p><p className="text-xs text-muted-foreground">Histórico da conversa</p></div><Button variant="outline" size="sm" onClick={() => setActiveThread(null)}>Fechar</Button></div><div className="min-h-0 flex-1"><ChatPanel threadId={activeThread} side="user" authorName={user.nickname}/></div></div></div>}
  </main>;
}
