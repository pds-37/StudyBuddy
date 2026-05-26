import { useEffect } from "react";
import {
  BarChart2,
  Briefcase,
  LayoutDashboard,
  LayoutList,
  Play,
  Plus,
  RefreshCw,
  Sparkles
} from "lucide-react";
import type { FilterType } from "./types/notes.types";
import { useNotesStore } from "./store/notesStore";
import { IconRail } from "./components/IconRail";
import { SlidePanel } from "./components/SlidePanel";
import { LibraryPanel } from "./components/panels/LibraryPanel";
import { VedaPanel } from "./components/panels/VedaPanel";
import { ReviewPanel } from "./components/panels/ReviewPanel";
import { InsightsPanel } from "./components/panels/InsightsPanel";
import { JobContextPanel } from "./components/panels/JobContextPanel";
import { StatsRow } from "./components/main/StatsRow";
import { IngestBar } from "./components/main/IngestBar";
import { FilterRow } from "./components/main/FilterRow";
import { ConceptGrid } from "./components/main/ConceptGrid";

const filterTitles: Record<FilterType, string> = {
  all: "All knowledge",
  strong: "Strong concepts",
  weak: "Weak concepts",
  "due-today": "Due today",
  linked: "Linked concepts"
};

export function NotesPage() {
  const activeFilter = useNotesStore((state) => state.activeFilter);
  const fetchAll = useNotesStore((state) => state.fetchAll);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return (
    <section className="h-screen overflow-hidden bg-zinc-950 text-zinc-100 bg-zinc-950">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5">
        <div>
          <h2 className="text-[15px] font-medium text-zinc-100">{filterTitles[activeFilter]}</h2>
          <p className="text-[11.5px] text-zinc-600">Knowledge graph, recall, and job context</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-3 py-1.5 text-[12px] flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-75">
            <LayoutDashboard size={14} />
            Graph view
          </button>
          <button type="button" className="rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-3 py-1.5 text-[12px] flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-75">
            <Play size={14} />
            Session
          </button>
          <button type="button" className="rounded-lg border border-purple-700 bg-purple-700 px-3 py-1.5 text-[12px] text-white hover:bg-purple-600 flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-75">
            <Plus size={14} />
            Add concept
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)] flex-row overflow-hidden">
        <IconRail />

        <SlidePanel panelId="library" title="Library" icon={LayoutList}>
          <LibraryPanel />
        </SlidePanel>
        <SlidePanel panelId="veda" title="VEDA" icon={Sparkles}>
          <VedaPanel />
        </SlidePanel>
        <SlidePanel panelId="review" title="Review" icon={RefreshCw}>
          <ReviewPanel />
        </SlidePanel>
        <SlidePanel panelId="insights" title="Insights" icon={BarChart2}>
          <InsightsPanel />
        </SlidePanel>
        <SlidePanel panelId="jobs" title="Job context" icon={Briefcase}>
          <JobContextPanel />
        </SlidePanel>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-zinc-950">
          <StatsRow />
          <IngestBar />
          <FilterRow />
          <ConceptGrid />
        </main>
      </div>
    </section>
  );
}
