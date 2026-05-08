import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";
import { GlobalCopilotWidget } from "../features/copilot/components/GlobalCopilotWidget";

/** Wraps public pages with the premium marketing navigation. */
export function MarketingLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  return (
    <div className="min-h-screen bg-ink bg-white dark:bg-ink$4">
      <TopNav />
      <main>
        <Outlet />
      </main>
      {!isAuthPage && <GlobalCopilotWidget />}
    </div>
  );
}
