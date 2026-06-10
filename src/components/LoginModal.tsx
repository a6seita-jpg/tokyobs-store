import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { triggerRipple } from "@/lib/ripple";

/**
 * Optional login modal triggered from header / requireAuth.
 * The mandatory entry gate lives in EntryGate.tsx.
 */
export function LoginModal() {
  const { isLoginOpen, closeLogin, login, register, resetPassword, loginAsGuest, loginMessage } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", nickname: "", avatar: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (!isLoginOpen) return null;

  const reset = () => {
    setForm({ email: "", password: "", nickname: "", avatar: "" });
    setError("");
    setInfo("");
  };

  const close = () => { reset(); closeLogin(); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo("");
    const res = mode === "login"
      ? login({ email: form.email, password: form.password })
      : register(form);
    if (!res.ok) { setError(res.error || "Erro ao processar"); return; }
    close();
  };

  const onForgot = () => {
    setError(""); setInfo("");
    if (!form.email) { setError("Digite seu email primeiro"); return; }
    const res = resetPassword(form.email);
    if (!res.ok) { setError(res.error || "Erro"); return; }
    setInfo("Senha resetada para: 123456");
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 backdrop-blur-sm p-4 ink-wash-enter" onClick={close}>
      <div
        className="relative w-full max-w-md rounded-lg bg-card border border-border p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Fechar"
          className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full hover:bg-muted"
          onClick={close}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="seal" />
            <span className="text-sm tracking-[0.3em] text-muted-foreground">TOKYOBS</span>
          </div>
          <h2 className="mt-2 text-2xl font-light">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h2>
          {loginMessage && !error && (
            <p className="mt-2 text-sm text-primary">{loginMessage}</p>
          )}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <Field label="Email" type="email" required value={form.email}
            onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Senha" type="password" required value={form.password}
            onChange={(v) => setForm({ ...form, password: v })} />

          {mode === "register" && (
            <Field label="Nickname" required value={form.nickname}
              onChange={(v) => setForm({ ...form, nickname: v })} />
          )}

          {error && (
            <p className="text-sm text-primary bg-primary/10 rounded-md px-3 py-2">{error}</p>
          )}
          {info && (
            <p className="text-sm text-green-600 bg-green-500/10 rounded-md px-3 py-2">{info}</p>
          )}

          <button
            type="submit"
            onClick={triggerRipple}
            className="ripple-host mt-3 h-11 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            {mode === "login" ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex-1 h-px bg-border" />
          ou
          <span className="flex-1 h-px bg-border" />
        </div>

        <button
          type="button"
          onClick={() => { loginAsGuest(); close(); }}
          className="w-full h-11 rounded-full border transition hover:border-primary"
          style={{ background: "transparent", borderColor: "#333", color: "#aaa" }}
        >
          Entrar como Guest
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

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
          <button
            className="text-primary hover:underline"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setInfo(""); }}
          >
            {mode === "login" ? "Cadastre-se" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 px-3 rounded-md border border-input bg-background outline-none focus:border-primary transition"
      />
    </label>
  );
}
