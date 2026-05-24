import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppCommandMenu } from "../components/navigation/AppCommandMenu";
import { SidebarNav } from "../components/navigation/SidebarNav";
import { TopNav } from "../components/navigation/TopNav";
import { cn } from "../lib/utils/cn";
import { useCopilotStore } from "../store/copilot-store";
import { useJobsStore } from "../store/jobs-store";
import { useRoadmapsStore } from "../store/roadmaps-store";
import { GlobalCopilotWidget } from "../features/copilot/components/GlobalCopilotWidget";
import { NebulaBackground } from "../components/common/NebulaBackground";
import { FloatingVedaPill } from "../components/navigation/FloatingVedaPill";

const SIDEBAR_COLLAPSED_KEY = "studybuddy_sidebar_collapsed";

function readSidebarPreference() {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

/** Wraps protected app pages with a premium, focused workspace shell. */
export function DashboardLayout() {
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(readSidebarPreference);
  const location = useLocation();
  const isVedaPage = location.pathname === "/copilot";
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
    <div className="premium-shell relative flex h-screen w-full bg-obsidian text-slate-100">
      <NebulaBackground />

      <aside 
        className={cn(
          "relative hidden h-full shrink-0 border-r border-white/[0.07] bg-[#0b0d10]/92 backdrop-blur-xl transition-[width] duration-300 lg:block",
          isSidebarCollapsed ? "w-[80px]" : "w-[264px]"
        )}
      >
        <SidebarNav
          isCollapsed={isSidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        />
      </aside>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden relative z-10">
        <TopNav onOpenCommand={() => setCommandOpen(true)} />
        <main className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <div className="flex min-h-full flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1480px] flex-1 min-h-0 animate-fade-in overflow-x-hidden">
              <Outlet />
            </div>
          </div>
        </main>
      </div>


      <AppCommandMenu open={isCommandOpen} onOpenChange={setCommandOpen} />
      {!isVedaPage && (
        <>
          <FloatingVedaPill />
          <GlobalCopilotWidget />
        </>
      )}
    </div>
  );
}
