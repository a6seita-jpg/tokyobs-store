// Pedidos locais da TOKYOBS (localStorage) — usados pelo checkout Pix,
// histórico do perfil e futuro painel admin.
import type { CartItem } from "@/hooks/useCart";
import { PAYMENT_WINDOW_MS } from "@/lib/pix";

export type OrderStatus =
  | "aguardando_pagamento"
  | "em_analise"
  | "expirado"
  | "entregue";

export type OrderBuyer = { email: string; nickname: string };

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  expiresAt: number;
  buyer: OrderBuyer;
  comprovante?: string; // base64 ou URL
  observacao?: string;
};

const KEY = "tokyobs_orders";
const EVENT = "tokyobs-orders-updated";

function read(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(orders: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Atualiza listas em outras abas do mesmo navegador. Não sincroniza dispositivos diferentes. */
export function subscribeOrders(cb: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function listOrders(): Order[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getOrder(id: string): Order | null {
  return read().find((o) => o.id === id) ?? null;
}

export function createOrder(
  items: CartItem[],
  total: number,
  buyer: OrderBuyer,
): Order {
  const now = Date.now();
  const rand = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, "0");
  const order: Order = {
    id: `TK${now.toString(36).toUpperCase()}${rand}`,
    items,
    total,
    status: "aguardando_pagamento",
    createdAt: now,
    expiresAt: now + PAYMENT_WINDOW_MS,
    buyer,
  };
  write([order, ...read()]);
  return order;
}

export function updateOrder(id: string, patch: Partial<Order>): Order | null {
  const orders = read();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  orders[idx] = { ...orders[idx], ...patch };
  write(orders);
  return orders[idx];
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  em_analise: "Pagamento em análise",
  expirado: "Expirado",
  entregue: "Entregue",
};
