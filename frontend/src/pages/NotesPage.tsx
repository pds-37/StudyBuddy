import { NotesWorkspace } from "../features/notes";

/** Shows the notes workspace page. */
export function NotesPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan">Notes</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Career Notes</h1>
        <p className="mt-2 text-slate-400">Capture and organize your learning resources and insights.</p>
      </div>
      <NotesWorkspace />
    </section>
  );
}