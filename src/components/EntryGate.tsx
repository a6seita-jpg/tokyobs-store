import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Full-screen black overlay with kanji 極, shown on first visit.
 * After ~2.5s fades out. If user has no access (not logged + not guest),
 * the EntryLogin modal stays mounted blocking the site.
 */
export function EntryGate({ children }: { children: ReactNode }) {
  const { hasAccess } = useAuth();
  const [loadingVisible, setLoadingVisible] = useState(true);
  const [loadingFading, setLoadingFading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoadingFading(true), 2200);
    const t2 = setTimeout(() => setLoadingVisible(false), 2600);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  return (
    <>
      {children}
      {loadingVisible && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]"
          style={{
            opacity: loadingFading ? 0 : 1,
            transition: "opacity 0.4s ease-out",
          }}
          aria-hidden="true"
        >
          <div className="kanji-enter kanji-pulse text-[#e63946] font-light select-none"
               style={{ fontSize: "120px", lineHeight: 1, fontFamily: "var(--font-jp)" }}>
            極
          </div>
          <div className="mt-6 flex gap-1.5">
            <span className="dot-bounce" style={{ animationDelay: "0s" }}>·</span>
            <span className="dot-bounce" style={{ animationDelay: "0.15s" }}>·</span>
            <span className="dot-bounce" style={{ animationDelay: "0.3s" }}>·</span>
          </div>
        </div>
      )}
      {!loadingVisible && !hasAccess && <EntryLoginModal />}
    </>
  );
}

function EntryLoginModal() {
  const { login, loginAsGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Preencha email e senha"); return; }
    const r = await login({ email, password });
    if (!r.ok) setError(r.error || "Erro");
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "gate-fade-in 0.4s ease-out both",
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 sm:p-8"
        style={{ animation: "gate-slide-up 0.4s ease-out both" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="seal" />
          <span className="text-xs tracking-[0.3em] text-muted-foreground">TOKYOBS</span>
        </div>
        <h2 className="text-2xl font-light">Acesso TOKYOBS</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Login obrigatório para acessar catálogo
        </p>

        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 px-3 rounded-md border border-input bg-background outline-none focus:border-primary transition"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 px-3 rounded-md border border-input bg-background outline-none focus:border-primary transition"
          />

          {error && (
            <p className="text-sm text-primary bg-primary/10 rounded-md px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            className="h-11 rounded-full text-white font-medium hover:opacity-90 transition"
            style={{ background: "#e63946" }}
          >
            Entrar
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex-1 h-px bg-border" />
          ou
          <span className="flex-1 h-px bg-border" />
        </div>

        <button
          type="button"
          onClick={loginAsGuest}
          className="w-full h-11 rounded-full border transition hover:border-primary"
          style={{ background: "transparent", borderColor: "#333", color: "#aaa" }}
        >
          Entrar como Guest
        </button>
        <p className="mt-3 text-[11px] text-center text-muted-foreground">
          Guest tem acesso completo. Faça login depois pra salvar favoritos
        </p>
      </div>
    </div>
  );
}
