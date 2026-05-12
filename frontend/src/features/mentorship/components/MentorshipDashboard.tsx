import { useEffect } from "react";
import { Users, Check, X, Building2, Briefcase, Sparkles, MessageSquare } from "lucide-react";

import { useMentorshipStore } from "../../../store/mentorship-store";
import { useCopilotStore } from "../../../store/copilot-store";
import { useAppStore } from "../../../store/app-store";
import { Link } from "react-router-dom";


export function MentorshipDashboard() {
  const { matches, loading, error, fetchMatches, updateStatus } = useMentorshipStore();
  const user = useAppStore(state => state.user);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (!user?.targetRoles || user.targetRoles.length === 0) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6">
        <h3 className="text-lg font-medium text-amber-200">Target Role Required</h3>
        <p className="mt-1 text-sm text-amber-200/70">Set your target role in your profile to find relevant mentors.</p>
        <Link to="/onboarding" className="mt-4 inline-block bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-4 py-2 rounded-lg text-sm font-medium">
          Go to Onboarding
        </Link>
      </div>
    );
  }

  if (loading && matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-500 dark:text-slate-400 space-y-4">
        <Sparkles className="w-8 h-8 animate-pulse text-brand" />
        <p>AI is matching you with industry mentors...</p>
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

      <div className="grid gap-6 sm:grid-cols-2">
        {matches.map((match, idx) => (
          <div key={match.id} className="group relative rounded-3xl border border-white/[0.08] bg-[#0c1017] p-8 transition-all hover:border-brand/40 hover:shadow-[0_20px_80px_-20px_rgba(124,92,255,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="absolute top-0 right-0 bg-brand text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-[0_0_20px_rgba(124,92,255,0.3)]">
              {match.matchScore}% Synergy
            </div>
            
            <div className="flex items-start gap-6 mb-6">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand to-cyan p-[2px]">
                  <div className="w-full h-full rounded-2xl bg-[#0c1017] flex items-center justify-center text-2xl font-black text-white">
                    {match.mentor.name.charAt(0)}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-[#0c1017] rounded-full" />
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-bold text-white tracking-tight truncate">{match.mentor.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                  <Briefcase className="w-4 h-4 text-brand" />
                  {match.mentor.role}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <Building2 className="w-4 h-4" />
                  {match.mentor.company}
                </div>
              </div>
            </div>

            <div className="relative mb-6">
               <p className="text-sm text-slate-400 leading-relaxed italic">
                 "{match.mentor.bio}"
               </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Contextual Alignment</div>
              <ul className="space-y-2">
                {match.matchReasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-cyan mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-300 font-medium">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {match.status === "pending" ? (
              <div className="flex gap-4">
                <button
                  onClick={() => updateStatus(match.id, "accepted")}
                  className="flex-2 flex-1 flex items-center justify-center gap-2 bg-white text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition shadow-[0_15px_30px_rgba(255,255,255,0.1)]"
                >
                  Request Connection
                </button>
                <button
                  onClick={() => updateStatus(match.id, "declined")}
                  className="px-4 flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-slate-500 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : match.status === "accepted" ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl text-center flex items-center justify-center gap-3">
                  <Check className="w-4 h-4" />
                  Mentorship Active
                </div>
                <Link
                  to="/copilot"
                  onClick={() => {
                    const { sendMessage } = useCopilotStore.getState();
                    void sendMessage(`I'm now being mentored by ${match.mentor.name}, who is a ${match.mentor.role} at ${match.mentor.company}. Can you help me prepare a first message?`);
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-brand text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition shadow-lg shadow-brand/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  Initiate Discussion
                </Link>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/[0.06] text-slate-600 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl text-center">
                Archived
              </div>
            )}
          </div>
        ))}

            ) : (
              <div className="bg-slate-800/50 text-slate-500 text-sm font-medium py-2 rounded-lg text-center">
                Declined
              </div>
            )}
          </div>
        ))}
        {matches.length === 0 && !loading && (
          <div className="col-span-2 text-center py-12 text-slate-500 dark:text-slate-500 dark:text-slate-400">
            No mentors found. Try updating your target role or skills.
          </div>
        )}
      </div>
    </div>
  );
}
