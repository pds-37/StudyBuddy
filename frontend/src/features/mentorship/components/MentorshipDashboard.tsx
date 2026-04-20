import { useEffect } from "react";
import { Users, Check, X, Building2, Briefcase, Sparkles } from "lucide-react";
import { useMentorshipStore } from "../../../store/mentorship-store";
import { useAppStore } from "../../../store/app-store";
import { Link } from "react-router-dom";

export function MentorshipDashboard() {
  const { matches, loading, error, fetchMatches, updateStatus } = useMentorshipStore();
  const user = useAppStore(state => state.user);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (!user?.targetRole) {
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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
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
        {matches.map(match => (
          <div key={match.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 relative overflow-hidden group hover:border-brand/30 transition-all">
            <div className="absolute top-0 right-0 bg-brand/10 text-brand text-xs font-bold px-3 py-1 rounded-bl-lg">
              {match.matchScore}% Match
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand/20 to-cyan/20 flex items-center justify-center text-xl font-bold text-white shrink-0">
                {match.mentor.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{match.mentor.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                  <Briefcase className="w-4 h-4" />
                  {match.mentor.role}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-0.5">
                  <Building2 className="w-4 h-4" />
                  {match.mentor.company}
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-4 line-clamp-2">
              "{match.mentor.bio}"
            </p>

            <div className="space-y-2 mb-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Why they're a fit</div>
              <ul className="text-sm text-slate-300 space-y-1">
                {match.matchReasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {match.status === "pending" ? (
              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus(match.id, "accepted")}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                >
                  <Check className="w-4 h-4" />
                  Request Mentorship
                </button>
                <button
                  onClick={() => updateStatus(match.id, "declined")}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                  Decline
                </button>
              </div>
            ) : match.status === "accepted" ? (
              <div className="bg-green-500/10 text-green-400 text-sm font-medium py-2 rounded-lg text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Request Sent
              </div>
            ) : (
              <div className="bg-slate-800/50 text-slate-500 text-sm font-medium py-2 rounded-lg text-center">
                Declined
              </div>
            )}
          </div>
        ))}
        {matches.length === 0 && !loading && (
          <div className="col-span-2 text-center py-12 text-slate-400">
            No mentors found. Try updating your target role or skills.
          </div>
        )}
      </div>
    </div>
  );
}
