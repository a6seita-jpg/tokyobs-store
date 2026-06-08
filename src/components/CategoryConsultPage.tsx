import { triggerRipple } from "@/lib/ripple";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = {
  title: string;
  image: string;
  category: string; // for WhatsApp message
};

// Reusable single-card consult page for PS5, Streaming, Roblox, Variados, Acessórios.
export function CategoryConsultPage({ title, image, category }: Props) {
  return (
    <main className="container-tk pt-28 pb-12 ink-wash-enter">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          <span className="seal" /> Categoria
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extralight">{title}</h1>
      </div>

      <article className="max-w-2xl mx-auto rounded-lg overflow-hidden border border-border bg-card">
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="p-6 sm:p-10 text-center flex flex-col items-center gap-4">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase bg-primary/10 text-primary px-3 py-1 rounded-full">
            Em breve / Consultar
          </span>
          <h2 className="text-2xl font-light">{title}</h2>
          <p className="text-muted-foreground max-w-md">
            Catálogo sob consulta. Temos variedade de produtos — fale com a gente pelo WhatsApp.
          </p>
          <p className="text-4xl sm:text-5xl text-primary font-light tracking-tight">
            Sob consulta
          </p>

          <a
            href={whatsappUrl(category)}
            target="_blank"
            rel="noreferrer"
            onClick={triggerRipple}
            className="ripple-host mt-4 inline-flex items-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Consultar no WhatsApp
          </a>
        </div>
      </article>
    </main>
  );
}
