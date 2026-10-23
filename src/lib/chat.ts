import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = { id: string; from: "user" | "admin"; author: string; text: string; at: number };
export type ChatThread = {
  id: string; kind: "support" | "order"; ownerEmail: string; ownerName: string;
  orderId?: string; status: "aberto" | "fechado" | "arquivado"; closedAt?: number; lastMessageAt: number; messages: ChatMessage[]; unreadForAdmin: number; unreadForUser: number; updatedAt: number;
};
type DbThread = { id: string; kind: "support" | "order"; owner_id: string; owner_email: string; owner_name: string; order_id: string | null; unread_for_admin: number; unread_for_user: number; updated_at: string; status: "aberto" | "fechado" | "arquivado"; closed_at: string | null; last_message_at: string | null };
type DbMessage = { id: string; sender_role: "user" | "admin"; author: string; body: string; created_at: string };
const mapMessage = (m: DbMessage): ChatMessage => ({ id: m.id, from: m.sender_role, author: m.author, text: m.body, at: new Date(m.created_at).getTime() });
async function withMessages(row: DbThread): Promise<ChatThread> {
  const { data, error } = await supabase.from("chat_messages").select("id,sender_role,author,body,created_at").eq("thread_id", row.id).order("created_at", { ascending: true });
  if (error) throw error;
  return {
    id: row.id, kind: row.kind, ownerEmail: row.owner_email, ownerName: row.owner_name,
    orderId: row.order_id ?? undefined, status: row.status ?? "aberto", closedAt: row.closed_at ? new Date(row.closed_at).getTime() : undefined, lastMessageAt: new Date(row.last_message_at ?? row.updated_at).getTime(), messages: ((data ?? []) as unknown as DbMessage[]).map(mapMessage),
    unreadForAdmin: row.unread_for_admin, unreadForUser: row.unread_for_user, updatedAt: new Date(row.updated_at).getTime(),
  };
}
const threadCols = "id,kind,owner_id,owner_email,owner_name,order_id,unread_for_admin,unread_for_user,updated_at,status,closed_at,last_message_at";
const chatChanged = "tokyobs-chat-changed";
function notifyChat() { window.dispatchEvent(new Event(chatChanged)); }
export function subscribeChat(cb: () => void): () => void {
  // Each mounted consumer needs its own channel: Supabase reuses identical topics.
  const channel = supabase.channel(`tokyobs-chat-sync:${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, cb)
    .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, cb)
    .subscribe();
  window.addEventListener(chatChanged, cb);
  // Recover missed events after reconnects and when Realtime is unavailable.
  const refresh = () => { if (document.visibilityState === "visible") cb(); };
  const timer = window.setInterval(refresh, 15000);
  window.addEventListener("focus", refresh);
  return () => {
    window.removeEventListener(chatChanged, cb);
    window.removeEventListener("focus", refresh);
    window.clearInterval(timer);
    void supabase.removeChannel(channel);
  };
}
export async function getThread(id: string): Promise<ChatThread | null> {
  const { data, error } = await supabase.from("chat_threads").select(threadCols).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? withMessages(data as unknown as DbThread) : null;
}
export async function listThreads(): Promise<ChatThread[]> {
  const { data, error } = await supabase.from("chat_threads").select(threadCols).order("updated_at", { ascending: false });
  if (error) throw error;
  return Promise.all(((data ?? []) as unknown as DbThread[]).map(withMessages));
}
export function supportThreadId(email: string) { return `support:${email.toLowerCase()}`; }
export function orderThreadId(orderId: string) { return `order:${orderId}`; }
export async function getOrCreateThread(input: { kind: "support" | "order"; ownerEmail: string; ownerName: string; orderId?: string }): Promise<ChatThread> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Entre na sua conta para usar o chat sincronizado.");
  let query = supabase.from("chat_threads").select(threadCols).eq("owner_id", user.id).eq("kind", input.kind);
  query = input.kind === "order" ? query.eq("order_id", input.orderId ?? "") : query;
  const { data: found, error } = await query.maybeSingle();
  if (error) throw error;
  if (found) return withMessages(found as unknown as DbThread);
  if (input.kind === "order") {
    const { data: order, error: orderError } = await supabase.from("orders").select("id").eq("id", input.orderId ?? "").maybeSingle();
    if (orderError || !order) throw new Error("Pedido não encontrado para abrir o chat.");
  }
  const { data: row, error: insertError } = await supabase.from("chat_threads").insert({
    kind: input.kind, owner_id: user.id, owner_email: user.email ?? input.ownerEmail,
    owner_name: input.ownerName, order_id: input.kind === "order" ? input.orderId : null,
  }).select(threadCols).single();
  if (insertError) {
    // Another tab or overlapping effect may have created this unique thread.
    if (insertError.code === "23505") {
      const { data: existing, error: lookupError } = await query.maybeSingle();
      if (lookupError) throw lookupError;
      if (existing) return withMessages(existing as unknown as DbThread);
    }
    throw insertError;
  }
  notifyChat();
  return withMessages(row as unknown as DbThread);
}
export async function sendMessage(threadId: string, from: "user" | "admin", author: string, text: string): Promise<ChatThread | null> {
  const clean = text.trim();
  if (!clean) return null;
  const { error } = await supabase.rpc("send_chat_message", { p_thread_id: threadId, p_body: clean, p_author: author });
  if (error) throw error;
  notifyChat();
  return getThread(threadId);
}
export async function markRead(threadId: string, _side: "user" | "admin"): Promise<void> {
  const { error } = await supabase.rpc("mark_chat_read", { p_thread_id: threadId });
  if (error) throw error;
}
export async function unreadForUser(_email: string): Promise<number> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return 0;
  const { data, error } = await supabase.from("chat_threads").select("unread_for_user").eq("owner_id", user.id);
  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + Number((row as { unread_for_user: number }).unread_for_user), 0);
}
export async function unreadForAdmin(): Promise<number> {
  const { data, error } = await supabase.from("chat_threads").select("unread_for_admin");
  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + Number((row as { unread_for_admin: number }).unread_for_admin), 0);
}

export async function closeChat(threadId: string): Promise<void> {
  const { error } = await supabase.rpc("admin_close_chat", { p_thread_id: threadId });
  if (error) throw error;
  notifyChat();
}
export async function archiveChat(threadId: string): Promise<void> {
  const { error } = await supabase.rpc("admin_archive_chat", { p_thread_id: threadId });
  if (error) throw error;
  notifyChat();
}
export async function closeInactiveChats(): Promise<number> {
  const { data, error } = await supabase.rpc("admin_close_inactive_chats");
  if (error) throw error;
  notifyChat();
  return Number(data ?? 0);
}
export async function reopenOrderChat(orderId: string, ownerName = ""): Promise<string> {
  const { data, error } = await supabase.rpc("customer_reopen_order_chat", { p_order_id: orderId, p_owner_name: ownerName });
  if (error) throw error;
  notifyChat();
  return String(data);
}
