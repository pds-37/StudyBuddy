import { ArrowDownUp, LayoutList } from "lucide-react";
import type { FilterType } from "../../types/notes.types";
import { useNotesStore } from "../../store/notesStore";

const filters: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Strong", value: "strong" },
  { label: "Weak", value: "weak" },
  { label: "Due today", value: "due-today" },
  { label: "Linked", value: "linked" }
];

export function FilterRow() {
  const activeFilter = useNotesStore((state) => state.activeFilter);
  const setActiveFilter = useNotesStore((state) => state.setActiveFilter);

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11.5px] text-zinc-500">Filter:</span>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-lg border px-3 py-1.5 text-[12px] active:scale-[0.98] transition-transform duration-75 ${
                isActive
                  ? "border-purple-700 bg-purple-900/40 text-purple-300"
                  : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className="rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-2 py-1.5 text-[12px] flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-75" aria-label="Sort concepts">
          <ArrowDownUp size={14} />
        </button>
        <button type="button" className="rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-2 py-1.5 text-[12px] flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-75" aria-label="Toggle view">
          <LayoutList size={14} />
        </button>
      </div>
    </div>
  );
}
