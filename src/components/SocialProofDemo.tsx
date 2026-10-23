import { CheckCircle2, Mail, MessageCircle } from "lucide-react";

const EXAMPLES = [
  { initials: "J***", item: "PRIME VIDEO", time: "Exemplo ilustrativo" },
  { initials: "M***", item: "NETFLIX", time: "Exemplo ilustrativo" },
  { initials: "A***", item: "STEAM", time: "Exemplo ilustrativo" },
];

export function SocialProofDemo() {
  return (
    <section className="container-tk pb-14">
      <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">Exemplo de entrega</p>
            <h2 className="mt-1 text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Como a entrega pode aparecer
            </h2>
          </div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
            Dados ilustrativos
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {EXAMPLES.map((example) => (
            <div key={example.item} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{example.initials} comprou {example.item}</span>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              </div>
              <p className="mt-2 text-xs text-white/55">{example.time} · Não representa uma venda real</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Entrega conforme as instruções do produto</p>
            <p className="mt-1 text-xs text-white/60">Confira os canais e o prazo indicados na página do produto antes de comprar.</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/70">
            <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" /> E-mail</span>
            <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" /> WhatsApp, se informado</span>
          </div>
        </div>
      </div>
    </section>
  );
}
