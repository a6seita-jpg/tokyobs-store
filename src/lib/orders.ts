import type { CartItem } from "@/hooks/useCart";
import { PAYMENT_WINDOW_MS } from "@/lib/pix";
import { supabase } from "@/integrations/supabase/client";

export type OrderStatus = "aguardando_pagamento" | "em_analise" | "expirado" | "entregue";
export type OrderBuyer = { email: string; nickname: string };
export type Order = {
  id: string; items: CartItem[]; total: number; status: OrderStatus;
  createdAt: number; expiresAt: number; buyer: OrderBuyer; comprovante?: string; observacao?: string;
};
type OrderRow = {
  id: string; user_id: string; buyer_email: string; buyer_nickname: string;
  items: CartItem[]; total: number; status: OrderStatus; created_at: string;
  expires_at: string; comprovante: string | null; observacao: string | null;
};
const fromRow = (r: OrderRow): Order => ({
  id:r.id, items:r.items || [], total:Number(r.total), status:r.status,
  createdAt:new Date(r.created_at).getTime(), expiresAt:new Date(r.expires_at).getTime(),
  buyer:{email:r.buyer_email,nickname:r.buyer_nickname}, comprovante:r.comprovante || undefined,
  observacao:r.observacao || undefined,
});
export async function listOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("*").order("created_at",{ascending:false});
  if(error) throw error;
  return ((data || []) as unknown as OrderRow[]).map(fromRow);
}
export async function getOrder(id:string): Promise<Order|null> {
  const { data, error } = await supabase.from("orders").select("*").eq("id",id).maybeSingle();
  if(error) throw error;
  return data ? fromRow(data as unknown as OrderRow) : null;
}
export async function createOrder(items:CartItem[],total:number,buyer:OrderBuyer):Promise<Order> {
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError || !user) throw new Error("Entre na sua conta para salvar o pedido e continuar com Pix.");
  const now=Date.now();
  const rand=Math.floor(Math.random()*46656).toString(36).toUpperCase().padStart(3,"0");
  const order:Order={id:`TK${now.toString(36).toUpperCase()}${rand}`,items,total,status:"aguardando_pagamento",createdAt:now,expiresAt:now+PAYMENT_WINDOW_MS,buyer};
  const {error}=await supabase.from("orders").insert({
    id:order.id,user_id:user.id,buyer_email:buyer.email,buyer_nickname:buyer.nickname,
    items:items as unknown as import("@/integrations/supabase/types").Json,total,status:order.status,
    created_at:new Date(now).toISOString(),expires_at:new Date(order.expiresAt).toISOString(),
  });
  if(error) throw error;
  return order;
}
export async function updateOrder(id:string,patch:Partial<Order>):Promise<Order|null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Entre na sua conta para atualizar o pedido.");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError) throw profileError;
  const isAdmin = (profile as { role?: string } | null)?.role === "admin";

  // Clientes só podem enviar comprovante ou expirar o próprio pedido via RPC protegida.
  if (!isAdmin && (patch.status === "em_analise" || patch.status === "expirado")) {
    const { error } = await supabase.rpc("submit_order_payment", {
      p_order_id: id,
      p_comprovante: patch.comprovante ?? null,
      p_observacao: patch.observacao ?? null,
      p_expire: patch.status === "expirado",
    });
    if (error) throw error;
    return getOrder(id);
  }
  if (!isAdmin) throw new Error("Você não tem permissão para alterar este pedido.");

  const update:Record<string,unknown>={};
  if(patch.status!==undefined) update.status=patch.status;
  if(patch.comprovante!==undefined) update.comprovante=patch.comprovante;
  if(patch.observacao!==undefined) update.observacao=patch.observacao;
  if (Object.keys(update).length === 0) return getOrder(id);
  const {data,error}=await supabase.from("orders").update(update).eq("id",id).select("*").maybeSingle();
  if(error) throw error;
  return data ? fromRow(data as unknown as OrderRow) : null;
}
export const STATUS_LABEL:Record<OrderStatus,string>={aguardando_pagamento:"Aguardando pagamento",em_analise:"Pagamento em análise",expirado:"Expirado",entregue:"Entregue"};
