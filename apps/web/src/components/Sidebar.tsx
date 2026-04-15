import { BookOpen, Bot, CalendarClock, GraduationCap, LayoutDashboard, LogOut, Map, NotebookPen, Plus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api";
import { useUiStore } from "@/lib/ui-store";
import type { PublicUser } from "@shared";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/buddy", label: "Ask Buddy", icon: Bot },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/reminders", label: "Revision", icon: CalendarClock },
  { to: "/roadmap", label: "Roadmap", icon: Map }
];

export default function Sidebar({ user }: { user: PublicUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openComposer } = useUiStore();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/auth/logout", { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate("/auth", { replace: true });
    }
  });

  return (
    <header className="app-navbar">
      <div className="app-navbar__brand">
        <div className="app-navbar__brand-mark">
          <GraduationCap size={18} />
        </div>
        <div>
          <p className="eyebrow">Study Buddy</p>
          <strong>Study OS</strong>
        </div>
      </div>

      <nav className="app-navbar__links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `app-navbar__link ${isActive ? "is-active" : ""}`}>
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="app-navbar__actions">
        <button className="surface-link-button app-navbar__compose" onClick={() => openComposer()}>
          <Plus size={16} />
          <span>New note</span>
        </button>

        <div className="app-navbar__user">
          <div className="app-navbar__avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          <div className="app-navbar__user-copy">
            <strong>{user.name}</strong>
            <span>{user.streak}d streak</span>
          </div>
        </div>

        <button className="ghost-icon-button" onClick={() => logoutMutation.mutate()} aria-label="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
