import { createFileRoute } from "@tanstack/react-router";
import { CategoryConsultPage } from "@/components/CategoryConsultPage";
import img from "@/assets/cat-ps5.jpg";

export const Route = createFileRoute("/ps5")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — PS5 · Sob consulta" },
      { name: "description", content: "Catálogo PS5 sob consulta. Fale com a TOKYOBS pelo WhatsApp." },
      { property: "og:title", content: "TOKYOBS PS5" },
      { property: "og:image", content: img },
    ],
  }),
  component: () => <CategoryConsultPage title="PS5" image={img} category="PS5" />,
});
