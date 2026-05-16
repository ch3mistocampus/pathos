"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type AuthUser = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
};

const STORAGE_KEY = "pathos.auth.user";
const STORAGE_EVENT = "pathos-auth-change";
let cachedRawUser: string | null | undefined;
let cachedUser: AuthUser | null = null;

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveName(email: string): string {
  const localPart = email.split("@")[0] || "Researcher";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRawUser) return cachedUser;
    cachedRawUser = raw;
    if (!raw) {
      cachedUser = null;
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed.email || !parsed.name) {
      cachedUser = null;
      return null;
    }
    cachedUser = { email: parsed.email, name: parsed.name };
    return cachedUser;
  } catch {
    cachedRawUser = undefined;
    cachedUser = null;
    return null;
  }
}

function subscribeToAuthStore(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

function emitAuthChange() {
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(
    subscribeToAuthStore,
    readStoredUser,
    () => null,
  );

  const login = useCallback((email: string, name?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const nextUser = {
      email: normalizedEmail,
      name: name?.trim() || deriveName(normalizedEmail),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    emitAuthChange();
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    emitAuthChange();
  }, []);

  const value = useMemo(
    () => ({ user, ready: true, login, logout }),
    [login, logout, user],
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
