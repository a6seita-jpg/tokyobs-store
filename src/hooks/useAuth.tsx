import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type TKRole = "user" | "admin";

export type TKUser = {
  email: string;
  nickname: string;
  avatar: string;
  role: TKRole;
};

type StoredUser = TKUser & { password: string };

type AuthCtx = {
  user: TKUser | null;
  isGuest: boolean;
  isAdmin: boolean;
  hasAccess: boolean; // user OR guest
  login: (u: { email: string; password: string }) => { ok: boolean; error?: string };
  loginAsGuest: () => void;
  register: (u: { email: string; password: string; nickname: string; avatar: string }) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (patch: Partial<TKUser>) => void;
  openLogin: () => void;
  closeLogin: () => void;
  isLoginOpen: boolean;
  loginMessage: string;
  requireAuth: (message?: string) => boolean;
  resetPassword: (email: string) => { ok: boolean; error?: string };
};

const AuthContext = createContext<AuthCtx>(null as never);

const USERS_KEY = "tk-users";
const SESSION_KEY = "tk-user";
const GUEST_KEY = "tk-guest";

const ADMIN_EMAIL = "admin@tokyobs.com";
const ADMIN_PASSWORD = "admin123";

function encode(pw: string): string {
  try { return btoa(unescape(encodeURIComponent(pw))); } catch { return pw; }
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Garante a conta admin fixa e migra senhas antigas (texto puro → base64) e
// usuários sem role.
function ensureSeedAndMigrate() {
  const users = readUsers();
  let changed = false;
  const adminIdx = users.findIndex((x) => x.email.toLowerCase() === ADMIN_EMAIL);
  if (adminIdx < 0) {
    users.push({
      email: ADMIN_EMAIL,
      nickname: "Admin TOKYOBS",
      avatar: "",
      role: "admin",
      password: encode(ADMIN_PASSWORD),
    });
    changed = true;
  } else if (users[adminIdx].role !== "admin") {
    users[adminIdx].role = "admin";
    changed = true;
  }
  for (const u of users) {
    if (!u.role) { u.role = "user"; changed = true; }
    // Migração: senhas antigas em texto puro passam a ser base64.
    try {
      if (decodeURIComponent(escape(atob(u.password))) === "") changed = true;
    } catch {
      u.password = encode(u.password);
      changed = true;
    }
  }
  if (changed) writeUsers(users);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TKUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    ensureSeedAndMigrate();
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* noop */ }
    }
    if (localStorage.getItem(GUEST_KEY) === "1") setIsGuest(true);
  }, []);

  const persistSession = (u: TKUser | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      // Logging in clears guest flag
      localStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const register: AuthCtx["register"] = (u) => {
    const users = readUsers();
    if (users.some((x) => x.email.toLowerCase() === u.email.toLowerCase())) {
      return { ok: false, error: "Email já cadastrado. Faça login" };
    }
    const record: StoredUser = { ...u, role: "user", password: encode(u.password) };
    users.push(record);
    writeUsers(users);
    persistSession({ email: u.email, nickname: u.nickname, avatar: u.avatar, role: "user" });
    return { ok: true };
  };

  const login: AuthCtx["login"] = ({ email, password }) => {
    const users = readUsers();
    const record = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!record) return { ok: false, error: "Email não cadastrado. Crie uma conta" };
    if (record.password !== encode(password)) return { ok: false, error: "Senha incorreta" };
    persistSession({ email: record.email, nickname: record.nickname, avatar: record.avatar, role: record.role });
    return { ok: true };
  };

  const loginAsGuest = () => {
    localStorage.setItem(GUEST_KEY, "1");
    setIsGuest(true);
    setLoginOpen(false);
  };

  const logout = () => {
    persistSession(null);
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  };

  const updateProfile = (patch: Partial<TKUser>) => {
    if (!user) return;
    const next = { ...user, ...patch, role: user.role };
    persistSession(next);
    const users = readUsers();
    const idx = users.findIndex((x) => x.email.toLowerCase() === next.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = { ...users[idx], nickname: next.nickname, avatar: next.avatar };
      writeUsers(users);
    }
  };

  const resetPassword: AuthCtx["resetPassword"] = (email) => {
    const users = readUsers();
    const idx = users.findIndex((x) => x.email.toLowerCase() === email.toLowerCase());
    if (idx < 0) return { ok: false, error: "Email não encontrado" };
    if (users[idx].role === "admin") return { ok: false, error: "A senha do admin não pode ser resetada" };
    users[idx].password = encode("123456");
    writeUsers(users);
    return { ok: true };
  };

  const openLogin = () => { setLoginMessage(""); setLoginOpen(true); };
  const closeLogin = () => setLoginOpen(false);

  // Guest counts as having access throughout the site.
  const requireAuth = (message = "Faça login pra consultar") => {
    if (user || isGuest) return true;
    setLoginMessage(message);
    setLoginOpen(true);
    return false;
  };

  const hasAccess = !!user || isGuest;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{
      user, isGuest, isAdmin, hasAccess,
      login, loginAsGuest, register, logout, updateProfile,
      openLogin, closeLogin, isLoginOpen, loginMessage,
      requireAuth, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
