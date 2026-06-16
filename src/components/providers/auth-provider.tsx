"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/pocketbase/client";
import type { User } from "@/types/pocketbase";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pb = getBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUser = () => {
      setUser((pb.authStore.model as User | null) ?? null);
      setIsLoading(false);
    };

    syncUser();
    const unsubscribe = pb.authStore.onChange(syncUser);
    return unsubscribe;
  }, [pb]);

  const login = useCallback(async () => {
    await pb.collection("users").authWithOAuth2({
      provider: "google",
    });
    router.push("/dashboard");
    router.refresh();
  }, [pb, router]);

  const logout = useCallback(() => {
    pb.authStore.clear();
    router.push("/login");
    router.refresh();
  }, [pb, router]);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
