import { useState } from "react";
import { X, Mail, Lock, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { triggerRipple } from "@/lib/ripple";
import { toast } from "sonner";

export function LoginModal() {
  const { isLoginOpen, closeLogin, login, register, resetPassword, loginAsGuest, loginMessage } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", password2: "", nickname: "", terms: false });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoginOpen) return null;

  const reset = () => {
    setForm({ email: "", password: "", password2: "", nickname: "", terms: false });
    setError(""); setInfo(""); setLoading(false);
  };
  const close = () => { reset(); closeLogin(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(""); setInfo("");

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Email inválido"); return;
    }
    if (form.password.length < 6) {
      setError("Senha precisa ter no mínimo 6 caracteres"); return;
    }
    if (mode === "register") {
      if (!form.nickname.trim()) { setError("Informe seu nome"); return; }
      if (form.password !== form.password2) { setError("Senhas não conferem"); return; }
      if (!form.terms) { setError("Aceite os termos para continuar"); return; }
    }

    setLoading(true);
    const res = await (mode === "login"
      ? login({ email: form.email, password: form.password })
      : register({ email: form.email, password: form.password, nickname: form.nickname, avatar: "" }));
    setLoading(false);
    if (!res.ok) { setError(res.error || "Erro ao processar"); return; }
    toast.success(mode === "login" ? "Bem-vindo!" : "Conta criada com sucesso!");
    close();
  };

  const onForgot = async () => {
    setError(""); setInfo("");
    if (!form.email) { setError("Digite seu email primeiro"); return; }
    setLoading(true);
    const res = await resetPassword(form.email);
    setLoading(false);
    if (!res.ok) { setError(res.error || "Erro"); return; }
    setInfo("Enviamos um link de redefinição para seu email, se ele estiver cadastrado.");
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 backdrop-blur-md p-4 ink-wash-enter" onClick={close}>
      <div
        className="relative w-full max-w-md rounded-xl border p-6 sm:p-8"
        style={{ background: "rgba(20,20,20,0.95)", borderColor: "#2a2a2a", backdropFilter: "blur(16px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Fechar"
          className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full hover:bg-white/10"
          onClick={close}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-2">
          <span className="kanji-badge">極</span>
          <span className="text-sm tracking-[0.3em] text-muted-foreground">TOKYOBS</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 p-1 rounded-lg" style={{ background: "#0a0a0a", border: "1px solid #2a2a2a" }}>
          {(["login", "register"] as const).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); setInfo(""); }}
                className="flex-1 h-9 rounded-md text-sm transition"
                style={{
                  background: active ? "#e63946" : "transparent",
                  color: active ? "#fff" : "#b3b3b3",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {m === "login" ? "Entrar" : "Cadastrar"}
              </button>
            );
          })}
        </div>

        {loginMessage && !error && (
          <p className="mb-3 text-sm text-primary">{loginMessage}</p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "register" && (
            <IconField icon={<UserIcon className="h-4 w-4" />} placeholder="Nome" value={form.nickname}
              onChange={(v) => setForm({ ...form, nickname: v })} />
          )}
          <IconField icon={<Mail className="h-4 w-4" />} type="email" placeholder="Email" value={form.email}
            onChange={(v) => setForm({ ...form, email: v })} />
          <IconField icon={<Lock className="h-4 w-4" />} type="password" placeholder="Senha (mín. 6)" value={form.password}
            onChange={(v) => setForm({ ...form, password: v })} />
          {mode === "register" && (
            <IconField icon={<Lock className="h-4 w-4" />} type="password" placeholder="Confirmar senha" value={form.password2}
              onChange={(v) => setForm({ ...form, password2: v })} />
          )}

          {mode === "register" && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                className="h-4 w-4 accent-[#e63946]"
              />
              Aceito os termos de uso e política de privacidade
            </label>
          )}

          {error && (
            <p className="text-sm text-white bg-[#e63946]/20 border border-[#e63946]/40 rounded-md px-3 py-2">{error}</p>
          )}
          {info && (
            <p className="text-sm text-green-400 bg-green-500/10 rounded-md px-3 py-2">{info}</p>
          )}

          <button
            type="submit"
            onClick={triggerRipple}
            disabled={loading}
            className="ripple-host mt-2 h-12 rounded-lg font-semibold transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "#e63946", color: "#fff" }}
          >
            {loading ? "Carregando..." : (mode === "login" ? "Entrar" : "Criar Conta")}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex-1 h-px" style={{ background: "#2a2a2a" }} />
          ou
          <span className="flex-1 h-px" style={{ background: "#2a2a2a" }} />
        </div>

        <button
          type="button"
          onClick={() => { loginAsGuest(); toast("Entrando como convidado"); close(); }}
          className="w-full h-11 rounded-lg border transition hover:border-primary"
          style={{ background: "transparent", borderColor: "#2a2a2a", color: "#b3b3b3" }}
        >
          Entrar como Convidado
        </button>

        {mode === "login" && (
          <button
            type="button"
            onClick={onForgot}
            className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-primary transition"
          >
            Esqueci minha senha
          </button>
        )}
      </div>
    </div>
  );
}

function IconField({
  icon, value, onChange, type = "text", placeholder,
}: {
  icon: React.ReactNode; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 pl-10 pr-3 rounded-lg outline-none transition focus:border-[#e63946]"
        style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#fff" }}
      />
    </div>
  );
}
