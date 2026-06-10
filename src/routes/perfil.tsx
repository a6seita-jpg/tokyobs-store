import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Key } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { triggerRipple } from "@/lib/ripple";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — TOKYOBS" },
      { name: "description", content: "Edite seu nickname e foto de perfil TOKYOBS." },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user, isGuest, updateProfile, logout, requireAuth, openLogin } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user && !isGuest) {
      const ok = requireAuth("Entre para acessar seu perfil");
      if (!ok) navigate({ to: "/" });
      return;
    }
    if (user) {
      setNickname(user.nickname);
      setAvatar(user.avatar);
    }
  }, [user, isGuest, navigate, requireAuth]);

  if (!user && !isGuest) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    updateProfile({ nickname, avatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const guestAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=Guest`;

  return (
    <main className="container-tk pt-28 pb-12 ink-wash-enter">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            <span className="seal" /> Perfil
          </div>
          <h1 className="mt-3 text-3xl font-extralight">Meu perfil</h1>
        </div>

        <div className="flex flex-col items-center gap-3 mb-8">
          <img
            src={avatar || (user ? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(nickname || user.email)}` : guestAvatar)}
            alt={nickname || "Guest"}
            className="h-24 w-24 rounded-full object-cover border border-border"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = guestAvatar; }}
          />
          <p className="text-sm text-muted-foreground">
            {user ? user.email : "Convidado"}
          </p>
        </div>

        {isGuest && !user ? (
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 text-center fade-up">
            <p className="text-sm text-muted-foreground">
              Você está navegando como convidado. Faça login para salvar seu perfil, histórico e favoritos.
            </p>
            <button
              type="button"
              onClick={(e) => { triggerRipple(e); openLogin(); }}
              className="ripple-host inline-flex items-center justify-center gap-2 h-11 rounded-full border transition"
              style={{
                background: "transparent",
                borderColor: "#e63946",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#e63946";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <Key className="h-4 w-4" />
              Fazer Login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Nickname</span>
              <input
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-11 px-3 rounded-md border border-input bg-background outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">URL da foto</span>
              <input
                type="url"
                value={avatar}
                placeholder="https://..."
                onChange={(e) => setAvatar(e.target.value)}
                className="h-11 px-3 rounded-md border border-input bg-background outline-none focus:border-primary"
              />
            </label>
            <button
              onClick={triggerRipple}
              className="ripple-host h-11 rounded-full bg-primary text-primary-foreground hover:opacity-90"
            >
              Salvar alterações
            </button>
            {saved && <p className="text-center text-sm text-primary">Perfil atualizado ✓</p>}
            <button
              type="button"
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="h-11 rounded-full border border-border hover:border-primary hover:text-primary transition"
            >
              Sair
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
