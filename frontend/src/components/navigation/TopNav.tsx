import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Command, Menu, Search, Sparkles, X } from "lucide-react";
import { cn } from "../../lib/utils/cn";
import { useAppStore } from "../../store/app-store";
import { NotificationsPopover } from "../NotificationsPopover";

const landingSections = [
  { label: "Overview", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Start", href: "#start" }
] as const;

type TopNavProps = {
  onOpenCommand?: () => void;
};

/** Resolves an in-page landing link from any current route. */
function getLandingHref(pathname: string, hash: string) {
  return pathname === "/" ? hash : `/${hash}`;
}

/** Renders the public navigation and mobile menu for marketing pages. */
export function TopNav({ onOpenCommand }: TopNavProps) {
  const location = useLocation();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const isLandingPage = location.pathname === "/";
  const showPrimaryAction = !isAuthenticated && location.pathname !== "/auth";
  const isAppShell = isAuthenticated && !isLandingPage && location.pathname !== "/auth";

  const primaryAction = isAuthenticated
    ? { label: "Open app", to: "/dashboard" }
    : { label: "Start free", to: "/auth" };

  const secondaryAction = isAuthenticated
    ? { label: "Dashboard", to: "/dashboard" }
    : location.pathname === "/auth"
      ? { label: "Back home", to: "/" }
      : { label: "Sign in", to: "/auth" };

  const userInitials = useMemo(() => {
    const source = user?.name?.trim() || user?.email?.trim() || "StudyBuddy";
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [user?.email, user?.name]);

  return (
    <header
      className={cn(
        "sticky z-40 backdrop-blur-xl",
        isLandingPage ? "top-4 px-5" : "top-0 border-b border-white/6",
        isAppShell ? "bg-ink/82" : isLandingPage ? "bg-transparent" : "bg-ink/75"
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-4 px-5 py-3.5",
          isAppShell ? "max-w-[1320px]" : "max-w-7xl",
          isLandingPage &&
            "rounded-full border border-white/15 bg-white/[0.06] shadow-[0_20px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
        )}
      >
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center gap-3 font-semibold text-white">
            <span
              className={cn(
                "grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white p-0.5",
                isLandingPage
                  ? "shadow-[0_0_24px_rgba(56,189,248,0.2)]"
                  : "shadow-[0_16px_44px_rgba(34,211,238,0.12)]"
              )}
            >
              <img src="/brand/studybuddy-favicon-512.png" alt="" className="h-full w-full rounded-xl object-contain" />
            </span>
            <span className="font-display text-lg tracking-tight">StudyBuddy</span>
          </Link>

          {isLandingPage ? (
            <nav className="hidden items-center gap-6 md:flex">
              {landingSections.map((item) => (
                <a
                  key={item.label}
                  href={getLandingHref(location.pathname, item.href)}
                  className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 transition hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : isAppShell ? (
            <div className="hidden items-center gap-3 lg:flex">
              <button
                type="button"
                onClick={onOpenCommand}
                className="group inline-flex min-w-[300px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-left text-sm text-slate-400 transition hover:border-white/20 hover:bg-white/[0.055] hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-slate-500 transition group-hover:text-cyan" />
                  <span>Search or jump to...</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  <Command className="h-3 w-3" />
                  K
                </span>
              </button>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan/15 bg-cyan/8 px-3 py-2 text-xs text-cyan">
                <Sparkles className="h-3.5 w-3.5" />
                {user?.targetRole || "Workspace"}
              </div>
            </div>
          ) : null}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAppShell ? (
            <>
              <Link
                to="/onboarding"
                className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Edit profile
              </Link>
              <button
                type="button"
                onClick={onOpenCommand}
                className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Actions
              </button>
              <NotificationsPopover />
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] py-1.5 pl-2 pr-3">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand via-violet-500 to-cyan text-xs font-semibold text-white">
                  {userInitials}
                </span>
                <div className="hidden text-left xl:block">
                  <p className="text-sm font-semibold text-white">{user?.name || "StudyBuddy User"}</p>
                  <p className="max-w-36 truncate text-xs text-slate-500">{user?.email || "Authenticated session"}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to={secondaryAction.to}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-200 transition hover:border-white/25 hover:text-white"
              >
                {secondaryAction.label}
              </Link>
              {showPrimaryAction ? (
                <Link
                  to={primaryAction.to}
                  className={cn(
                    "rounded-full px-5 py-2.5 text-sm font-semibold transition hover:scale-[1.01]",
                    isLandingPage
                      ? "bg-white text-slate-950 shadow-[0_12px_40px_rgba(56,189,248,0.12)] hover:bg-sky-100"
                      : "bg-gradient-to-r from-brand via-violet-500 to-blue-500 text-white"
                  )}
                >
                  {primaryAction.label}
                </Link>
              ) : null}
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 text-slate-200 transition hover:border-white/25 hover:text-white md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-white/6 transition-[max-height,opacity] duration-300 md:hidden",
          isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4">
          {isLandingPage
            ? landingSections.map((item) => (
                <a
                  key={item.label}
                  href={getLandingHref(location.pathname, item.href)}
                  className="rounded-2xl border border-white/6 px-4 py-3 text-sm text-slate-200 transition hover:border-white/15 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))
            : isAppShell ? (
                <button
                  type="button"
                  className="rounded-2xl border border-white/6 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-white/15 hover:text-white"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenCommand?.();
                  }}
                >
                  Open quick actions
                </button>
              ) : null}

          <div className="grid grid-cols-1 gap-3 pt-2">
            {isAppShell ? (
              <Link
                to="/onboarding"
                className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm text-slate-200 transition hover:border-white/25 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Edit profile
              </Link>
            ) : (
              <>
                <Link
                  to={secondaryAction.to}
                  className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm text-slate-200 transition hover:border-white/25 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {secondaryAction.label}
                </Link>
                {showPrimaryAction ? (
                  <Link
                    to={primaryAction.to}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-center text-sm font-semibold transition hover:scale-[1.01]",
                      isLandingPage
                        ? "bg-white text-slate-950 shadow-[0_12px_40px_rgba(56,189,248,0.12)] hover:bg-sky-100"
                        : "bg-gradient-to-r from-brand via-violet-500 to-blue-500 text-white"
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    {primaryAction.label}
                  </Link>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
