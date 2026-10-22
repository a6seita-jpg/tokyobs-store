import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TKRole = "user" | "admin";
export type TKUser = { email: string; nickname: string; avatar: string; role: TKRole };
type AuthResult = { ok: boolean; error?: string };
type AuthCtx = {
  hydrated: boolean; user: TKUser | null; isGuest: boolean; isAdmin: boolean; hasAccess: boolean;
  login: (u: { email: string; password: string }) => Promise<AuthResult>;
  loginAsGuest: () => void;
  register: (u: { email: string; password: string; nickname: string; avatar: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<TKUser>) => Promise<void>;
  openLogin: () => void; closeLogin: () => void; isLoginOpen: boolean; loginMessage: string;
  requireAuth: (message?: string) => boolean;
  resetPassword: (email: string) => Promise<AuthResult>;
};
const AuthContext = createContext<AuthCtx>(null as never);
const GUEST_KEY = "tk-guest";

function authError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Não foi possível concluir a operação.";
  if (/invalid login credentials/i.test(message)) return "Email ou senha incorretos.";
  if (/already registered/i.test(message)) return "Email já cadastrado. Faça login.";
  if (/email not confirmed/i.test(message)) return "Confirme seu email antes de entrar.";
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TKUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const loadProfile = async (id: string, email: string, metadata: Record<string, unknown>): Promise<TKUser> => {
    const { data } = await supabase.from("profiles").select("nickname, avatar, role").eq("id", id).maybeSingle();
    const profile = data as { nickname?: string; avatar?: string; role?: string } | null;
    return {
      email,
      nickname: profile?.nickname || String(metadata.nickname || email.split("@")[0]),
      avatar: profile?.avatar || String(metadata.avatar || ""),
      // Role is read only from the database profile, never from client metadata.
      role: profile?.role === "admin" ? "admin" : "user",
    };
  };

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && active) {
        const profile = await loadProfile(session.user.id, session.user.email || "", session.user.user_metadata || {});
        if (active) setUser(profile);
      }
      if (active && localStorage.getItem(GUEST_KEY) === "1") setIsGuest(true);
      if (active) setHydrated(true);
    };
    void restore();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (!session?.user) {
        setUser(null);
        return;
      }
      // Defer profile query to avoid Supabase auth callback deadlocks.
      queueMicrotask(() => {
        void loadProfile(session.user.id, session.user.email || "", session.user.user_metadata || {})
          .then((profile) => { if (active) { setUser(profile); setIsGuest(false); localStorage.removeItem(GUEST_KEY); } });
      });
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const login: AuthCtx["login"] = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    return error ? { ok: false, error: authError(error) } : { ok: true };
  };

  const register: AuthCtx["register"] = async ({ email, password, nickname, avatar }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(), password,
      options: { data: { nickname: nickname.trim(), avatar } },
    });
    if (error) return { ok: false, error: authError(error) };
    if (data.user && data.session) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id, email: data.user.email || email, nickname: nickname.trim(), avatar, role: "user",
      }, { onConflict: "id" });
      if (profileError) return { ok: false, error: "Conta criada, mas não foi possível salvar o perfil. Tente entrar novamente." };
    }
    if (data.user && !data.session) return { ok: false, error: "Conta criada! Confirme seu email para entrar." };
    return { ok: true };
  };

  const loginAsGuest = () => { localStorage.setItem(GUEST_KEY, "1"); setIsGuest(true); setLoginOpen(false); };
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(GUEST_KEY);
    setUser(null); setIsGuest(false);
  };
  const updateProfile: AuthCtx["updateProfile"] = async (patch) => {
    if (!user) return;
    const next = { ...user, ...patch, role: user.role };
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { error } = await supabase.from("profiles").update({ nickname: next.nickname, avatar: next.avatar }).eq("id", authUser.id);
    if (!error) setUser(next);
  };
  const resetPassword: AuthCtx["resetPassword"] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    return error ? { ok: false, error: authError(error) } : { ok: true };
  };
  const openLogin = () => { setLoginMessage(""); setLoginOpen(true); };
  const closeLogin = () => setLoginOpen(false);
  const requireAuth = (message = "Faça login para continuar") => {
    if (user || isGuest) return true;
    setLoginMessage(message); setLoginOpen(true); return false;
  };
  return <AuthContext.Provider value={{
    hydrated, user, isGuest, isAdmin: user?.role === "admin", hasAccess: !!user || isGuest,
    login, loginAsGuest, register, logout, updateProfile, openLogin, closeLogin,
    isLoginOpen, loginMessage, requireAuth, resetPassword,
  }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
