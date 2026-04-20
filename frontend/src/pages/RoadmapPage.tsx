import { RoadmapWorkspace } from "../features/roadmap";

/** Shows the roadmap page. */
export function RoadmapPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan">Roadmap</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Career Roadmap</h1>
        <p className="mt-2 text-slate-400">Your personalized learning path to achieve your career goals.</p>
      </div>
      <RoadmapWorkspace />
    </section>
  );
}