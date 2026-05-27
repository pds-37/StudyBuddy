import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";
import { GlobalCopilotWidget } from "../features/copilot/components/GlobalCopilotWidget";

/** Wraps public pages with the premium marketing navigation. */
export function MarketingLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  const isLandingPage = location.pathname === "/";

  return (
    <div className="bg-ai-workspace min-h-screen text-slate-100 relative">
      {!isLandingPage && <TopNav />}
      <main className="animate-fade-in relative z-10">
        <Outlet />
      </main>
      {!isAuthPage && <GlobalCopilotWidget />}
    </div>
  );
}
