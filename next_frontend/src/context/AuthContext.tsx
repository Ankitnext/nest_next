"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface AuthContextValue {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Read cookie on first render (client-side only)
  useEffect(() => {
    setIsLoggedIn(document.cookie.includes("novacart_token="));
  }, []);

  const login = useCallback((token: string) => {
    // Persist in both cookie (for middleware) and localStorage (for API calls)
    document.cookie = `novacart_token=${token}; path=/; SameSite=Lax`;
    localStorage.setItem("novacart_token", token);
    // Update context state immediately — no reload needed
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    document.cookie =
      "novacart_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("novacart_token");
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
