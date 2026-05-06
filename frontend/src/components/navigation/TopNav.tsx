import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Command, Menu, Search, Sparkles, X, Bell } from "lucide-react";
import { cn } from "../../lib/utils/cn";
import { useAppStore } from "../../store/app-store";
import { NotificationsPopover } from "../NotificationsPopover";

const landingSections = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-to-use" }
] as const;

type TopNavProps = {
  onOpenCommand?: () => void;
};

export function TopNav({ onOpenCommand }: TopNavProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAppStore();
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
        "sticky top-0 z-40 w-full transition-all duration-300 h-20 flex items-center shrink-0",
        isAppShell 
          ? "bg-obsidian backdrop-blur-xl border-b border-white/[0.08]" 
          : isScrolled 
            ? "bg-obsidian/90 backdrop-blur-xl border-b border-white/5 shadow-2xl"
            : "bg-transparent"
      )}
    >
      <div className={cn(
        "mx-auto flex items-center justify-between px-8 w-full",
        isAppShell ? "max-w-full" : "max-w-7xl"
      )}>
        {/* Left Side: Brand or Search */}
        <div className="flex items-center gap-8 flex-1">
          {(!isAppShell || isLandingPage) && (
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/brand/studybuddy-logo.png" alt="StudyBuddy Logo" className="h-10 w-auto object-contain" />
            </Link>
          )}

          {isAppShell && (
            <div className="flex-1 max-w-xl">
              <button
                onClick={onOpenCommand}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.15] hover:bg-white/[0.1] hover:border-white/[0.25] transition-all group text-white shadow-lg"
              >
                <Search size={20} className="text-brand shrink-0" />
                <span className="text-sm font-semibold text-slate-300">Search actions, notes, or roadmaps...</span>
                <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/20 bg-white/10 text-[10px] font-black text-white">
                  <Command size={10} />
                  <span>K</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Center: Navigation (Landing Only) */}
        {isLandingPage && (
          <nav className="hidden lg:flex items-center gap-10">
            {landingSections.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-bold text-slate-400 hover:text-white transition-all hover:translate-y-[-1px]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Side: Actions/Profile */}
        <div className="flex items-center gap-6 flex-1 justify-end">
          {isAppShell ? (
            <div className="flex items-center gap-5">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={14} />
                <span>Pro Member</span>
              </div>
              
              <NotificationsPopover />

              <div className="flex items-center gap-4 pl-4 border-l border-white/5 group cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-white group-hover:text-brand transition-colors">{user?.name || "User"}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Free Tier</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand to-cyan p-[1px] transition-transform group-hover:scale-105">
                  <div className="w-full h-full rounded-full bg-obsidian flex items-center justify-center text-white text-xs font-black">
                    {userInitials}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth" className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                Log in
              </Link>
              <Link 
                to="/auth" 
                className="px-6 py-3 rounded-full bg-white text-obsidian text-sm font-black hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-xl lg:hidden text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-obsidian border-b border-white/5 px-6 py-6 space-y-4 animate-slide-up">
           {isLandingPage && landingSections.map((item) => (
             <a
               key={item.label}
               href={item.href}
               className="block text-lg font-medium text-slate-400 hover:text-white"
               onClick={() => setMenuOpen(false)}
             >
               {item.label}
             </a>
           ))}
           {!isAuthenticated && (
             <div className="pt-4 space-y-4">
               <Link to="/auth" className="block w-full py-3 text-center rounded-xl border border-white/10 text-white font-medium">
                 Sign in
               </Link>
               <Link to="/auth" className="block w-full py-3 text-center rounded-xl bg-white text-obsidian font-bold">
                 Get Started
               </Link>
             </div>
           )}
        </div>
      )}
    </header>
  );
}
