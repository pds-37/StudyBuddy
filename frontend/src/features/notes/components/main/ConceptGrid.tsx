import { ArrowRight, Plus } from "lucide-react";
import type { Concept, FilterType } from "../../types/notes.types";
import { useNotesStore } from "../../store/notesStore";
import { ConceptCard } from "../ConceptCard";

function isDueToday(concept: Concept) {
  if (!concept.dueDate) return false;
  const due = new Date(concept.dueDate);
  const now = new Date();
  return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth() && due.getDate() === now.getDate();
}

function filterConcept(concept: Concept, filter: FilterType) {
  if (filter === "strong") return concept.health === "strong";
  if (filter === "weak") return concept.health !== "strong";
  if (filter === "due-today") return isDueToday(concept);
  if (filter === "linked") return concept.linkedJobId !== null;
  return true;
}

export function ConceptGrid() {
  const concepts = useNotesStore((state) => state.concepts);
  const stats = useNotesStore((state) => state.stats);
  const activeFilter = useNotesStore((state) => state.activeFilter);
  const dueConcepts = concepts.filter(isDueToday);
  const filteredConcepts = concepts.filter((concept) => filterConcept(concept, activeFilter));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 gap-3 p-5 transition-[grid-template-columns] duration-150 md:grid-cols-2 xl:grid-cols-3">
        {stats.dueToday > 0 && (
          <div className="col-span-full rounded-xl border border-amber-900/50 bg-zinc-900 p-3 text-[13px] text-zinc-300">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p>
                <span className="text-amber-400">{stats.dueToday} concepts due for revision</span>
                {" — "}
                {dueConcepts.map((concept) => concept.title).join(", ")}. ~{stats.dueToday * 3} min.
              </p>
              <button type="button" className="rounded-lg border border-purple-700 bg-purple-700 px-3 py-1.5 text-[12px] text-white hover:bg-purple-600 flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-75">
                Start
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {filteredConcepts.map((concept) => (
          <ConceptCard key={concept.id} concept={concept} />
        ))}

        <button type="button" className="flex min-h-[164px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-900 p-3 text-zinc-500 transition-colors duration-150 hover:border-zinc-600 hover:text-zinc-300 dark:bg-zinc-900">
          <Plus size={18} />
          <span className="text-[12px] font-medium">Add concept</span>
        </button>
      </div>
    </div>
  );
}
