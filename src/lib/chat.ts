// Chat local da TOKYOBS (localStorage) — suporte geral e chat por pedido.
// Threads: "support:<email>" (suporte geral) e "order:<orderId>" (ChatCompra).

export type ChatMessage = {
  id: string;
  from: "user" | "admin";
  author: string;
  text: string;
  at: number;
};

export type ChatThread = {
  id: string;
  kind: "support" | "order";
  /** email do comprador/usuário dono do thread */
  ownerEmail: string;
  ownerName: string;
  /** id do pedido quando kind === "order" */
  orderId?: string;
  messages: ChatMessage[];
  unreadForAdmin: number;
  unreadForUser: number;
  updatedAt: number;
};

const KEY = "tk-chats";
const EVENT = "tk-chat-updated";

function read(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(threads: ChatThread[]) {
  localStorage.setItem(KEY, JSON.stringify(threads));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Reage a mudanças no chat (mesma aba ou outras abas). */
export function subscribeChat(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function getThread(id: string): ChatThread | null {
  return read().find((t) => t.id === id) ?? null;
}

export function listThreads(): ChatThread[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function supportThreadId(email: string) {
  return `support:${email.toLowerCase()}`;
}

export function orderThreadId(orderId: string) {
  return `order:${orderId}`;
}

export function getOrCreateThread(input: {
  kind: "support" | "order";
  ownerEmail: string;
  ownerName: string;
  orderId?: string;
}): ChatThread {
  const id =
    input.kind === "order" && input.orderId
      ? orderThreadId(input.orderId)
      : supportThreadId(input.ownerEmail);
  const threads = read();
  const existing = threads.find((t) => t.id === id);
  if (existing) return existing;
  const thread: ChatThread = {
    id,
    kind: input.kind,
    ownerEmail: input.ownerEmail,
    ownerName: input.ownerName,
    orderId: input.orderId,
    messages: [],
    unreadForAdmin: 0,
    unreadForUser: 0,
    updatedAt: Date.now(),
  };
  write([thread, ...threads]);
  return thread;
}

export function sendMessage(
  threadId: string,
  from: "user" | "admin",
  author: string,
  text: string,
): ChatThread | null {
  const clean = text.trim();
  if (!clean) return null;
  const threads = read();
  const idx = threads.findIndex((t) => t.id === threadId);
  if (idx < 0) return null;
  const msg: ChatMessage = {
    id: `${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`,
    from,
    author,
    text: clean,
    at: Date.now(),
  };
  const t = threads[idx];
  threads[idx] = {
    ...t,
    messages: [...t.messages, msg],
    unreadForAdmin: from === "user" ? t.unreadForAdmin + 1 : t.unreadForAdmin,
    unreadForUser: from === "admin" ? t.unreadForUser + 1 : t.unreadForUser,
    updatedAt: msg.at,
  };
  write(threads);
  return threads[idx];
}

/** Zera o contador de não-lidas do lado que abriu o chat. */
export function markRead(threadId: string, side: "user" | "admin") {
  const threads = read();
  const idx = threads.findIndex((t) => t.id === threadId);
  if (idx < 0) return;
  const t = threads[idx];
  const next = side === "admin" ? { ...t, unreadForAdmin: 0 } : { ...t, unreadForUser: 0 };
  if (next.unreadForAdmin === t.unreadForAdmin && next.unreadForUser === t.unreadForUser) return;
  threads[idx] = next;
  write(threads);
}

/** Total de não-lidas para o usuário (badge do botão flutuante). */
export function unreadForUser(email: string): number {
  return read()
    .filter((t) => t.ownerEmail.toLowerCase() === email.toLowerCase())
    .reduce((s, t) => s + t.unreadForUser, 0);
}

export function unreadForAdmin(): number {
  return read().reduce((s, t) => s + t.unreadForAdmin, 0);
}
