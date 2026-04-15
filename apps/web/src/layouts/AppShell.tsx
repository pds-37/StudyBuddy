import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import ComposerModal from "@/components/ComposerModal";
import LoadingScreen from "@/components/LoadingScreen";
import Sidebar from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";

export default function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const session = useSession();

  if (session.isLoading) {
    return <LoadingScreen />;
  }

  if (!session.data?.user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="app-shell app-shell--topnav">
      <Sidebar user={session.data.user} />
      <div className="app-shell__main app-shell__main--topnav">
        <div className="top-glow" />
        <div className="app-shell__content">{children}</div>
      </div>
      <ComposerModal />
    </div>
  );
}
