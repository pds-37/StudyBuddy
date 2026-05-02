import { useEffect } from "react";
import { Mic, BrainCircuit, Play, Clock, AlertTriangle } from "lucide-react";
import { useInterviewStore } from "../../../store/interview-store";
import { useAppStore } from "../../../store/app-store";
import { InterviewSession } from "./InterviewSession";
import { Link } from "react-router-dom";

export function InterviewWorkspace() {
  const { currentSession, loading, error, fetchSessions, startSession, sessions } = useInterviewStore();
  const user = useAppStore(state => state.user);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleStart = async () => {
    await startSession();
  };

  if (!user?.targetRoles || user.targetRoles.length === 0) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
        <div>
          <h3 className="text-lg font-medium text-amber-200">Target Role Required</h3>
          <p className="mt-1 text-sm text-amber-200/70">You need to set a target role in your profile before starting a mock interview.</p>
          <Link to="/onboarding" className="mt-4 inline-block bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-4 py-2 rounded-lg text-sm font-medium transition">
            Go to Onboarding
          </Link>
        </div>
      </div>
    );
  }

  if (currentSession) {
    return <InterviewSession session={currentSession} />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6">
          <Mic className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">AI Interview Simulator</h2>
        <p className="text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
          Practice interviewing for your target role: <strong className="text-white">{user.targetRoles[0]}</strong>. 
          The AI will ask behavioral and technical questions and score your answers using the STAR method.
        </p>
        <button
          onClick={handleStart}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition disabled:opacity-50"
        >
          {loading ? (
            "Preparing session..."
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              Start Mock Interview
            </>
          )}
        </button>
      </div>

      {sessions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Past Sessions</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {sessions.map(s => (
              <div key={s.id} className="rounded-xl border border-white/10 bg-black/20 p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-slate-200">{s.targetRole}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md ${s.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-brand/20 text-brand-300'}`}>
                    {s.status}
                  </span>
                </div>
                {s.status === "completed" && s.overallScore !== undefined && (
                  <div className="mt-auto pt-3 border-t border-white/5 flex items-end justify-between">
                    <span className="text-xs text-slate-400">Overall Score</span>
                    <span className="font-bold text-cyan">{s.overallScore}/10</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
