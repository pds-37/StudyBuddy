import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Copilot", href: "/copilot" },
  { name: "Notes", href: "/notes" },
  { name: "Roadmap", href: "/roadmap" },
  { name: "Jobs", href: "/jobs" },
  { name: "Skill Gap", href: "/skill-gap" },
  { name: "Onboarding", href: "/onboarding" }
];

/** Renders the dashboard sidebar navigation. */
export function SidebarNav() {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-brand text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}