// Compra imediata: cria um pedido com um único item e abre o checkout Pix.
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import type { CartItem } from "@/hooks/useCart";
import { createOrder } from "@/lib/orders";

export function useBuyNow() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return async (item: Omit<CartItem, "id"> & { id?: string }) => {
    const buyer = user
      ? { email: user.email, nickname: user.nickname }
      : { email: "convidado@tokyobs.store", nickname: "Convidado" };
    const cartItem: CartItem = {
      ...item,
      id: item.id ?? `${item.product}::${item.variation}`,
    };
    const order = await createOrder([cartItem], cartItem.unitPrice * cartItem.quantity, buyer);
    navigate({ to: "/checkout/pix", search: { order: order.id } });
  };
}
