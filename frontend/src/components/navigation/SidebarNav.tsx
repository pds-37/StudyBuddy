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
  Target,
  Users,
  FolderKanban,
  Settings,
  LogOut,
  Network
} from "lucide-react";
import { useAppStore } from "../../store/app-store";

import { useCopilotStore } from "../../store/copilot-store";
import { useJobsStore } from "../../store/jobs-store";
import { useRoadmapsStore } from "../../store/roadmaps-store";
import { cn } from "../../lib/utils/cn";

const navGroups = [
  [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Ask Veda", href: "/copilot", icon: MessageSquare },
  ],
  [
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Recall", href: "/recall", icon: Brain },
    { name: "Roadmap", href: "/roadmap", icon: Route },
  ],
  [
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Mentors", href: "/mentorship", icon: Users },
    { name: "Projects", href: "/projects", icon: FolderKanban },
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
      "flex h-full flex-col p-4 pt-8 overflow-hidden",
      isCollapsed && "px-2"
    )}>
      {/* Header / Logo Section */}
      <div className={cn(
        "flex items-center mb-10 px-2 transition-all duration-300 shrink-0",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <Link to="/" className="flex items-center group animate-fade-in">
              <img src="/brand/studybuddy-logo.png" alt="StudyBuddy VEDA AI MENTOR" className="h-10 w-auto object-contain scale-[1.3] origin-left drop-shadow-md" />
            </Link>
            <button
              onClick={onToggleCollapsed}
              className="p-2 rounded-lg hover:bg-slate-50 dark:bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleCollapsed}
            className="transition-transform hover:scale-105"
          >
            <div className="w-12 h-12 overflow-hidden rounded-xl bg-transparent">
              <img src="/brand/studybuddy-logo.png" alt="StudyBuddy" className="h-full w-auto max-w-none object-cover object-left" />
            </div>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 -mr-2 min-h-0">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={cn(
            "space-y-1",
            groupIndex > 0 && "pt-2 mt-2 border-t border-white/[0.05]"
          )}>
            {group.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center gap-4 px-3 py-2.5 rounded-2xl transition-all duration-300 relative",
                    isActive 
                      ? "bg-white/[0.05] text-slate-900 dark:text-slate-900 dark:text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" 
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-white hover:bg-white/[0.02]",
                    isCollapsed ? "justify-center px-0" : "px-3"
                  )}
                >
                  {isActive && (
                    <div className={cn(
                      "absolute left-0 w-1 bg-brand rounded-r-full shadow-[0_0_15px_var(--brand)]",
                      isCollapsed ? "h-8 top-1/2 -translate-y-1/2" : "h-6"
                    )} />
                  )}
                  <item.icon 
                    size={20} 
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "text-brand scale-110" : "group-hover:text-slate-900 dark:text-slate-900 dark:text-white group-hover:scale-110"
                    )} 
                  />
                  {!isCollapsed && (
                    <span className={cn(
                      "flex-1 font-semibold text-sm transition-all duration-300",
                      isActive ? "translate-x-1" : "group-hover:translate-x-1"
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

      {/* Bottom Profile Section */}
      <div className="mt-auto pt-6 border-t border-white/[0.05] shrink-0">
        {!isCollapsed ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-[2rem] glass border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand to-cyan p-[1px]">
                  <div className="w-full h-full rounded-full bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4">
                    {userInitials}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white truncate">{user?.name || "User"}</p>
                  <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link 
                to="/settings"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all text-xs font-bold"
              >
                <Settings size={14} />
                Settings
              </Link>

              <button 
                onClick={() => clearSession?.()}
                className="p-3 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/5 text-slate-500 dark:text-slate-400 hover:text-red-400 transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand to-cyan p-[1px] cursor-pointer hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full bg-white dark:bg-obsidian flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold">
                  {userInitials}
                </div>
             </div>
             <Link 
                to="/settings"
                className="p-3 rounded-xl hover:bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-white transition-colors"
              >
               <Settings size={20} />
             </Link>

             <button 
                onClick={() => clearSession?.()}
                className="p-3 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={20} />
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
