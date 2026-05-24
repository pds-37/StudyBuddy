import { Link, useLocation } from "react-router-dom";
import {
  Briefcase,
  Building2,
  FilePenLine,
  FileText,
  Brain,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  Route,
  Target,
  Users,
  FolderKanban,
  Settings,
  LogOut,
  Network
} from "lucide-react";
import { useAppStore } from "../../store/app-store";

import { cn } from "../../lib/utils/cn";

const navGroups = [
  [
    { name: "Today", href: "/dashboard", icon: LayoutDashboard },
    { name: "Veda", href: "/copilot", icon: MessageSquare },
  ],
  [
    { name: "Learn", href: "/notes", icon: FileText },
    { name: "Revise", href: "/recall", icon: Brain },
    { name: "Roadmap", href: "/roadmap", icon: Route },
  ],
  [
    { name: "Apply", href: "/jobs", icon: Briefcase },
    { name: "Companies", href: "/companies", icon: Building2 },
    { name: "Mentors", href: "/mentorship", icon: Users },
    { name: "Build", href: "/projects", icon: FolderKanban },
    { name: "Resume", href: "/resume", icon: FilePenLine },
    { name: "Skill Gap", href: "/skill-gap", icon: Target },
  ],
  [
    { name: "Knowledge", href: "/knowledge", icon: Network },
  ]
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
      "flex h-full flex-col overflow-hidden px-3 py-5",
      isCollapsed && "px-2"
    )}>
      <div className={cn(
        "mb-7 flex shrink-0 items-center px-2 transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <Link to="/" className="flex items-center group animate-fade-in">
              <img src="/brand/studybuddy-logo.png" alt="StudyBuddy VEDA AI MENTOR" className="h-9 w-auto origin-left object-contain" />
            </Link>
            <button
              onClick={onToggleCollapsed}
              className="rounded-lg border border-white/[0.06] p-2 text-slate-500 transition-colors hover:bg-white/[0.045] hover:text-white"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleCollapsed}
            className="transition-transform hover:scale-105"
            aria-label="Expand sidebar"
          >
            <div className="h-11 w-11 overflow-hidden rounded-lg bg-transparent">
              <img src="/brand/studybuddy-logo.png" alt="StudyBuddy" className="h-full w-auto max-w-none object-cover object-left" />
            </div>
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 -mr-2 min-h-0">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={cn(
            "space-y-1.5",
            groupIndex > 0 && "mt-3 border-t border-white/[0.055] pt-3"
          )}>
            {group.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                    isActive 
                      ? "bg-white/[0.065] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" 
                      : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-200",
                    isCollapsed ? "justify-center px-0" : "px-3"
                  )}
                >
                  {isActive && (
                    <div className={cn(
                      "absolute left-0 w-0.5 rounded-r-full bg-brand",
                      isCollapsed ? "h-8 top-1/2 -translate-y-1/2" : "h-6"
                    )} />
                  )}
                  <item.icon 
                    size={20} 
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "text-brand" : "text-slate-500 group-hover:text-slate-200"
                    )} 
                  />
                  {!isCollapsed && (
                    <span className={cn(
                      "flex-1 text-sm font-medium transition-colors",
                      isActive ? "text-white" : "text-slate-500 group-hover:text-slate-200"
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

      <div className="mt-auto pt-6 border-t border-white/[0.05] shrink-0">
        {!isCollapsed ? (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg border border-brand/25 bg-brand/10">
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand">
                    {userInitials}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{user?.name || "User"}</p>
                  <p className="truncate text-[10px] uppercase tracking-widest text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link 
                to="/settings"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] py-2.5 text-xs font-semibold text-slate-400 transition-all hover:bg-white/[0.05] hover:text-white"
              >
                <Settings size={14} />
                Settings
              </Link>

              <button 
                onClick={() => clearSession?.()}
                className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-2.5 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-300"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <div className="h-11 w-11 cursor-pointer rounded-lg border border-brand/25 bg-brand/10 transition-transform hover:scale-105">
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand">
                  {userInitials}
                </div>
             </div>
             <Link 
                to="/settings"
                className="rounded-lg p-3 text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
               <Settings size={20} />
             </Link>

             <button 
                onClick={() => clearSession?.()}
                className="rounded-lg p-3 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
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
