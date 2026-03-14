"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type Role = "user" | "vendor" | "admin" | "service_provider" | "delivery" | null;

interface AuthContextValue {
  isLoggedIn: boolean;
  role: Role;
  isVendor: boolean;
  isDelivery: boolean;
  isServiceProvider: boolean;
  userStore: string | null;
  userName: string | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

/** Decode JWT payload without a library (base64url → JSON) */
function parseJwt(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [isVendor, setIsVendor] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const [isServiceProvider, setIsServiceProvider] = useState(false);
  const [userStore, setUserStore] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [tokenStr, setTokenStr] = useState<string | null>(null);

  const applyToken = useCallback((token: string) => {
    const payload = parseJwt(token);
    setIsLoggedIn(true);
    setRole((payload.role as Role) ?? "user");
    setIsVendor(Boolean(payload.isVendor));
    setIsDelivery(Boolean(payload.isDelivery));
    setIsServiceProvider(Boolean(payload.isServiceProvider));
    setUserStore((payload.store as string) ?? null);
    setUserName((payload.name as string) ?? null);
    setTokenStr(token);
  }, []);

  // Hydrate from cookie on first render
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)novacart_token=([^;]+)/);
    if (match) applyToken(match[1]);
  }, [applyToken]);

  const login = useCallback(
    (token: string) => {
      document.cookie = `novacart_token=${token}; path=/; SameSite=Lax`;
      localStorage.setItem("novacart_token", token);
      applyToken(token);
    },
    [applyToken],
  );

  const logout = useCallback(() => {
    document.cookie =
      "novacart_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("novacart_token");
    setIsLoggedIn(false);
    setRole(null);
    setIsVendor(false);
    setIsDelivery(false);
    setIsServiceProvider(false);
    setUserStore(null);
    setUserName(null);
    setTokenStr(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, role, isVendor, isDelivery, isServiceProvider, userStore, userName, token: tokenStr, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
