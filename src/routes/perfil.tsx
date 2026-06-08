import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const { user, updateProfile, logout, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      const ok = requireAuth("Entre para acessar seu perfil");
      if (!ok) navigate({ to: "/" });
      return;
    }
    setNickname(user.nickname);
    setAvatar(user.avatar);
  }, [user, navigate, requireAuth]);

  if (!user) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ nickname, avatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

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
            src={avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(nickname || user.email)}`}
            alt={nickname}
            className="h-24 w-24 rounded-full object-cover border border-border"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(nickname || user.email)}`; }}
          />
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

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
      </div>
    </main>
  );
}
