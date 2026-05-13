import { useEffect } from "react";
import { RefreshCw, ExternalLink, Clock, MapPin, Building, Search, Building2, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils/cn";
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
    if (!score) return "text-slate-500 dark:text-slate-500 dark:text-slate-400";
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
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-brand/20 blur-3xl rounded-full" />
          <RefreshCw className="relative h-12 w-12 animate-spin text-brand" />
        </div>
        <p className="mt-6 text-slate-500 dark:text-slate-500 dark:text-slate-400 font-medium">Scanning live market opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] glass border-red-500/20 bg-red-500/5 p-10 animate-slide-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-white mb-3">Market Sync Interrupted</h3>
            <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">{error}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearError}
              className="px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-900 dark:text-white font-bold hover:bg-slate-100 dark:bg-slate-100 dark:bg-white/10 transition-all"
            >
              Dismiss
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-slate-900 dark:text-slate-900 dark:text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(124,92,255,0.4)]"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Sync
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="py-24 text-center glass rounded-[3rem] border-white/5 bg-white/[0.01] animate-slide-up">
        <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-600 mx-auto mb-8">
          <Building size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-white mb-3">No live matches found</h3>
        <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed">
          We couldn't find active openings matching your current profile. Try adjusting your target role or location.
        </p>
        <button
          onClick={handleRefresh}
          className="mx-auto flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-obsidian font-black hover:bg-slate-200 transition-all hover:scale-105"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh Feed
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-2xl glass border-white/5 bg-white/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 blur-2xl -z-10 group-hover:bg-brand/10 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Live Roles</p>
          <p className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white">{jobs.length}</p>
        </div>
        <div className="p-6 rounded-2xl glass border-white/5 bg-white/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan/5 blur-2xl -z-10 group-hover:bg-cyan/10 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">New Today</p>
          <p className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white">{freshJobs}</p>
        </div>
        <div className="p-6 rounded-2xl glass border-white/5 bg-white/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl -z-10 group-hover:bg-emerald-500/10 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Verified Sources</p>
          <p className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white">{Object.keys(sourceCounts).length}</p>
        </div>
        <div className="p-6 rounded-2xl glass border-white/5 bg-white/[0.02] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl -z-10 group-hover:bg-purple-500/10 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Remote Ready</p>
          <p className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white">{remoteJobs}</p>
        </div>
      </div>

      <div className="space-y-6">
        {jobs.map((job) => {
          const salary = formatSalary(job);

          return (
            <div key={job.id} className="group p-8 rounded-[2.5rem] glass border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all hover:border-slate-200 dark:border-slate-200 dark:border-white/10 hover:translate-y-[-2px]">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                         <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-white group-hover:text-brand transition-colors">{job.title}</h3>
                         {job.isRemote && (
                           <span className="px-2 py-0.5 rounded-md bg-cyan/10 border border-cyan/20 text-[10px] font-bold text-cyan uppercase tracking-wider">Remote</span>
                         )}
                      </div>
                      <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Building size={16} className="text-slate-600" />
                          <span className="font-semibold text-slate-700 dark:text-slate-700 dark:text-slate-300">{job.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-slate-600" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Clock size={16} className="text-slate-600" />
                           <span>{formatPostedAt(job.postedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {job.matchScore && (
                      <div className="flex flex-col items-end">
                        <div className={cn(
                          "text-3xl font-black tracking-tight",
                          getMatchScoreColor(job.matchScore)
                        )}>
                          {job.matchScore}%
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Match Rank</div>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-4xl line-clamp-2 group-hover:line-clamp-none transition-all">
                    {job.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border border-white/5 text-xs font-medium text-slate-700 dark:text-slate-700 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 5 && (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-50 dark:bg-white/5 text-xs font-medium text-slate-500">
                          +{job.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                       {salary && (
                         <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                            {salary}
                         </div>
                       )}
                       {job.applyUrl && (
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-black text-sm hover:bg-brand/90 transition-all shadow-[0_10px_20px_rgba(124,92,255,0.2)]"
                        >
                          Apply Now
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
