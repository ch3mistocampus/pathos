"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// Hackathon demo auth: single hard-coded credential pair. NOT real auth — this
// is a localStorage flag that the Convex submitVariant mutation reads to stamp
// `user_id` on submissions. Swap for Convex Auth or Clerk once we want real
// multi-user identity.
const DEMO_CREDENTIALS = {
  username: "claude",
  password: "hackathon",
};

export type AuthUser = {
  username: string;
  /** Legacy fields kept so existing UI (`user.name`, `user.email`) doesn't break. */
  name: string;
  email: string;
};

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (username: string, password: string) => LoginResult;
  logout: () => void;
};

const STORAGE_KEY = "pathos.auth.user";
const STORAGE_EVENT = "pathos-auth-change";
let cachedRawUser: string | null | undefined;
let cachedUser: AuthUser | null = null;

const AuthContext = createContext<AuthContextValue | null>(null);

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
    if (!parsed.username) {
      cachedUser = null;
      return null;
    }
    cachedUser = {
      username: parsed.username,
      name: parsed.name ?? parsed.username,
      email: parsed.email ?? `${parsed.username}@pathos.local`,
    };
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

  const login = useCallback((username: string, password: string): LoginResult => {
    const u = username.trim().toLowerCase();
    if (u !== DEMO_CREDENTIALS.username || password !== DEMO_CREDENTIALS.password) {
      return {
        ok: false,
        error:
          "Invalid credentials. Hackathon demo accepts username 'claude' and password 'hackathon'.",
      };
    }
    const nextUser: AuthUser = {
      username: u,
      name: u.charAt(0).toUpperCase() + u.slice(1),
      email: `${u}@pathos.local`,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    emitAuthChange();
    return { ok: true };
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
