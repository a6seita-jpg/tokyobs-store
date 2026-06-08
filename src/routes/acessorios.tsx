import { createFileRoute } from "@tanstack/react-router";
import { CategoryConsultPage } from "@/components/CategoryConsultPage";
import img from "@/assets/cat-acessorios.jpg";

export const Route = createFileRoute("/acessorios")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Acessórios · Sob consulta" },
      { name: "description", content: "Acessórios gamer e eletrônicos sob consulta na TOKYOBS." },
      { property: "og:title", content: "TOKYOBS Acessórios" },
      { property: "og:image", content: img },
    ],
  }),
  component: () => <CategoryConsultPage title="Acessórios" image={img} category="Acessórios" />,
});
