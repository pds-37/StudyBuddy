import { Link, useLocation } from "react-router-dom";
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  FilePenLine,
  FileText,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  Target,
  User,
  FolderKanban,
  Users
} from "lucide-react";
import { useAppStore } from "../../store/app-store";
import { useCopilotStore } from "../../store/copilot-store";
import { useJobsStore } from "../../store/jobs-store";
import { useRoadmapsStore } from "../../store/roadmaps-store";
import { cn } from "../../lib/utils/cn";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Copilot", href: "/copilot", icon: MessageSquare },
  { name: "Notes", href: "/notes", icon: FileText },
  { name: "Roadmap", href: "/roadmap", icon: Route },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Mentors", href: "/mentorship", icon: Users },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Resume", href: "/resume", icon: FilePenLine },
  { name: "Skill Gap", href: "/skill-gap", icon: Target },
  { name: "Profile", href: "/onboarding", icon: User }
] as const;

type SidebarNavProps = {
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
};

/** Renders a compact workspace sidebar. */
export function SidebarNav({ isCollapsed = false, onToggleCollapsed }: SidebarNavProps) {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const jobs = useJobsStore((state) => state.jobs);
  const currentRoadmap = useRoadmapsStore((state) => state.currentRoadmap);
  const conversations = useCopilotStore((state) => state.conversations);

  const getStatusIndicator = (href: string) => {
    switch (href) {
      case "/jobs":
        return jobs.length > 0 ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : null;
      case "/roadmap":
        return currentRoadmap ? (
          <CheckCircle className="h-3 w-3 text-emerald-400" />
        ) : (
          <AlertCircle className="h-3 w-3 text-amber-400" />
        );
      case "/copilot":
        return conversations.length > 0 ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : null;
      default:
        return null;
    }
  };

  const getItemCount = (href: string) => {
    if (href === "/jobs" && jobs.length > 0) {
      return String(jobs.length);
    }

    if (href === "/copilot" && conversations.length > 0) {
      return String(conversations.length);
    }

    return "";
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col p-4 transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      <div
        className={cn(
          "flex gap-3 pb-3 pt-2",
          isCollapsed ? "justify-center px-0" : "items-start justify-between px-2"
        )}
      >
        {!isCollapsed ? (
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan">Workspace</p>
            <h2 className="mt-2 truncate text-lg font-semibold tracking-tight text-white">
              {user?.targetRole || "Career setup"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {user?.onboardingCompleted ? "Ready" : "Profile incomplete"}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            "grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white/[0.04] hover:text-white",
            isCollapsed && "h-10 w-10"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="grid gap-1.5">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const itemCount = getItemCount(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition font-medium",
                isActive
                  ? "bg-white/[0.06] text-white"
                  : "text-[#888888] hover:bg-white/[0.03] hover:text-white",
                isCollapsed && "justify-center px-2"
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 flex-shrink-0 place-items-center transition",
                  isActive ? "text-white" : "text-[#888888] group-hover:text-white"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              {!isCollapsed ? (
                <>
                  <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                  {itemCount ? (
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-400">
                      {itemCount}
                    </span>
                  ) : (
                    getStatusIndicator(item.href)
                  )}
                </>
              ) : itemCount || getStatusIndicator(item.href) ? (
                <span className="absolute right-1.5 top-1.5 h-2.5 min-w-2.5 rounded-full border border-ink bg-cyan text-[0px] text-ink" />
              ) : null}
            </Link>
          );
        })}
      </nav>

        <div className="mt-auto rounded-2xl border border-white/[0.04] bg-white/[0.01] p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Jobs</span>
            <span className="font-semibold text-white">{jobs.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Roadmap</span>
            <span className="font-semibold text-white">{currentRoadmap ? "Active" : "Pending"}</span>
          </div>
        </div>
        <div className="mt-auto grid gap-1.5">
          <div
            className="grid h-10 place-items-center rounded-xl border border-white/[0.04] bg-white/[0.01] text-xs font-semibold text-white"
            title={`${jobs.length} jobs loaded`}
          >
            {jobs.length}
          </div>
          <div
            className={cn(
              "grid h-10 place-items-center rounded-xl border border-white/[0.04] bg-white/[0.01]",
              currentRoadmap ? "text-emerald-400" : "text-amber-400"
            )}
            title={currentRoadmap ? "Roadmap active" : "Roadmap pending"}
          >
            {currentRoadmap ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          </div>
        </div>
      )}
    </div>
  );
}
