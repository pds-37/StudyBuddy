import { useEffect } from "react";
import { Mic, BrainCircuit, Play, Clock, AlertTriangle, AlertCircle } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="relative group overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0c1017] p-12 text-center transition-all hover:border-brand/30">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-cyan/5 opacity-50" />
        
        <div className="relative z-10">
          <div className="mx-auto w-20 h-20 rounded-[1.5rem] bg-brand/10 text-brand flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(124,92,255,0.15)] group-hover:scale-110 transition-transform duration-500">
            <Mic className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">AI Interview Simulator</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed text-lg">
            Master your next role as a <span className="text-brand font-semibold underline decoration-brand/30 underline-offset-4">{user.targetRoles[0]}</span>. 
            Receive real-time feedback using the STAR method.
          </p>
          
          <button
            onClick={handleStart}
            disabled={loading}
            className="group/btn relative inline-flex items-center gap-3 bg-transparent text-slate-950 px-10 py-4 rounded-2xl font-bold hover:bg-transparent transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
          >
            {loading ? (
              <>
                <BrainCircuit className="w-5 h-5 animate-pulse" />
                Veda is preparing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Launch Session
              </>
            )}
          </button>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-500" />
              Interview History
            </h3>
            <span className="text-xs text-slate-500 font-mono">{sessions.length} sessions</span>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {sessions.map(s => (
              <div 
                key={s.id} 
                className="group/card relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] hover:border-white/[0.12]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-lg text-white group-hover/card:text-brand transition-colors">{s.targetRole}</div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    s.status === 'completed' 
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                      : 'border-brand/20 bg-brand/10 text-brand'
                  }`}>
                    {s.status}
                  </span>
                </div>
                
                {s.status === "completed" && s.overallScore !== undefined && (
                  <div className="flex items-end justify-between pt-4 border-t border-white/[0.06]">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-1.5 rounded-full ${i < (s.overallScore || 0) / 2 ? 'bg-cyan' : 'bg-white/10'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-cyan leading-none">{s.overallScore}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Score / 10</div>
                    </div>
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
