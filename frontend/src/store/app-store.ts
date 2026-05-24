import { create } from "zustand";
import { setApiAccessToken } from "../lib/api/client";
import { type AuthUser } from "../features/auth/types";
import { DEMO_SESSION_KEY, demoUser } from "../lib/demo/student-demo";

const ACCESS_TOKEN_KEY = "studybuddy_access_token";
const REFRESH_TOKEN_KEY = "studybuddy_refresh_token";

/** Reads stored auth tokens in browser environments. */
function readStoredTokens() {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    isDemoMode: localStorage.getItem(DEMO_SESSION_KEY) === "true"
  };
}

const initialTokens = readStoredTokens();
setApiAccessToken(initialTokens.isDemoMode ? null : initialTokens.accessToken);

type AppState = {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  startDemoSession: () => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  hydrateSession: () => void;
};

/** Stores the JWT auth session for the browser client. */
export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: initialTokens.isDemoMode || Boolean(initialTokens.accessToken && initialTokens.refreshToken),
  isDemoMode: Boolean(initialTokens.isDemoMode),
  accessToken: initialTokens.isDemoMode ? null : initialTokens.accessToken,
  refreshToken: initialTokens.isDemoMode ? null : initialTokens.refreshToken,
  user: initialTokens.isDemoMode ? demoUser : null,
  setSession: (accessToken, refreshToken, user) => {
    localStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setApiAccessToken(accessToken);
    set({ accessToken, refreshToken, user, isAuthenticated: true, isDemoMode: false });
  },
  startDemoSession: () => {
    localStorage.setItem(DEMO_SESSION_KEY, "true");
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setApiAccessToken(null);
    set({
      accessToken: null,
      refreshToken: null,
      user: demoUser,
      isAuthenticated: true,
      isDemoMode: true
    });
  },
  setUser: (user) => {
    set({ user });
  },
  clearSession: () => {
    localStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setApiAccessToken(null);
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false, isDemoMode: false });
  },
  hydrateSession: () => {
    const { accessToken, refreshToken, isDemoMode } = readStoredTokens();

    if (isDemoMode) {
      setApiAccessToken(null);
      set({ accessToken: null, refreshToken: null, user: demoUser, isAuthenticated: true, isDemoMode: true });
      return;
    }

    if (!accessToken || !refreshToken) {
      return;
    }

    setApiAccessToken(accessToken);
    set({ accessToken, refreshToken, isAuthenticated: true, isDemoMode: false });
  }
}));
