import { Link, useLocation } from "react-router-dom";
import {
  Briefcase,
  FilePenLine,
  FileText,
  Brain,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  Route,
  FolderKanban,
  Settings,
  LogOut,
  Network,
  Sparkles,
  Zap,
  Building2,
  Users,
  Target
} from "lucide-react";
import { useAppStore } from "../../store/app-store";

import { cn } from "../../lib/utils/cn";

const navGroups = [
  {
    title: "LEARNING",
    items: [
      { name: "Roadmap", href: "/roadmap", icon: Route },
      { name: "Notes", href: "/notes", icon: FileText },
      { name: "Recall", href: "/recall", icon: Brain },
      { name: "Knowledge", href: "/knowledge", icon: Network },
    ]
  },
  {
    title: "CAREER",
    items: [
      { name: "Jobs", href: "/jobs", icon: Briefcase },
      { name: "Resume", href: "/resume", icon: FilePenLine },
      { name: "Projects", href: "/projects", icon: FolderKanban },
      { name: "Companies", href: "/companies", icon: Building2 },
      { name: "Mentors", href: "/mentorship", icon: Users },
      { name: "Skill Gap", href: "/skill-gap", icon: Target },
    ]
  },
  {
    title: "AI",
    items: [
      { name: "Ask Veda", href: "/copilot", icon: MessageSquare },
      { name: "Insights", href: "/dashboard", icon: LayoutDashboard },
      { name: "Predictions", href: "/dashboard", icon: Sparkles },
    ]
  }
];

type SidebarNavProps = {
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
};

export function SidebarNav({ isCollapsed = false, onToggleCollapsed }: SidebarNavProps) {
  const location = useLocation();
  const { user } = useAppStore();
  const clearSession = useAppStore((state) => state.clearSession);
  
  const userInitials = (user?.name || user?.email || "U").substring(0, 2).toUpperCase();

  return (
    <div className={cn(
      "flex h-full flex-col overflow-hidden py-5 px-3",
      isCollapsed && "px-2"
    )}>
      {/* TOP */}
      <div className={cn(
        "mb-8 flex shrink-0 items-center px-2 transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <Link to="/" className="flex items-center group animate-fade-in">
              <img src="/brand/studybuddy-logo.png" alt="StudyBuddy" className="h-8 w-auto object-contain" />
            </Link>
            <button
              onClick={onToggleCollapsed}
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleCollapsed}
            className="transition-transform hover:scale-105"
            aria-label="Expand sidebar"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10">
              <img src="/brand/studybuddy-favicon-512.png" alt="StudyBuddy" className="h-6 w-6 object-contain" />
            </div>
          </button>
        )}
      </div>

      {/* CENTER - NAVIGATION */}
      <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 min-h-0">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1.5">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
                {group.title}
              </h4>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-300",
                    isActive 
                      ? "bg-brand/10 text-brand shadow-[inset_0_0_0_1px_rgba(124,58,237,0.15)]" 
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                    isCollapsed ? "justify-center px-0 py-2.5 mx-1" : ""
                  )}
                >
                  <item.icon 
                    size={isCollapsed ? 20 : 18} 
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "text-brand" : "text-text-muted group-hover:text-text-primary"
                    )} 
                  />
                  {!isCollapsed && (
                    <span className={cn(
                      "flex-1 text-sm font-medium transition-colors",
                      isActive ? "text-brand-light" : ""
                    )}>
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* BOTTOM */}
      <div className="mt-6 pt-6 border-t border-border shrink-0">
        {!isCollapsed ? (
          <div className="space-y-3 animate-fade-in">
            <Link 
              to="/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-text-secondary transition-all hover:bg-white/5 hover:text-text-primary"
            >
              <Settings size={18} className="text-text-muted" />
              <span className="text-sm font-medium">Settings</span>
            </Link>

            <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-text-primary border border-border">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{user?.name || "User"}</p>
                </div>
              </div>
              <button 
                onClick={() => clearSession?.()}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 shrink-0"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
             <Link 
                to="/settings"
                className="rounded-xl p-2.5 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
              >
               <Settings size={20} />
             </Link>

             <div className="h-px w-6 bg-border my-1" />

             <button 
                onClick={() => clearSession?.()}
                className="rounded-xl p-2.5 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label="Log out"
              >
                <LogOut size={20} />
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
