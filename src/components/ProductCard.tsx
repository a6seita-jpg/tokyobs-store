import { triggerRipple } from "@/lib/ripple";
import { whatsappUrl } from "@/lib/whatsapp";

// Lightweight "showcase" product card for game listings.
export function ProductCard({ name }: { name: string }) {
  const href = whatsappUrl("PS4 (jogo específico)", name);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={triggerRipple}
      className="ripple-host group border border-border rounded-md p-4 bg-card hover:border-primary transition flex flex-col gap-2"
    >
      <span className="text-xs text-muted-foreground tracking-widest uppercase">PS4</span>
      <h4 className="text-sm font-medium leading-tight min-h-[2.5rem]">{name}</h4>
      <span className="text-primary text-xs mt-2 group-hover:underline">Consultar preço →</span>
    </a>
  );
}
