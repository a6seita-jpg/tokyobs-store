import type { CartItem } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_WINDOW_MS } from "@/lib/pix";

export type OrderStatus = "aguardando_pagamento" | "em_analise" | "expirado" | "entregue";
export type OrderBuyer = { email: string; nickname: string };
export type Order = {
  id: string; items: CartItem[]; total: number; status: OrderStatus;
  createdAt: number; expiresAt: number; buyer: OrderBuyer;
  comprovante?: string; observacao?: string;
};
type DbOrder = {
  id: string; items: CartItem[]; total: number; status: OrderStatus;
  created_at: string; expires_at: string; buyer_email: string;
  buyer_nickname: string; comprovante: string | null; observacao: string | null;
};
const fromDb = (row: DbOrder): Order => ({
  id: row.id, items: row.items, total: Number(row.total), status: row.status,
  createdAt: new Date(row.created_at).getTime(), expiresAt: new Date(row.expires_at).getTime(),
  buyer: { email: row.buyer_email, nickname: row.buyer_nickname },
  comprovante: row.comprovante ?? undefined, observacao: row.observacao ?? undefined,
});
const columns = "id,items,total,status,created_at,expires_at,buyer_email,buyer_nickname,comprovante,observacao";

export async function listOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select(columns).order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as DbOrder[]).map(fromDb);
}
export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase.from("orders").select(columns).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromDb(data as unknown as DbOrder) : null;
}
export async function createOrder(items: CartItem[], total: number, buyer: OrderBuyer): Promise<Order> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Entre na sua conta para salvar e acompanhar pedidos.");
  if (!items.length || !Number.isFinite(total) || total <= 0) throw new Error("Carrinho inválido.");
  const now = Date.now();
  const rand = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, "0");
  const order: Order = {
    id: `TK${now.toString(36).toUpperCase()}${rand}`, items, total,
    status: "aguardando_pagamento", createdAt: now, expiresAt: now + PAYMENT_WINDOW_MS, buyer,
  };
  const { error } = await supabase.from("orders").insert({
    id: order.id, user_id: user.id, buyer_email: user.email ?? buyer.email,
    buyer_nickname: buyer.nickname, items, total, status: order.status,
    expires_at: new Date(order.expiresAt).toISOString(),
  });
  if (error) throw error;
  return order;
}
export async function updateOrder(id: string, patch: Partial<Order>): Promise<Order | null> {
  // Owners submit payment proof through a dedicated RPC; only admins may change status.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Entre na sua conta para atualizar o pedido.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = (profile as { role?: string } | null)?.role === "admin";
  const values: Record<string, unknown> = {};
  if (patch.comprovante !== undefined) values.comprovante = patch.comprovante;
  if (patch.observacao !== undefined) values.observacao = patch.observacao;
  if (isAdmin && patch.status !== undefined) values.status = patch.status;
  else if (patch.status !== undefined && patch.status !== "em_analise" && patch.status !== "expirado") {
    throw new Error("Você não tem permissão para alterar esse status.");
  }
  if (!Object.keys(values).length) return getOrder(id);
  // RPC enforces owner/status restrictions server-side for customer updates.
  if (!isAdmin) {
    const { error } = await supabase.rpc("submit_order_payment", {
      p_order_id: id, p_comprovante: patch.comprovante ?? null, p_observacao: patch.observacao ?? null,
      p_expire: patch.status === "expirado",
    });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("orders").update(values).eq("id", id);
    if (error) throw error;
  }
  return getOrder(id);
}
export const STATUS_LABEL: Record<OrderStatus, string> = {
  aguardando_pagamento: "Aguardando pagamento", em_analise: "Pagamento em análise",
  expirado: "Expirado", entregue: "Entregue",
};
