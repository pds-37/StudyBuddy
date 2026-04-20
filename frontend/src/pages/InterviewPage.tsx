import { InterviewWorkspace } from "../features/interview/components/InterviewWorkspace";

export function InterviewPage() {
  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan">Practice</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Mock Interview</h1>
        <p className="mt-2 text-slate-400">Hone your behavioral and technical interview skills with AI-driven mock interviews.</p>
      </div>
      <InterviewWorkspace />
    </section>
  );
}
