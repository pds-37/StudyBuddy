import { Link } from "react-router-dom";
import { Briefcase, ExternalLink, TrendingUp } from "lucide-react";
import { Card } from "../ui/Card";
import { useJobsStore } from "../../store/jobs-store";

/** Dashboard widget showing a compact snapshot of live job activity. */
export function JobsWidget() {
  const { jobs, loading } = useJobsStore();

  const highMatchJobs = jobs.filter((job) => job.matchScore && job.matchScore >= 80);
  const totalMatches = jobs.filter((job) => job.matchScore && job.matchScore > 0).length;
  const liveSources = new Set(
    jobs.flatMap((job) => (job.sources?.length ? job.sources : job.source ? [job.source] : []))
  ).size;
  const topJob = [...jobs]
    .filter((job) => typeof job.matchScore === "number")
    .sort((left, right) => (right.matchScore ?? 0) - (left.matchScore ?? 0))[0];

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-500/15 p-3 text-sky-300">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Job opportunities</h3>
            <p className="text-sm text-slate-400">Live market roles matched to your profile</p>
          </div>
        </div>
        <Link
          to="/jobs"
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          Open
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 animate-pulse">
          <div className="h-24 rounded-[1.5rem] bg-white/5" />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Opportunities</p>
                <p className="mt-3 font-display text-4xl tracking-tight text-white">{jobs.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">{totalMatches} with a match score</p>
                <p className="mt-1 text-xs text-slate-500">{liveSources} live sources tracked</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
                <TrendingUp className="h-4 w-4" />
                {highMatchJobs.length} excellent matches
              </div>
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Top current match</p>
            {topJob ? (
              <>
                <p className="mt-3 text-base font-semibold text-white">
                  {topJob.title} at {topJob.company}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {topJob.location} · {topJob.matchScore}% match{topJob.source ? ` · ${topJob.source}` : ""}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Load the jobs page to see the strongest live role matches for your current direction.
              </p>
            )}
          </div>

          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan transition hover:text-white"
          >
            Review all matches
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </Card>
  );
}
