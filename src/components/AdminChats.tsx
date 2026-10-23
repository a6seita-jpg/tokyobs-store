import { useEffect, useState } from "react";
import { Headphones, MessageCircle, Package, Search, Archive, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/ChatPanel";
import { listThreads, subscribeChat, closeChat, archiveChat, closeInactiveChats, type ChatThread } from "@/lib/chat";

export function AdminChats({ authorName }: { authorName: string }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "support" | "order">("all");
  const [statusFilter, setStatusFilter] = useState<"todos" | "aberto" | "fechado" | "arquivado">("aberto");
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    const update = async () => { try { const rows = await listThreads(); if (active) { setThreads(rows); setLoadError(""); } } catch { if (active) setLoadError("Não foi possível carregar as conversas. Tentando novamente automaticamente."); } };
    void update();
    const unsubscribe = subscribeChat(() => { void update(); });
    return () => { active = false; unsubscribe(); };
  }, []);
  const visible = threads.filter(t => (filter === "all" || t.kind === filter) && (statusFilter === "todos" || t.status === statusFilter) && `${t.ownerName} ${t.ownerEmail} ${t.orderId ?? ""} ${t.messages.at(-1)?.text ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const runAction = async (action: () => Promise<unknown>, success: string) => { try { await action(); setThreads(await listThreads()); setLoadError(""); } catch (e) { setLoadError(e instanceof Error ? e.message : success); } };
  const thread = threads.find(t => t.id === selected);
  const openCount = threads.filter(t => t.status === "aberto").length;
  const closedCount = threads.filter(t => t.status === "fechado" || t.status === "arquivado").length;
  const closeRate = threads.length ? Math.round((closedCount / threads.length) * 100) : 0;
  return <section aria-label="Conversas de atendimento" className="grid md:grid-cols-[320px_1fr] border border-border rounded-lg overflow-hidden bg-card min-h-[560px]">
    <div className="border-b md:border-b-0 md:border-r border-border min-w-0">
      <div className="p-4 space-y-3 border-b border-border"><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => void runAction(async () => { const n = await closeInactiveChats(); setLoadError(`Chats inativos fechados: ${n}`); }, "Falha ao fechar chats inativos")}>Fechar chats inativos há +7 dias</Button><span className="text-xs text-muted-foreground self-center">{openCount} abertos / {closeRate}% taxa de fechamento</span></div>{openCount >= 50 && <p role="alert" className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-200">Muitos chats abertos, feche os inativos.</p>}<div className="flex gap-1 flex-wrap" role="group" aria-label="Status do chat">{(["todos","aberto","fechado","arquivado"] as const).map(s => <Button key={s} size="sm" variant={statusFilter === s ? "default" : "ghost"} onClick={() => setStatusFilter(s)}>{s === "todos" ? "Todos" : s === "aberto" ? "Abertos" : s === "fechado" ? "Fechados" : "Arquivados"}</Button>)}</div>
        <label className="flex items-center gap-2 border border-input rounded-md px-3 bg-background"><Search className="h-4 w-4 text-muted-foreground"/><input aria-label="Buscar conversa" placeholder="Cliente ou pedido" value={search} onChange={e => setSearch(e.target.value)} className="h-10 w-full min-w-0 bg-transparent text-sm outline-none"/></label>
        <div className="flex gap-1" role="group" aria-label="Tipo de conversa">{(["all", "support", "order"] as const).map(f => <Button key={f} size="sm" variant={filter === f ? "default" : "ghost"} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "Todas" : f === "support" ? "Suporte" : "Pedidos"}</Button>)}</div>
      </div>
      <div className="max-h-[240px] md:max-h-[540px] overflow-y-auto">
        {loadError && <p role="alert" className="p-4 text-sm text-destructive">{loadError}</p>}
        {!loadError && visible.length === 0 && <p className="p-6 text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>}
        {visible.map(t => <Button key={t.id} variant="ghost" onClick={() => setSelected(t.id)} aria-pressed={selected === t.id} className={`h-auto w-full justify-start rounded-none border-b border-border border-l-2 p-4 whitespace-normal text-left hover:bg-muted hover:text-foreground ${t.status === "aberto" ? "border-l-[#1ED760]" : t.status === "fechado" ? "border-l-gray-500 opacity-60" : "border-l-white/20 opacity-70"} ${selected === t.id ? "bg-muted" : ""}`}>
          <span className="text-primary shrink-0">{t.kind === "order" ? <Package/> : <Headphones/>}</span>
          <span className="flex-1 min-w-0"><span className="block text-sm truncate">{t.ownerName}</span><span className="block text-[11px] text-muted-foreground truncate">{t.kind === "order" ? `Pedido ${t.orderId}` : t.ownerEmail}</span><span className="block text-xs text-muted-foreground truncate mt-1">{t.messages.at(-1)?.text ?? "Conversa iniciada"}</span><span className="block text-[10px] uppercase mt-1">{t.status}</span></span>
          {t.unreadForAdmin > 0 && <span className="rounded-full bg-primary text-primary-foreground text-[10px] min-w-5 h-5 grid place-items-center">{t.unreadForAdmin}</span>}
        </Button>)}
      </div>
    </div>
    <div className="flex flex-col min-w-0 h-[560px]">
      {thread ? <><header className="p-4 border-b border-border flex items-start justify-between gap-3"><div><h2 className="text-base">{thread.kind === "order" ? `Pedido ${thread.orderId}` : "Suporte geral"}</h2><p className="text-xs text-muted-foreground break-all mt-1">{thread.ownerName} · {thread.ownerEmail}</p><p className="text-xs mt-1">Status: {thread.status}</p></div><div className="flex gap-2">{thread.status === "aberto" && <Button size="sm" variant="destructive" onClick={() => void runAction(() => closeChat(thread.id), "Falha ao fechar chat")}><XCircle className="h-4 w-4 mr-1"/>Fechar Chat</Button>}{thread.status !== "arquivado" && <Button size="sm" variant="outline" onClick={() => void runAction(() => archiveChat(thread.id), "Falha ao arquivar chat")}><Archive className="h-4 w-4 mr-1"/>Arquivar</Button>}</div></header><div className="flex-1 min-h-0"><ChatPanel key={thread.id} threadId={thread.id} side="admin" authorName={authorName}/></div></> : <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-6 text-center"><MessageCircle className="h-9 w-9 text-primary/70"/><p className="text-sm">Selecione uma conversa</p></div>}
    </div>
  </section>;
}
