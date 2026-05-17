import { AlertCircle, BookOpen, Briefcase, Clock, Folder, Link2, Plus, Target } from "lucide-react";
import type { FilterType, JobLink } from "../../types/notes.types";
import { useNotesStore } from "../../store/notesStore";

type SmartFilter = {
  label: string;
  filter: FilterType;
  icon: typeof BookOpen;
  badgeClass: string;
  count: number | string;
};

function JobRow({ job }: { job: JobLink }) {
  return (
    <button type="button" className="rounded-lg px-2 py-1.5 flex items-center gap-2 text-[12.5px] hover:bg-zinc-800 cursor-pointer text-zinc-300 w-full">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: job.color }} />
      <span className="min-w-0 flex-1 truncate">{job.jobTitle}</span>
      <span className="text-[10.5px] px-1.5 py-0.5 rounded-full ml-auto bg-zinc-800 text-zinc-400">{job.conceptCount}</span>
    </button>
  );
}

export function LibraryPanel() {
  const concepts = useNotesStore((state) => state.concepts);
  const stats = useNotesStore((state) => state.stats);
  const jobLinks = useNotesStore((state) => state.jobLinks);
  const activeFilter = useNotesStore((state) => state.activeFilter);
  const setActiveFilter = useNotesStore((state) => state.setActiveFilter);
  const weakCount = concepts.filter((concept) => concept.health !== "strong").length;

  const filters: SmartFilter[] = [
    { label: "All Knowledge", filter: "all", icon: BookOpen, badgeClass: "bg-zinc-800 text-zinc-400", count: stats.totalConcepts },
    { label: "Weak Concepts", filter: "weak", icon: AlertCircle, badgeClass: "bg-red-900/40 text-red-400", count: weakCount },
    { label: "Due Today", filter: "due-today", icon: Clock, badgeClass: "bg-amber-900/40 text-amber-400", count: stats.dueToday },
    { label: "Interview Prep", filter: "linked", icon: Target, badgeClass: "bg-blue-900/40 text-blue-400", count: "job" }
  ];

  return (
    <div className="flex min-h-full flex-col gap-5 text-[13px] text-zinc-300">
      <section className="space-y-2">
        <h4 className="text-[10.5px] font-medium text-zinc-600 uppercase tracking-widest">Smart filters</h4>
        <div className="space-y-1">
          {filters.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.filter;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveFilter(item.filter)}
                className={`rounded-lg px-2 py-1.5 flex items-center gap-2 text-[12.5px] hover:bg-zinc-800 cursor-pointer w-full ${
                  isActive ? "bg-zinc-800 text-zinc-100 font-medium" : "text-zinc-400"
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                <span className={`text-[10.5px] px-1.5 py-0.5 rounded-full ml-auto ${item.badgeClass}`}>{item.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-[10.5px] font-medium text-zinc-600 uppercase tracking-widest">Collections</h4>
        <div className="space-y-1">
          {["DSA Foundations", "System Design", "Frontend Concepts"].map((collection) => (
            <button key={collection} type="button" className="rounded-lg px-2 py-1.5 flex items-center gap-2 text-[12.5px] hover:bg-zinc-800 cursor-pointer text-zinc-400 w-full">
              <Folder size={14} />
              <span className="truncate">{collection}</span>
            </button>
          ))}
          <button type="button" className="rounded-lg px-2 py-1.5 flex items-center gap-2 text-[12.5px] hover:bg-zinc-800 cursor-pointer text-purple-400 w-full">
            <Plus size={14} />
            <span>New Collection</span>
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-[10.5px] font-medium text-zinc-600 uppercase tracking-widest">Linked to jobs</h4>
        <div className="space-y-1">
          {jobLinks.map((job) => (
            <JobRow key={job.jobId} job={job} />
          ))}
          <button type="button" className="rounded-lg px-2 py-1.5 flex items-center gap-2 text-[12.5px] hover:bg-zinc-800 cursor-pointer text-purple-400 w-full">
            <Link2 size={14} />
            <span>Link to job</span>
          </button>
        </div>
      </section>

      <footer className="mt-auto space-y-2 border-t border-zinc-800 pt-3">
        <div className="flex items-center justify-between text-[11.5px] text-zinc-500">
          <span>Total concepts</span>
          <span className="font-mono text-zinc-300">{stats.totalConcepts}</span>
        </div>
        <div className="flex items-center justify-between text-[11.5px] text-zinc-500">
          <span>Due today</span>
          <span className="font-mono text-amber-400">{stats.dueToday}</span>
        </div>
      </footer>
    </div>
  );
}
