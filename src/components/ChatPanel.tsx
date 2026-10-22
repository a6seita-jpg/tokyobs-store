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
 * Lê/grava no localStorage via src/lib/chat.ts e reage a mudanças em tempo real.
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead(threadId, side);
    setThread(getThread(threadId));
    onOpen?.(getThread(threadId));
    const unsub = subscribeChat(() => {
      markRead(threadId, side);
      setThread(getThread(threadId));
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, side]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread?.messages.length]);

  const send = () => {
    if (!draft.trim()) return;
    sendMessage(threadId, side, authorName, draft);
    setDraft("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {(!thread || thread.messages.length === 0) && (
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
          className="flex-1 h-11 px-4 rounded-full border border-input bg-background text-sm outline-none focus:border-primary"
        />
        <Button
          onClick={send}
          disabled={!draft.trim() || !thread}
          aria-label="Enviar mensagem"
          className="h-11 w-11 shrink-0 grid place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
