import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AppCommandMenu } from "../components/navigation/AppCommandMenu";
import { SidebarNav } from "../components/navigation/SidebarNav";
import { TopNav } from "../components/navigation/TopNav";
import { cn } from "../lib/utils/cn";
import { useCopilotStore } from "../store/copilot-store";
import { useJobsStore } from "../store/jobs-store";
import { useRoadmapsStore } from "../store/roadmaps-store";

const SIDEBAR_COLLAPSED_KEY = "studybuddy_sidebar_collapsed";

/** Reads the user's last sidebar preference without breaking non-browser rendering. */
function readSidebarPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

/** Wraps protected app pages with a compact premium workspace shell. */
export function DashboardLayout() {
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(readSidebarPreference);
  const fetchJobs = useJobsStore((state) => state.fetchJobs);
  const fetchRoadmaps = useRoadmapsStore((state) => state.fetchRoadmaps);
  const fetchConversations = useCopilotStore((state) => state.fetchConversations);

  useEffect(() => {
    void fetchJobs();
    void fetchRoadmaps();
    void fetchConversations();
  }, [fetchConversations, fetchJobs, fetchRoadmaps]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-ink text-slate-100 flex flex-col md:flex-row">
      <aside className="sticky top-0 z-30 hidden h-screen shrink-0 border-r border-white/[0.04] bg-panel md:block">
        <SidebarNav
          isCollapsed={isSidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav onOpenCommand={() => setCommandOpen(true)} />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <AppCommandMenu open={isCommandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
