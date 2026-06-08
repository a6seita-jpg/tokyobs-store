import { useState } from "react";
import { Search, MessageCircle } from "lucide-react";
import { triggerRipple } from "@/lib/ripple";

const PHONE = "5573988810368";

export function SearchBar() {
  const [term, setTerm] = useState("");
  const [submitted, setSubmitted] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(term.trim());
  };

  const waHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(
    `Olá! Tenho interesse em algum dos produtos da TOKYOBS. Busquei por: ${submitted || term}`
  )}`;

  return (
    <section className="container-tk -mt-4 sm:-mt-6 pb-12">
      <form onSubmit={onSubmit} className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="O que você procura? Ex: Netflix, PS5, Robux..."
            className="w-full h-12 sm:h-14 pl-11 pr-4 rounded-full border border-input bg-card outline-none focus:border-primary transition text-sm sm:text-base"
          />
        </div>
      </form>

      {submitted && (
        <div className="max-w-2xl mx-auto mt-4 text-center ink-wash-enter">
          <p className="text-sm text-muted-foreground">
            Resultados para: <span className="text-foreground font-medium">{submitted}</span>
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            onClick={triggerRipple}
            className="ripple-host mt-3 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Não encontrou? Consultar no WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}
