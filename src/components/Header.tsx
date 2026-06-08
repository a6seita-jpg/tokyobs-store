import { Link } from "@tanstack/react-router";
import { Moon, Sun, LogOut, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { triggerRipple } from "@/lib/ripple";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/ps4", label: "PS4", guarded: true },
  { to: "/ps5", label: "PS5" },
  { to: "/streaming", label: "Streaming" },
  { to: "/roblox", label: "Roblox" },
  { to: "/variados", label: "Variados" },
  { to: "/acessorios", label: "Acessórios" },
  { to: "/sobre", label: "Sobre Nós" },
] as const;

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, openLogin, logout, requireAuth } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container-tk flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="seal" />
          <span className="text-xl tracking-[0.3em] font-light">TOKYOBS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={(e) => {
                if (item.guarded && !requireAuth("Faça login pra consultar")) {
                  e.preventDefault();
                }
              }}
              className="relative text-foreground/70 hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Alternar tema"
            onClick={(e) => { triggerRipple(e); toggle(); }}
            className="ripple-host h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/perfil" className="flex items-center gap-2 group">
                <img
                  src={user.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.nickname)}`}
                  alt={user.nickname}
                  className="h-8 w-8 rounded-full object-cover border border-border"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.nickname)}`; }}
                />
                <span className="hidden sm:block text-sm">{user.nickname}</span>
              </Link>
              <button
                aria-label="Sair"
                onClick={(e) => { triggerRipple(e); logout(); }}
                className="ripple-host h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { triggerRipple(e); openLogin(); }}
              className="ripple-host hidden sm:inline-flex items-center gap-1 h-9 px-4 rounded-full text-sm border border-border hover:border-primary hover:text-primary transition"
            >
              <User className="h-4 w-4" /> Entrar
            </button>
          )}

          <button
            className="lg:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-muted"
            aria-label="Menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background ink-wash-enter">
          <nav className="container-tk py-4 flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={(e) => {
                  if (item.guarded && !requireAuth("Faça login pra consultar")) {
                    e.preventDefault();
                    return;
                  }
                  setMobileOpen(false);
                }}
                className="text-base py-2 border-b border-border/50 text-foreground/80"
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <button
                onClick={() => { setMobileOpen(false); openLogin(); }}
                className="mt-2 h-10 rounded-full bg-primary text-primary-foreground"
              >
                Entrar / Cadastrar
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
