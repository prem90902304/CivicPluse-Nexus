import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/api/services";
import type { AuthUser, UserRole } from "@/api/services/types";
import { tokenStore } from "@/api/client";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const cached = tokenStore.getUser<AuthUser>();
    if (cached) setUserState(cached);
    setIsHydrated(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setUserState(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUserState(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await authService.me();
      tokenStore.setUser(me);
      setUserState(me);
    } catch {
      /* ignore */
    }
  }, []);

  const setUser = useCallback((u: AuthUser) => {
    tokenStore.setUser(u);
    setUserState(u);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isHydrated,
      role: user?.role ?? null,
      login,
      logout,
      refresh,
      setUser,
    }),
    [user, isHydrated, login, logout, refresh, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
