import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Command, Menu, Search, Sparkles, X, Settings, LogOut } from "lucide-react";
import { cn } from "../../lib/utils/cn";
import { useAppStore } from "../../store/app-store";
import { NotificationsPopover } from "../NotificationsPopover";
import { navGroups } from "./SidebarNav";

const landingSections = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-to-use" },
  { label: "Pricing", href: "#pricing" }
] as const;

type TopNavProps = {
  onOpenCommand?: () => void;
};

export function TopNav({ onOpenCommand }: TopNavProps) {
  const location = useLocation();
  const { isAuthenticated, user, isDemoMode, clearSession } = useAppStore();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname.startsWith("/auth");
  const isAppShell = !isLandingPage && !isAuthPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userInitials = useMemo(() => {
    const source = user?.name || user?.email || "U";
    return source.substring(0, 2).toUpperCase();
  }, [user]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 w-full shrink-0 items-center transition-all duration-300",
        isAppShell 
          ? "border-b border-white/[0.07] bg-[#07080a]/82 backdrop-blur-xl" 
          : isScrolled 
            ? "border-b border-white/[0.07] bg-[#07080a]/90 shadow-sm backdrop-blur-xl"
            : "bg-[#07080a]/70 backdrop-blur-lg"
      )}
    >
      <div className={cn(
        "mx-auto flex w-full items-center justify-between px-4 sm:px-6 lg:px-8",
        isAppShell ? "max-w-full" : "max-w-7xl"
      )}>
        {/* Left Side: Brand or Search */}
        <div className="flex items-center gap-8 flex-1">
          {(!isAppShell || isLandingPage) && (
            <Link to="/" className="flex items-center group">
              <img src="/brand/studybuddy-logo.png" alt="StudyBuddy Logo" className="h-10 w-auto origin-left object-contain" />
            </Link>
          )}

          {isAppShell && (
            <div className="flex-1 max-w-xl">
              <button
                onClick={onOpenCommand}
                className="group flex w-full items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3.5 py-2.5 text-white shadow-[0_12px_36px_rgba(0,0,0,0.16)] transition-all hover:border-white/[0.13] hover:bg-white/[0.055]"
              >
                <Search size={18} className="shrink-0 text-brand" />
                <span className="truncate text-sm font-medium text-slate-400">
                  <span className="hidden sm:inline">Search tasks, notes, resume, jobs...</span>
                  <span className="sm:hidden">Search...</span>
                </span>
                <div className="ml-auto hidden sm:flex items-center gap-1.5 rounded-md border border-white/[0.09] bg-white/[0.045] px-2 py-1 text-[10px] font-bold text-slate-300">
                  <Command size={10} />
                  <span>K</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Center: Navigation (Landing Only) */}
        {isLandingPage && (
          <nav className="hidden items-center gap-8 lg:flex">
            {landingSections.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-slate-500 transition-all hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Side: Actions/Profile */}
        <div className="flex items-center gap-6 flex-1 justify-end">
          {isAppShell ? (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand lg:flex">
                <Sparkles size={14} />
                <span>{isDemoMode ? "Demo Pro" : "Student Plan"}</span>
              </div>
              
              <NotificationsPopover />

              <div className="group flex cursor-pointer items-center gap-3 border-l border-white/[0.07] pl-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white transition-colors group-hover:text-brand">{user?.name || "User"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {isDemoMode ? "Recruiter Demo" : user?.subscription?.plan ?? "Free Tier"}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-lg border border-brand/25 bg-brand/10 transition-transform group-hover:scale-105">
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand">
                    {userInitials}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth" className="px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:text-white">
                Log in
              </Link>
              <Link to="/demo" className="px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:text-white">
                Demo
              </Link>
              <Link 
                to="/auth" 
                className="premium-button rounded-lg px-5 py-2.5 text-sm font-bold transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="rounded-lg p-2.5 text-slate-500 transition-all hover:bg-white/[0.05] hover:text-white lg:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-4 right-4 top-[72px] rounded-xl border border-white/[0.08] bg-[#0b0d10]/95 p-4 shadow-2xl backdrop-blur-xl lg:hidden">
           {isLandingPage && landingSections.map((item) => (
             <a
               key={item.label}
               href={item.href}
               className="block rounded-lg px-3 py-2 text-base font-medium text-slate-400 hover:bg-white/[0.05] hover:text-white"
               onClick={() => setMenuOpen(false)}
             >
               {item.label}
             </a>
           ))}
           {!isAuthenticated && (
             <div className="pt-4 space-y-4">
               <Link to="/auth" className="block w-full rounded-lg border border-white/[0.08] py-3 text-center font-medium text-white" onClick={() => setMenuOpen(false)}>
                 Sign in
               </Link>
               <Link to="/auth" className="premium-button block w-full rounded-lg py-3 text-center font-bold" onClick={() => setMenuOpen(false)}>
                 Get Started
               </Link>
               <Link to="/demo" className="block w-full rounded-lg border border-brand/30 py-3 text-center font-bold text-brand" onClick={() => setMenuOpen(false)}>
                 Try Demo
               </Link>
             </div>
           )}
           {isAuthenticated && isAppShell && (
             <div className="space-y-6">
               {/* User Info Header */}
               <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 shadow-inner">
                 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-brand/20 to-accent/20 text-xs font-black text-brand-light border border-brand/20">
                   {userInitials}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="truncate text-sm font-bold text-white leading-tight">{user?.name || "Candidate"}</p>
                   <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-0.5 font-mono">
                     {isDemoMode ? "Recruiter Demo" : user?.subscription?.plan ?? "Free Tier"}
                   </p>
                 </div>
               </div>

               {/* Navigation Groups */}
               <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                 {navGroups.map((group, groupIndex) => (
                   <div key={groupIndex} className="space-y-1 text-left">
                     <h4 className="px-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 mb-1.5 font-mono">
                       {group.title}
                     </h4>
                     {group.items.map((item) => {
                       const isActive = location.pathname === item.href;
                       return (
                         <Link
                           key={item.name}
                           to={item.href}
                           onClick={() => setMenuOpen(false)}
                           className={cn(
                             "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                             isActive
                               ? "bg-gradient-to-r from-brand/12 to-accent/8 text-white border border-brand/20 shadow-[0_4px_20px_-5px_rgba(99,102,241,0.15)]"
                               : item.highlight
                                 ? "bg-cyan/5 text-cyan hover:bg-cyan/10 border border-cyan/10"
                                 : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                           )}
                         >
                           <item.icon
                             size={16}
                             className={cn(
                               "transition-all duration-200 shrink-0",
                               isActive
                                 ? "text-brand-light drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                                 : item.highlight
                                   ? "text-cyan"
                                   : "text-slate-500 group-hover:text-white"
                             )}
                           />
                           <span className="flex-1 text-[13px] font-semibold tracking-wide">
                             {item.name}
                           </span>
                           {item.highlight && (
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
               </div>

               {/* Settings & Logout Controls */}
               <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-2 text-left">
                 <Link
                   to="/settings"
                   onClick={() => setMenuOpen(false)}
                   className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
                 >
                   <Settings size={16} className="text-slate-500" />
                   <span className="text-[13px] font-semibold tracking-wide">Settings Console</span>
                 </Link>
                 <button
                   onClick={() => {
                     setMenuOpen(false);
                     clearSession?.();
                   }}
                   className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-left w-full"
                 >
                   <LogOut size={16} className="text-slate-500" />
                   <span className="text-[13px] font-semibold tracking-wide">Log Out</span>
                 </button>
               </div>
             </div>
           )}
        </div>
      )}
    </header>
  );
}
