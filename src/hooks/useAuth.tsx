import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type TKUser = {
  email: string;
  nickname: string;
  avatar: string;
};

type AuthCtx = {
  user: TKUser | null;
  login: (u: TKUser & { password: string }) => void;
  register: (u: TKUser & { password: string }) => void;
  logout: () => void;
  updateProfile: (patch: Partial<TKUser>) => void;
  openLogin: () => void;
  closeLogin: () => void;
  isLoginOpen: boolean;
  loginMessage: string;
  requireAuth: (message?: string) => boolean;
};

const AuthContext = createContext<AuthCtx>(null as never);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TKUser | null>(null);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("tk-user");
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* noop */ }
    }
  }, []);

  const persist = (u: TKUser | null) => {
    setUser(u);
    if (u) localStorage.setItem("tk-user", JSON.stringify(u));
    else localStorage.removeItem("tk-user");
  };

  const register = (u: TKUser & { password: string }) => {
    // Persist credential map for "login" check (toy localStorage auth)
    const creds = JSON.parse(localStorage.getItem("tk-creds") || "{}");
    creds[u.email] = { password: u.password, nickname: u.nickname, avatar: u.avatar };
    localStorage.setItem("tk-creds", JSON.stringify(creds));
    persist({ email: u.email, nickname: u.nickname, avatar: u.avatar });
  };

  const login = (u: TKUser & { password: string }) => {
    const creds = JSON.parse(localStorage.getItem("tk-creds") || "{}");
    const record = creds[u.email];
    if (record && record.password === u.password) {
      persist({ email: u.email, nickname: record.nickname, avatar: record.avatar });
    } else {
      // First-time login fallback: register on the fly
      register(u);
    }
  };

  const logout = () => persist(null);

  const updateProfile = (patch: Partial<TKUser>) => {
    if (!user) return;
    const next = { ...user, ...patch };
    persist(next);
    // Update creds record too
    const creds = JSON.parse(localStorage.getItem("tk-creds") || "{}");
    if (creds[next.email]) {
      creds[next.email] = { ...creds[next.email], nickname: next.nickname, avatar: next.avatar };
      localStorage.setItem("tk-creds", JSON.stringify(creds));
    }
  };

  const openLogin = () => { setLoginMessage(""); setLoginOpen(true); };
  const closeLogin = () => setLoginOpen(false);

  const requireAuth = (message = "Faça login pra consultar") => {
    if (user) return true;
    setLoginMessage(message);
    setLoginOpen(true);
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, openLogin, closeLogin, isLoginOpen, loginMessage, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
