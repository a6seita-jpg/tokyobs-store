import { MessageCircle } from "lucide-react";

const HREF =
  "https://wa.me/5573988810368?text=" +
  encodeURIComponent("Olá! Tenho interesse em algum dos produtos da TOKYOBS.");

export function FloatingWhatsApp() {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 h-12 px-4 sm:px-5 rounded-full bg-[#25D366] text-white shadow-lg hover:opacity-90 transition"
      style={{ boxShadow: "0 10px 30px -10px rgba(37, 211, 102, 0.5)" }}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm font-medium">Falar agora</span>
    </a>
  );
}
