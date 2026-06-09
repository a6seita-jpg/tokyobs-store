// Builds WhatsApp deep links for product inquiries and purchases.
const PHONE = "5573988810368";

export function whatsappUrl(category: string, extra = "") {
  const base = "Olá! Tenho interesse em algum dos produtos da TOKYOBS. Gostaria de consultar disponibilidade e preço";
  const tail = category === "PS4 (jogo específico)"
    ? " do jogo PS4"
    : ` na categoria ${category}`;
  const msg = `${base}${tail}${extra ? `: ${extra}` : ":"}`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}

// Purchase intent: builds the standardized message with product + variation + qty + total.
export function purchaseUrl(opts: {
  product: string;
  variation: string;
  quantity: number;
  total: number;
}) {
  const total = opts.total.toFixed(2).replace(".", ",");
  const msg = `Olá TOKYOBS! Quero comprar: ${opts.product} - ${opts.variation} x${opts.quantity} = R$ ${total}`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}

export const TOKYOBS_PHONE = PHONE;
