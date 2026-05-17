import { X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { PanelId } from "../types/notes.types";
import { useNotesStore } from "../store/notesStore";

type SlidePanelProps = {
  panelId: PanelId;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
};

export function SlidePanel({ panelId, title, icon: Icon, children }: SlidePanelProps) {
  const isOpen = useNotesStore((state) => state.activePanel === panelId);
  const setActivePanel = useNotesStore((state) => state.setActivePanel);

  return (
    <aside
      className={`h-full shrink-0 overflow-hidden bg-zinc-950 transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isOpen ? "w-[230px] border-r border-zinc-800" : "w-0"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex h-full w-[230px] flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-3">
          <div className="flex min-w-0 items-center gap-2 text-zinc-100">
            <Icon size={16} className="shrink-0 text-purple-400" />
            <h3 className="truncate text-[13px] font-medium">{title}</h3>
          </div>
          <button
            type="button"
            onClick={() => setActivePanel(null)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition-colors duration-150 hover:bg-zinc-800 hover:text-zinc-100 active:scale-[0.98]"
            aria-label={`Close ${title}`}
          >
            <X size={14} />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">{children}</div>
      </div>
    </aside>
  );
}
