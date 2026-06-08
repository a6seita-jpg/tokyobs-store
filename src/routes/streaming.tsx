import { createFileRoute } from "@tanstack/react-router";
import { CategoryConsultPage } from "@/components/CategoryConsultPage";
import img from "@/assets/cat-streaming.jpg";

export const Route = createFileRoute("/streaming")({
  head: () => ({
    meta: [
      { title: "TOKYOBS — Streaming · Sob consulta" },
      { name: "description", content: "Assinaturas e serviços de streaming sob consulta na TOKYOBS." },
      { property: "og:title", content: "TOKYOBS Streaming" },
      { property: "og:image", content: img },
    ],
  }),
  component: () => <CategoryConsultPage title="Streaming" image={img} category="Streaming" />,
});
