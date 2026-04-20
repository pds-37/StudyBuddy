import { useEffect } from "react";
import { RefreshCw, ExternalLink, MapPin, Building } from "lucide-react";
import { useJobsStore } from "../../../store/jobs-store";
import type { JobListing } from "@studybuddy/shared";

type JobsListProps = {
  refreshTrigger?: number;
};

/** Displays a live list of job listings with match scores and source signals. */
export function JobsList({ refreshTrigger }: JobsListProps) {
  const { jobs, loading, error, fetchJobs, clearError } = useJobsStore();

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs, refreshTrigger]);

  const getMatchScoreColor = (score?: number) => {
    if (!score) return "text-slate-400";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getMatchScoreLabel = (score?: number) => {
    if (!score) return "No match";
    if (score >= 80) return "Excellent match";
    if (score >= 60) return "Good match";
    if (score >= 40) return "Fair match";
    return "Needs work";
  };

  const handleRefresh = () => {
    void fetchJobs(true);
  };

  const handleClearError = () => {
    clearError();
  };

  const sourceCounts = jobs.reduce<Record<string, number>>((accumulator, job) => {
    const labels = job.sources?.length ? job.sources : job.source ? [job.source] : [];

    for (const label of labels) {
      accumulator[label] = (accumulator[label] ?? 0) + 1;
    }

    return accumulator;
  }, {});

  const topSources = Object.entries(sourceCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  const freshJobs = jobs.filter((job) => {
    if (!job.postedAt) {
      return false;
    }

    const postedAt = new Date(job.postedAt).getTime();
    return Number.isFinite(postedAt) && Date.now() - postedAt <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const remoteJobs = jobs.filter((job) => job.isRemote).length;

  const formatPostedAt = (dateString?: string) => {
    if (!dateString) {
      return "Date unavailable";
    }

    const postedAt = new Date(dateString);
    const timestamp = postedAt.getTime();

    if (!Number.isFinite(timestamp)) {
      return "Date unavailable";
    }

    const diffMs = Date.now() - timestamp;
    if (diffMs < 0) {
      return postedAt.toLocaleDateString();
    }

    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays === 0) {
      return "Posted today";
    }
    if (diffDays === 1) {
      return "Posted 1 day ago";
    }
    if (diffDays < 30) {
      return `Posted ${diffDays} days ago`;
    }

    return postedAt.toLocaleDateString();
  };

  const formatSalary = (job: JobListing) => {
    if (typeof job.salaryMin !== "number" && typeof job.salaryMax !== "number") {
      return null;
    }

    const formatter = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0
    });
    const currency = job.salaryCurrency ?? "";

    if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
      return `${currency} ${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`;
    }

    const value = job.salaryMax ?? job.salaryMin;
    return value ? `${currency} ${formatter.format(value)}` : null;
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-brand" />
          <p className="text-slate-400">Loading live job opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-2 text-lg font-medium text-red-400">Failed to load jobs</h3>
            <p className="text-red-300">{error}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearError}
              className="rounded-md bg-slate-700 px-4 py-2 text-sm text-white transition hover:bg-slate-600"
            >
              Dismiss
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm text-white transition hover:bg-brand/90"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="py-12 text-center">
        <Building className="mx-auto mb-4 h-12 w-12 text-slate-500" />
        <h3 className="mb-2 text-lg font-medium text-white">No live jobs available</h3>
        <p className="mb-4 text-slate-400">Connect a live provider or refresh again in a moment.</p>
        <button
          onClick={handleRefresh}
          className="mx-auto flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-white transition hover:bg-brand/90"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Job Opportunities</h2>
          <p className="text-sm text-slate-400">{jobs.length} live positions available</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-md p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          title="Refresh jobs"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Live roles</p>
          <p className="mt-3 text-3xl font-semibold text-white">{jobs.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Fresh in 7 days</p>
          <p className="mt-3 text-3xl font-semibold text-white">{freshJobs}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Tracked sources</p>
          <p className="mt-3 text-3xl font-semibold text-white">{Object.keys(sourceCounts).length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Remote friendly</p>
          <p className="mt-3 text-3xl font-semibold text-white">{remoteJobs}</p>
        </div>
      </div>

      {topSources.length > 0 ? (
        <div className="rounded-lg border border-cyan/20 bg-cyan/10 p-4">
          <p className="text-sm font-medium text-cyan-100">Current source mix</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topSources.map(([source, count]) => (
              <span
                key={source}
                className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-sm text-cyan-100"
              >
                {source} ({count})
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {jobs.map((job) => {
          const salary = formatSalary(job);
          const sources = job.sources?.length ? job.sources : job.source ? [job.source] : [];

          return (
            <div key={job.id} className="rounded-lg border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-xl font-semibold text-white">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div>{formatPostedAt(job.postedAt)}</div>
                        {job.employmentType ? <div>{job.employmentType}</div> : null}
                        {job.isRemote ? <div className="text-cyan-300">Remote / hybrid</div> : null}
                      </div>
                    </div>

                    {job.matchScore ? (
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getMatchScoreColor(job.matchScore)}`}>
                          {job.matchScore}%
                        </div>
                        <div className={`text-sm ${getMatchScoreColor(job.matchScore)}`}>
                          {getMatchScoreLabel(job.matchScore)}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {sources.map((source) => (
                      <span
                        key={`${job.id}-${source}`}
                        className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200"
                      >
                        {source}
                      </span>
                    ))}
                    {salary ? (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                        {salary}
                      </span>
                    ) : null}
                  </div>

                  {job.description ? (
                    <p className="mb-4 text-sm leading-6 text-slate-300">{job.description}</p>
                  ) : null}

                  {job.requiredSkills.length > 0 ? (
                    <div className="mb-4">
                      <h4 className="mb-2 text-sm font-medium text-slate-300">Detected Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-sm text-blue-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {job.applyUrl ? (
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90"
                      >
                        Apply Now
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
