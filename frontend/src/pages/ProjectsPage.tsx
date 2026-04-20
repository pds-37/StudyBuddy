import { CapstoneProjects } from "../features/projects/components/CapstoneProjects";

export function ProjectsPage() {
  return (
    <section className="space-y-6 max-w-5xl mx-auto">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan">Portfolio</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Capstone Projects</h1>
        <p className="mt-2 text-slate-400">Real-world industry projects recommended by AI to help you build a portfolio for your target role.</p>
      </div>
      <CapstoneProjects />
    </section>
  );
}
