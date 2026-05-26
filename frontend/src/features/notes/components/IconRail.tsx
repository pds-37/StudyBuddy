import { Link } from "react-router-dom";
import {
  BarChart2,
  Brain,
  Briefcase,
  LayoutList,
  RefreshCw,
  Settings,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import type { PanelId } from "../types/notes.types";
import { useNotesStore } from "../store/notesStore";

type RailItem = {
  id: PanelId;
  label: string;
  icon: LucideIcon;
  hasDot?: boolean;
};

const railItems: RailItem[] = [
  { id: "library", label: "Library", icon: LayoutList },
  { id: "veda", label: "VEDA", icon: Sparkles, hasDot: true },
  { id: "review", label: "Review", icon: RefreshCw, hasDot: true },
  { id: "insights", label: "Insights", icon: BarChart2 },
  { id: "jobs", label: "Job context", icon: Briefcase }
];

export function IconRail() {
  const activePanel = useNotesStore((state) => state.activePanel);
  const setActivePanel = useNotesStore((state) => state.setActivePanel);

  return (
    <aside className="flex h-full w-[52px] shrink-0 flex-col items-center border-r border-zinc-800 bg-background-secondary py-2 bg-zinc-900">
      <Link
        to="/dashboard"
        className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-900/40 text-purple-400"
        aria-label="Go to dashboard"
      >
        <Brain size={18} />
      </Link>

      <div className="flex flex-col items-center gap-1">
        {railItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePanel(item.id)}
              className={`group relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 active:scale-[0.98] ${
                isActive
                  ? "bg-zinc-800 text-purple-400"
                  : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
              }`}
              aria-label={item.label}
              aria-pressed={isActive}
            >
              <Icon size={18} />
              {item.hasDot && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
              )}
              <span className="pointer-events-none absolute left-[52px] z-50 hidden rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11.5px] font-medium text-zinc-300 group-hover:block">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-auto flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors duration-150 hover:bg-zinc-800/50 hover:text-zinc-300 active:scale-[0.98]"
        aria-label="Settings"
      >
        <Settings size={17} />
      </button>
    </aside>
  );
}
