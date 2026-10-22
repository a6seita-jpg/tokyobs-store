import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Headphones, MessageCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChatWidget } from "@/hooks/useChatWidget";
import { ChatPanel } from "@/components/ChatPanel";
import { getOrCreateThread, subscribeChat, unreadForUser } from "@/lib/chat";
import { Button } from "@/components/ui/button";

/**
 * Botão flutuante + janela de chat (suporte geral ou ChatCompra de um pedido).
 * Montado uma vez na raiz; qualquer página abre via useChatWidget().
 */
export function ChatWidget() {
  const { hydrated, user, openLogin } = useAuth();
  const { open, target, close, openSupport } = useChatWidget();
  const [unread, setUnread] = useState(0);
  const [threadId, setThreadId] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const email = user?.email ?? "convidado@tokyobs.store";
  const name = user?.nickname ?? "Convidado";

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const update = async () => { try { const n = await unreadForUser(email); if (active) setUnread(n); } catch { if (active) setUnread(0); } };
    void update();
    const unsubscribe = subscribeChat(() => { void update(); });
    return () => { active = false; unsubscribe(); };
  }, [hydrated, email]);

  useEffect(() => {
    if (!hydrated || !open) { setThreadId(null); return; }
    if (!user) { setThreadId(null); openLogin(); close(); return; }
    let active = true;
    void getOrCreateThread({ kind: target.kind, ownerEmail: email, ownerName: name, orderId: target.kind === "order" ? target.orderId : undefined })
      .then((thread) => { if (active) setThreadId(thread.id); })
      .catch(() => setThreadId(null));
    return () => { active = false; };
  }, [hydrated, open, target, email, name, user, openLogin, close]);

  if (!hydrated) return null;

  const title = target.kind === "order" ? `Pedido ${target.orderId}` : "Suporte TOKYOBS";

  return (
    <>
      {/* Botão flutuante */}
      <Button
        onClick={() => (open ? close() : openSupport())}
        aria-label={open ? "Fechar chat" : "Abrir chat de suporte"}
        className="fixed bottom-5 right-5 z-[70] h-14 w-14 p-0 grid place-items-center rounded-full shadow-lg hover:scale-105 transition"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 grid place-items-center rounded-full text-[10px] font-bold bg-card text-primary border border-primary">
            {unread}
          </span>
        )}
      </Button>
      {/* Quando fechado, o clique abre o suporte (handler separado p/ não fechar no mesmo clique) */}

      <AnimatePresence>
        {open && threadId && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 24 }}
            transition={{ duration: reduced ? 0 : 0.22, ease: "easeOut" }}
            role="dialog" aria-label={title}
            className="fixed z-[70] bottom-24 right-4 left-4 sm:left-auto sm:w-[380px] h-[70dvh] max-h-[540px] rounded-lg border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/50">
              <span className="h-9 w-9 rounded-full grid place-items-center bg-primary/15 text-primary">
                <Headphones className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{title}</p>
                <p className="text-[11px] text-muted-foreground">Atendimento humano 24h</p>
              </div>
              <Button variant="ghost" size="icon" onClick={close} aria-label="Fechar conversa" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatPanel key={threadId} threadId={threadId} side="user" authorName={name} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
