import { createFileRoute } from "@tanstack/react-router";
import { CategoryConsultPage } from "@/components/CategoryConsultPage";
import img from "@/assets/cat-roblox.jpg";

export const Route = createFileRoute("/roblox")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Roblox · Sob consulta" },
      { name: "description", content: "Robux e itens Roblox sob consulta na TOKYOBS." },
      { property: "og:title", content: "TOKYOBS Roblox" },
      { property: "og:image", content: img },
    ],
  }),
  component: () => <CategoryConsultPage title="Roblox" image={img} category="Roblox" />,
});
