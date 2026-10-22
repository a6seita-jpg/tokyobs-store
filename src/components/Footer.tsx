import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24 py-10">
      <div className="container-tk flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex flex-wrap justify-center items-center gap-2">
          <span className="seal" />
          <span className="tracking-[0.3em]">TOKYOBS</span>
          <span className="ml-3">© {new Date().getFullYear()} — Todos os direitos reservados</span>
        </div>
        <nav aria-label="Informações da loja" className="flex flex-wrap justify-center gap-5">
          <Link to="/sobre" className="hover:text-primary">Sobre Nós</Link>
          <Link to="/suporte" className="hover:text-primary">Suporte</Link>
          <Link to="/faq" className="hover:text-primary">FAQ</Link>
        </nav>
      </div>
    </footer>
  );
}
