import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { authApi } from "../features/auth/api";
import { useAppStore } from "../store/app-store";

type AppProvidersProps = {
  children: ReactNode;
};

/** Provides browser routing and server-state caching for the app. */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const accessToken = useAppStore((state) => state.accessToken);
  const clearSession = useAppStore((state) => state.clearSession);
  const hydrateSession = useAppStore((state) => state.hydrateSession);
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void authApi.me().then(setUser).catch(clearSession);
  }, [accessToken, clearSession, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}
