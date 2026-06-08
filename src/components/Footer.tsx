import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24 py-10">
      <div className="container-tk flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="seal" />
          <span className="tracking-[0.3em]">TOKYOBS</span>
          <span className="ml-3">© {new Date().getFullYear()} — Todos os direitos reservados</span>
        </div>
        <Link
          to="/sobre"
          className="px-4 py-2 rounded-full border border-border hover:border-primary hover:text-primary transition"
        >
          Sobre Nós
        </Link>
      </div>
    </footer>
  );
}
