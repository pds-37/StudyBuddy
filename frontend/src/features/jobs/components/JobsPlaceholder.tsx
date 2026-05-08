import { useState } from "react";
import { JobsList } from "./JobsList";

/** Main jobs workspace component. */
export function JobsPlaceholder() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-900 dark:text-white">Live Market Jobs</h2>
          <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400">Current openings aggregated from major job sources and ranked to your profile.</p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="rounded-md border border-slate-200 dark:border-slate-200 dark:border-white/10 px-4 py-2 text-sm text-slate-700 dark:text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-50 dark:bg-white/5"
          type="button"
        >
          Refresh
        </button>
      </div>
      <JobsList refreshTrigger={refreshTrigger} />
    </div>
  );
}
