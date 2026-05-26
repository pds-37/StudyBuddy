import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";
import { GlobalCopilotWidget } from "../features/copilot/components/GlobalCopilotWidget";

/** Wraps public pages with the premium marketing navigation. */
export function MarketingLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  return (
    <div className="premium-shell min-h-screen bg-obsidian text-slate-100">
      <TopNav />
      <main className="animate-fade-in">
        <Outlet />
      </main>
      {!isAuthPage && <GlobalCopilotWidget />}
    </div>
  );
}
