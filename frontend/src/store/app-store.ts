import { create } from "zustand";
import { setApiAccessToken } from "../lib/api/client";
import { type AuthUser } from "../features/auth/types";

const ACCESS_TOKEN_KEY = "studybuddy_access_token";
const REFRESH_TOKEN_KEY = "studybuddy_refresh_token";

/** Reads stored auth tokens in browser environments. */
function readStoredTokens() {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY)
  };
}

const initialTokens = readStoredTokens();
setApiAccessToken(initialTokens.accessToken);

type AppState = {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  hydrateSession: () => void;
};

/** Stores the JWT auth session for the browser client. */
export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: Boolean(initialTokens.accessToken && initialTokens.refreshToken),
  accessToken: initialTokens.accessToken,
  refreshToken: initialTokens.refreshToken,
  user: null,
  setSession: (accessToken, refreshToken, user) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setApiAccessToken(accessToken);
    set({ accessToken, refreshToken, user, isAuthenticated: true });
  },
  setUser: (user) => {
    set({ user });
  },
  clearSession: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setApiAccessToken(null);
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
  },
  hydrateSession: () => {
    const { accessToken, refreshToken } = readStoredTokens();

    if (!accessToken || !refreshToken) {
      return;
    }

    setApiAccessToken(accessToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  }
}));
