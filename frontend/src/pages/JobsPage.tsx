import { JobsWorkspace } from "../features/jobs";

/** Shows the jobs page. */
export function JobsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan">Jobs</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Job Opportunities</h1>
        <p className="mt-2 text-slate-400">Track live market demand and openings from major job sources in one place.</p>
      </div>
      <JobsWorkspace />
    </section>
  );
}
