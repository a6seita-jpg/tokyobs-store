// Builds WhatsApp deep links for product inquiries.
const PHONE = "5573988810368";

export function whatsappUrl(category: string, extra = "") {
  const base = "Olá! Tenho interesse em algum dos produtos da TOKYOBS. Gostaria de consultar disponibilidade e preço";
  const tail = category === "PS4 (jogo específico)"
    ? " do jogo PS4"
    : ` na categoria ${category}`;
  const msg = `${base}${tail}${extra ? `: ${extra}` : ":"}`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}
