import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getThread,
  markRead,
  sendMessage,
  subscribeChat,
  type ChatThread,
} from "@/lib/chat";

function fmtTime(at: number) {
  return new Date(at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Painel de conversa reutilizável: lado do cliente (side="user") ou do admin.
 * Lê/grava no banco via src/lib/chat.ts e reage a mudanças em tempo real.
 */
export function ChatPanel({
  threadId,
  side,
  authorName,
  onOpen,
}: {
  threadId: string;
  side: "user" | "admin";
  authorName: string;
  /** chamado quando o painel fica visível (para zerar não-lidas) */
  onOpen?: (thread: ChatThread | null) => void;
}) {
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [draft, setDraft] = useState("");
  const [loadError, setLoadError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let refreshing = false;
    let pending = false;
    const refresh = async () => {
      if (refreshing) { pending = true; return; }
      refreshing = true;
      try {
        // Falha ao marcar como lida não deve impedir o carregamento das mensagens.
        try { await markRead(threadId, side); } catch (readError) { console.warn("Não foi possível marcar o chat como lido:", readError); }
        const value = await getThread(threadId);
        if (!value) throw new Error("Conversa não encontrada ou acesso não autorizado.");
        if (active) { setThread(value); setLoadError(""); onOpen?.(value); }
      } catch (error) {
        if (active) {
          setThread(null);
          setLoadError(error instanceof Error ? error.message : "Falha ao carregar mensagens.");
        }
      } finally {
        refreshing = false;
        if (active && pending) { pending = false; void refresh(); }
      }
    };
    void refresh();
    const unsub = subscribeChat(() => { void refresh(); });
    return () => { active = false; unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, side]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread?.messages.length]);

  const send = async () => {
    if (!draft.trim() || sending) return;
    const message = draft;
    setSending(true);
    setSendError("");
    try {
      const updated = await sendMessage(threadId, side, authorName, message);
      if (updated) setThread(updated);
      setDraft("");
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Não foi possível enviar a mensagem.");
    } finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {loadError && <p role="alert" className="mx-auto max-w-sm rounded-md border border-destructive/30 p-3 text-center text-xs text-destructive break-words">Erro ao carregar o chat: {loadError}</p>}
        {(!thread || thread.messages.length === 0) && !loadError && (
          <p className="text-center text-xs text-muted-foreground pt-6 leading-relaxed">
            {side === "admin"
              ? "Nenhuma mensagem ainda. Responda quando o cliente escrever."
              : "Nenhuma mensagem ainda. Escreva abaixo e nossa equipe responde."}
          </p>
        )}
        {thread?.messages.map((m) => {
          const mine = m.from === side;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground border border-border rounded-bl-sm"}`}
              >
                {!mine && (
                  <div className="text-[10px] uppercase tracking-widest opacity-60 mb-0.5">
                    {m.from === "admin" ? "TOKYOBS" : m.author}
                  </div>
                )}
                {m.text}
                <div className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {fmtTime(m.at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sendError && <p role="alert" className="px-3 pt-2 text-xs text-destructive break-words">{sendError}</p>}
      <div className="shrink-0 border-t border-border p-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Escreva sua mensagem..."
          aria-label="Mensagem"
          maxLength={5000}
          className="flex-1 h-11 px-4 rounded-full border border-input bg-background text-sm outline-none focus:border-primary"
        />
        <Button
          onClick={send}
          disabled={!draft.trim() || !thread || sending}
          aria-label="Enviar mensagem"
          className="h-11 w-11 shrink-0 grid place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
