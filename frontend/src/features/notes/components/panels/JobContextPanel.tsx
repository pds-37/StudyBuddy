import { ArrowRight, Plus } from "lucide-react";
import type { JobLink } from "../../types/notes.types";
import { useNotesStore } from "../../store/notesStore";

function JobContextRow({ job }: { job: JobLink }) {
  return (
    <div className="rounded-lg px-2 py-1.5 flex items-center gap-2 text-[12.5px] hover:bg-zinc-800 cursor-pointer text-zinc-300">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: job.color }} />
      <span className="min-w-0 flex-1 truncate">{job.jobTitle}</span>
      <span className="text-[10.5px] px-1.5 py-0.5 rounded-full ml-auto bg-zinc-800 text-zinc-400">{job.conceptCount}</span>
    </div>
  );
}

export function JobContextPanel() {
  const concepts = useNotesStore((state) => state.concepts);
  const jobLinks = useNotesStore((state) => state.jobLinks);
  const unlinkedCount = concepts.filter((concept) => concept.linkedJobId === null).length;

  return (
    <div className="flex min-h-full flex-col gap-5 text-[13px] text-zinc-300">
      <p className="text-[11.5px] leading-5 text-zinc-500">Concepts linked to active applications</p>

      <section className="space-y-2">
        {jobLinks.map((job) => (
          <JobContextRow key={job.jobId} job={job} />
        ))}
        <div className="rounded-lg px-2 py-1.5 flex items-center gap-2 text-[12.5px] hover:bg-zinc-800 cursor-pointer text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="min-w-0 flex-1 truncate">Unlinked concepts</span>
          <span className="text-[10.5px] px-1.5 py-0.5 rounded-full ml-auto bg-amber-900/40 text-amber-400">{unlinkedCount}</span>
        </div>
      </section>

      <button type="button" className="rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-3 py-1.5 text-[12px] flex items-center gap-1.5 active:scale-[0.98] transition-transform duration-75">
        Link unlinked
        <ArrowRight size={13} className="ml-auto" />
      </button>

      <div className="border-t border-zinc-800 pt-3">
        <button type="button" className="rounded-lg px-2 py-1.5 flex items-center gap-2 text-[12.5px] hover:bg-zinc-800 cursor-pointer text-purple-400 w-full">
          <Plus size={14} />
          Add application
        </button>
      </div>
    </div>
  );
}
