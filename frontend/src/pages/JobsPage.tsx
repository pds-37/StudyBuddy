import { JobsWorkspace } from "../features/jobs";

/** Shows the jobs page. */
export function JobsPage() {
  return (
    <section className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="py-6 border-b border-white/[0.04]">
        <h1 className="text-3xl tracking-tight font-medium text-white">Jobs</h1>
        <p className="mt-2 text-sm text-[#888888]">Live market demand matched to your skills.</p>
      </div>
      <JobsWorkspace />
    </section>
  );
}
