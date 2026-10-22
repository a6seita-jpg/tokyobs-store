import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Key, ImagePlus } from "lucide-react";
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
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const choosePhoto = (file?: File) => {
    if (!file) return;
    setErrorMessage("");
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Escolha um arquivo de imagem.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage("A foto deve ter no máximo 12 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setErrorMessage("Não foi possível ler essa foto.");
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => setErrorMessage("Não foi possível abrir essa imagem.");
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 512 / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setErrorMessage("Não foi possível processar essa foto.");
          return;
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        setAvatar(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setErrorMessage("");
    try {
      await updateProfile({ nickname, avatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      setErrorMessage("Não foi possível salvar o perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
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
            <div className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Foto de perfil</span>
              <label className="flex items-center justify-center gap-2 h-11 rounded-full border border-border hover:border-primary cursor-pointer transition">
                <ImagePlus className="h-4 w-4" />
                Escolher foto da galeria
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => { choosePhoto(e.target.files?.[0]); e.currentTarget.value = ""; }}
                />
              </label>
              <p className="text-xs text-muted-foreground">Imagem de até 12 MB</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              onClick={triggerRipple}
              className="ripple-host h-11 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            {errorMessage && <p role="alert" className="text-center text-sm text-destructive">{errorMessage}</p>}
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
