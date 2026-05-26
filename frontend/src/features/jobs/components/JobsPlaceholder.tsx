import { useState } from "react";
import { JobsList } from "./JobsList";

/** Main jobs workspace component. */
export function JobsPlaceholder() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white text-white text-white">Live Market Jobs</h2>
          <p className="text-slate-500 text-slate-500 text-slate-400">Current openings aggregated from major job sources and ranked to your profile.</p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="rounded-md border border-white/10 border-white/10 border-white/10 px-4 py-2 text-sm text-slate-300 text-slate-300 text-slate-300 hover:bg-transparent bg-transparent bg-white/5"
          type="button"
        >
          Refresh
        </button>
      </div>
      <JobsList refreshTrigger={refreshTrigger} />
    </div>
  );
}
