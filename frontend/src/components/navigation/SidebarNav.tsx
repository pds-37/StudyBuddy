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

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  highlight?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "LEARNING",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
      { name: "Skill Gap", href: "/skill-gap", icon: Target },
    ]
  },
  {
    title: "AI ENGINE",
    items: [
      { name: "Ask Veda", href: "/copilot", icon: MessageSquare, highlight: true },
      { name: "AI Interview", href: "/interview", icon: Sparkles }
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
      "flex h-full flex-col overflow-hidden py-5 px-4 bg-[#050608]/95 relative z-30 selection:bg-brand/35 selection:text-white",
      isCollapsed && "px-2"
    )}>
      {/* Dynamic Background Haze inside Sidebar */}
      <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-brand/5 blur-[50px] pointer-events-none" />

      {/* TOP BRAND SECTION */}
      <div className={cn(
        "mb-8 flex shrink-0 items-center px-1.5 transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <Link to="/" className="flex items-center group animate-fade-in relative z-10">
              <img src="/brand/studybuddy-logo.png" alt="StudyBuddy" className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" />
            </Link>
            <button
              onClick={onToggleCollapsed}
              className="rounded-xl p-2 text-slate-500 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all duration-200"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleCollapsed}
            className="transition-transform duration-300 hover:scale-105 active:scale-95"
            aria-label="Expand sidebar"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <img src="/brand/studybuddy-favicon-512.png" alt="StudyBuddy" className="h-6 w-6 object-contain" />
            </div>
          </button>
        )}
      </div>

      {/* CENTER - HIGH-FIDELITY NAVIGATION LIST */}
      <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 min-h-0 relative z-10">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 mb-2 font-mono">
                {group.title}
              </h4>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
                    isActive 
                      ? "bg-gradient-to-r from-brand/12 to-accent/8 text-white border border-brand/20 shadow-[0_4px_20px_-5px_rgba(99,102,241,0.15)]" 
                      : item.highlight 
                        ? "bg-cyan/5 text-cyan hover:bg-cyan/10 hover:text-cyan-light border border-cyan/10"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white border border-transparent hover:border-white/[0.02]",
                    isCollapsed ? "justify-center px-0 py-3 mx-1" : ""
                  )}
                >
                  {/* Active Indicator Accent Line */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full bg-gradient-to-b from-brand to-accent shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}

                  <item.icon 
                    size={isCollapsed ? 20 : 16} 
                    className={cn(
                      "transition-all duration-300",
                      isActive 
                        ? "text-brand-light drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" 
                        : item.highlight
                          ? "text-cyan"
                          : "text-slate-500 group-hover:text-white group-hover:scale-105"
                    )} 
                  />
                  
                  {!isCollapsed && (
                    <span className={cn(
                      "flex-1 text-[13px] font-semibold tracking-wide transition-colors",
                      isActive ? "text-white" : ""
                    )}>
                      {item.name}
                    </span>
                  )}

                  {/* Active dot for highlights */}
                  {item.highlight && !isCollapsed && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* BOTTOM CONTROL & ACCOUNT CARD */}
      <div className="mt-6 pt-5 border-t border-white/[0.05] shrink-0 relative z-10">
        {!isCollapsed ? (
          <div className="space-y-3.5 animate-fade-in">
            <Link 
              to="/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:text-white border border-transparent hover:bg-white/[0.04] hover:border-white/[0.02] transition-all"
            >
              <Settings size={16} className="text-slate-500 transition-transform group-hover:rotate-45" />
              <span className="text-[13px] font-semibold tracking-wide">Settings Console</span>
            </Link>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0c0e12]/60 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-brand/20 to-accent/20 text-xs font-black text-brand-light border border-brand/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-bold text-white leading-tight">{user?.name || "Candidate"}</p>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 mt-0.5 font-mono">Verified</p>
                </div>
              </div>
              <button 
                onClick={() => clearSession?.()}
                className="rounded-lg p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                aria-label="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
             <Link 
                to="/settings"
                className="rounded-xl p-2.5 text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all"
                title="Settings"
              >
               <Settings size={20} />
             </Link>

             <div className="h-px w-6 bg-white/[0.06] my-1" />

             <button 
                onClick={() => clearSession?.()}
                className="rounded-xl p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                aria-label="Log out"
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
