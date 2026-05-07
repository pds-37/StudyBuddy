import { useEffect } from "react";
import { FolderGit2, Check, ExternalLink, Clock, Target, Sparkles } from "lucide-react";
import { useProjectsStore } from "../../../store/projects-store";
import { useAppStore } from "../../../store/app-store";
import { logBehavior } from "../../../lib/api/behavior";
import { Link } from "react-router-dom";

export function CapstoneProjects() {
  const { matches, loading, error, fetchMatches, updateStatus } = useProjectsStore();
  const user = useAppStore(state => state.user);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (!user?.targetRoles || user.targetRoles.length === 0) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6">
        <h3 className="text-lg font-medium text-amber-200">Target Role Required</h3>
        <p className="mt-1 text-sm text-amber-200/70">Set your target role in your profile to get project recommendations.</p>
        <Link to="/onboarding" className="mt-4 inline-block bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-4 py-2 rounded-lg text-sm font-medium">
          Go to Onboarding
        </Link>
      </div>
    );
  }

  if (loading && matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
        <FolderGit2 className="w-8 h-8 animate-pulse text-cyan" />
        <p>Analyzing industry trends for project recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {matches.map(match => (
          <div key={match.id} className={`rounded-2xl border p-6 transition-all ${match.status === 'completed' ? 'bg-white/[0.01] border-white/5 opacity-70' : 'bg-white/[0.03] border-white/10 hover:border-cyan/30'}`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-cyan uppercase tracking-wider">{match.project.company}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span className="text-xs text-slate-400">{match.project.industry}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{match.project.title}</h3>
                </div>

                <p className="text-slate-300 leading-relaxed">{match.project.description}</p>

                <div className="flex flex-wrap gap-2">
                  {match.project.requiredSkills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 text-xs border border-white/5">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                    <Target className="w-4 h-4 text-cyan" />
                    Why this project? ({match.matchScore}% Match)
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-400">
                    {match.matchReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {match.project.implementationPlan && match.project.implementationPlan.length > 0 && (
                  <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/[0.04] space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                      <Sparkles className="w-4 h-4 text-brand" />
                      Implementation Plan
                    </div>
                    <div className="space-y-4">
                      {match.project.implementationPlan.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center shrink-0">
                            <div className="w-6 h-6 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-[10px] font-black text-brand shadow-[0_0_15px_rgba(202,138,247,0.1)]">
                              {i + 1}
                            </div>
                            {i !== (match.project.implementationPlan?.length || 0) - 1 && (
                              <div className="w-[1px] flex-1 bg-white/5 my-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>


              <div className="md:w-64 shrink-0 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-lg p-3 text-center border border-white/5">
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Difficulty</div>
                    <div className="text-white text-sm capitalize">{match.project.difficulty}</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 text-center border border-white/5">
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Time</div>
                    <div className="text-white text-sm flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {match.project.estimatedHours}h
                    </div>
                  </div>
                </div>

                {match.status === "recommended" && (
                  <button
                    onClick={async () => {
                      await updateStatus(match.id, "in_progress");
                      await logBehavior("project_started", { projectId: match.project.id, title: match.project.title });
                    }}
                    className="w-full bg-white text-black py-2.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                  >
                    Start Project
                  </button>
                )}
                {match.status === "in_progress" && (
                  <button
                    onClick={async () => {
                      await updateStatus(match.id, "completed");
                      await logBehavior("project_completed", { projectId: match.project.id, title: match.project.title });
                    }}
                    className="w-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Mark Completed
                  </button>
                )}
                {match.status === "completed" && (
                  <div className="w-full bg-green-500/10 text-green-400 py-2.5 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
