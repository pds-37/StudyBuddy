import { useState, useEffect } from "react";
import { getJobs } from "../../lib/api/jobs";
import type { JobListing } from "@personal-notes-ai/shared";

type JobsListProps = {
  refreshTrigger?: number;
};

/** Displays a list of job listings with match scores. */
export function JobsList({ refreshTrigger }: JobsListProps) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobListings = await getJobs(50);
      setJobs(jobListings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [refreshTrigger]);

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
    return "Poor match";
  };

  if (loading) {
    return <div className="text-slate-400">Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  if (jobs.length === 0) {
    return <div className="text-slate-400">No jobs available at the moment.</div>;
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="rounded-lg border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                {job.matchScore && (
                  <div className={`text-sm font-medium ${getMatchScoreColor(job.matchScore)}`}>
                    {job.matchScore}% match
                  </div>
                )}
              </div>

              <p className="text-slate-300 mb-3">{job.company} • {job.location}</p>

              {job.matchScore && (
                <p className={`text-sm mb-3 ${getMatchScoreColor(job.matchScore)}`}>
                  {getMatchScoreLabel(job.matchScore)}
                </p>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Required Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="rounded bg-blue-500/20 px-3 py-1 text-sm text-blue-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {job.applyUrl && (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition"
                >
                  Apply Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}