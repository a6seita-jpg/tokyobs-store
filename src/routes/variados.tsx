import { createFileRoute } from "@tanstack/react-router";
import { CategoryConsultPage } from "@/components/CategoryConsultPage";
import img from "@/assets/cat-variados.jpg";

export const Route = createFileRoute("/variados")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Variados · Sob consulta" },
      { name: "description", content: "Diversos produtos sob consulta na TOKYOBS." },
      { property: "og:title", content: "TOKYOBS Variados" },
      { property: "og:image", content: img },
    ],
  }),
  component: () => <CategoryConsultPage title="Variados" image={img} category="Variados" />,
});
