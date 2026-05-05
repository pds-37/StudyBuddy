import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { authApi } from "../features/auth/api";
import { ServerWakeUpLoader } from "../components/common/ServerWakeUpLoader";
import { Loader2 } from "lucide-react";
import { env } from "../lib/constants/env";
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

  const [isServerCold, setServerCold] = useState(false);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    const checkServer = async () => {
      const timeout = setTimeout(() => setServerCold(true), 2500);
      try {
        // Ping the health endpoint (outside /api)
        const healthUrl = env.apiBaseUrl.replace(/\/api$/, "/health");
        await fetch(healthUrl);
        setReady(true);
      } catch (error) {
        console.warn("Backend still waking up...", error);
        // Retry every 3s
        setTimeout(checkServer, 3000);
      } finally {
        clearTimeout(timeout);
      }
    };

    void checkServer();
  }, []);

  useEffect(() => {
    if (!accessToken || !isReady) {
      return;
    }

    void authApi.me().then(setUser).catch(clearSession);
  }, [accessToken, clearSession, setUser, isReady]);

  if (!isReady && isServerCold) {
    return <ServerWakeUpLoader />;
  }

  if (!isReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-obsidian">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}
