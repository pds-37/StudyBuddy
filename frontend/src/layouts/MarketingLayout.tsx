import { Outlet } from "react-router-dom";
import { TopNav } from "../components/navigation/TopNav";

/** Wraps public pages with the premium marketing navigation. */
export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <TopNav />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
