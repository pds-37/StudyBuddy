import { useEffect, useState } from "react";
import { 
  Mic, 
  BrainCircuit, 
  Play, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  Sparkles, 
  Flame, 
  Laptop, 
  Building2, 
  BookOpen, 
  UserSquare2, 
  Compass,
  Cpu,
  Layers,
  Award
} from "lucide-react";
import { useInterviewStore } from "../../../store/interview-store";
import { usePanelInterviewStore } from "../../../store/panel-interview-store";
import { useAppStore } from "../../../store/app-store";
import { InterviewSession } from "./InterviewSession";
import { VoiceInterviewSession } from "./VoiceInterviewSession";
import { ShadowPanelCockpit } from "./ShadowPanelCockpit";
import { MultiplayerPanelCockpit } from "./MultiplayerPanelCockpit";
import { Link } from "react-router-dom";
import type { StartInterviewOptions } from "../../../lib/api/interview";
import { Users } from "lucide-react";

export function InterviewWorkspace() {
  const { currentSession, loading, error, fetchSessions, startSession, sessions } = useInterviewStore();
  const { 
    currentSession: panelSession, 
    startSession: startPanel, 
    loading: panelLoading, 
    error: panelError 
  } = usePanelInterviewStore();
  const user = useAppStore(state => state.user);

  // Configuration States
  const [mode, setMode] = useState<StartInterviewOptions["mode"] | "panel" | "multiplayer">("technical");
  const [difficulty, setDifficulty] = useState<StartInterviewOptions["difficulty"]>("intermediate");
  const [personality, setPersonality] = useState<StartInterviewOptions["interviewerPersonality"]>("friendly");
  const [pressureMode, setPressureMode] = useState(false);
  const [targetCompany, setTargetCompany] = useState("");
  const [multiplayerActive, setMultiplayerActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"standard" | "voice">("standard");

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleStart = async () => {
    if (mode === "panel") {
      await startPanel();
    } else if (mode === "multiplayer") {
      setMultiplayerActive(true);
    } else {
      await startSession({
        mode,
        difficulty,
        interviewerPersonality: personality,
        pressureMode,
        targetCompany: mode === "company" ? targetCompany : ""
      });
    }
  };

  if (!user?.targetRoles || user.targetRoles.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex items-start gap-4 backdrop-blur-xl animate-fade-in">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
        <div>
          <h3 className="text-lg font-bold text-amber-300 font-display">Target SDE Role Required</h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            You must establish a target career role in your profile parameters before Veda AI can synthesize specialized SDE technical loops or scenario outage assessments.
          </p>
          <Link to="/onboarding" className="mt-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:text-white hover:bg-amber-500/20 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
            Initiate Profile Onboarding
          </Link>
        </div>
      </div>
    );
  }

  if (currentSession) {
    if (activeTab === "voice") {
      return <VoiceInterviewSession session={currentSession} />;
    }
    return <InterviewSession session={currentSession} />;
  }

  if (panelSession) {
    return <ShadowPanelCockpit />;
  }

  if (multiplayerActive) {
    return <MultiplayerPanelCockpit />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3 backdrop-blur-xl">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {panelError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3 backdrop-blur-xl">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{panelError}</span>
        </div>
      )}

      {/* Top Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("standard")}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl font-bold transition-all duration-300 ${
            activeTab === "standard"
              ? "bg-[#07090d]/80 text-white border-t border-l border-r border-brand/50 shadow-[0_-5px_15px_rgba(99,102,241,0.15)]"
              : "bg-[#07090d]/40 text-slate-500 hover:text-slate-300 hover:bg-[#07090d]/60 border-t border-l border-r border-white/5"
          }`}
        >
          <Laptop size={18} />
          Standard Cockpit
        </button>
        <button
          onClick={() => setActiveTab("voice")}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl font-bold transition-all duration-300 ${
            activeTab === "voice"
              ? "bg-[#07090d]/80 text-white border-t border-l border-r border-rose-500/50 shadow-[0_-5px_15px_rgba(244,63,94,0.15)]"
              : "bg-[#07090d]/40 text-slate-500 hover:text-slate-300 hover:bg-[#07090d]/60 border-t border-l border-r border-white/5"
          }`}
        >
          <Mic size={18} />
          Voice Call Mode
        </button>
      </div>

      {/* Premium Adaptive Cockpit Configurator */}
      <div className={`relative overflow-hidden ${activeTab === 'standard' ? 'rounded-2xl rounded-tl-none' : 'rounded-2xl rounded-tr-none'} border border-white/[0.06] bg-[#07090d]/80 p-8 sm:p-10 backdrop-blur-xl shadow-premium`}>
        
        {/* Subtle Neon haze backdrops */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cyan/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.06] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-light font-mono">Cognitive Assessment Setup</p>
              </div>
              <h2 className="text-3xl font-extrabold text-white font-display tracking-tight">AI Interview Cockpit</h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xl">
                Configure your mock parameters. Veda AI will synthesize highly tailored technical questions, real production incident scenarios, or target behavioral loops.
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand-light shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-end bg-[#0c0e12]/50 border border-white/[0.06] p-6 rounded-2xl">
            {/* Mode Select */}
            <div className="flex-1 space-y-2 w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-[#07090d]/80 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/40 transition-all appearance-none cursor-pointer"
              >
                <option value="technical">Technical SDE Core</option>
                <option value="scenario">Scenario Outage</option>
                <option value="behavioral">HR / Behavioral</option>
                <option value="panel">Veda Shadow Panel</option>
                <option value="multiplayer">Coop Shadow Arena</option>
                <option value="company">Company-Specific</option>
                <option value="mock">Full Mock Round</option>
              </select>
            </div>

            {/* Difficulty Select */}
            <div className="flex-1 space-y-2 w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#07090d]/80 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/40 transition-all appearance-none cursor-pointer"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="adaptive">Adaptive</option>
              </select>
            </div>

            {/* Personality Select */}
            <div className="flex-1 space-y-2 w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Interviewer</label>
              <select
                value={personality}
                onChange={(e) => setPersonality(e.target.value as any)}
                className="w-full bg-[#07090d]/80 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/40 transition-all appearance-none cursor-pointer"
              >
                <option value="friendly">Friendly Mentor</option>
                <option value="strict">Strict FAANG Rep</option>
                <option value="founder">Startup Founder</option>
                <option value="architect">SDE Architect</option>
              </select>
            </div>

            {/* Pressure Toggle */}
            <button
              type="button"
              onClick={() => setPressureMode(!pressureMode)}
              className={`flex-shrink-0 flex items-center justify-center gap-2 h-[46px] px-6 rounded-xl border text-xs font-bold transition-all ${
                pressureMode
                  ? "border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  : "border-white/10 bg-[#07090d]/80 text-slate-400 hover:text-white"
              }`}
            >
              <Clock size={16} />
              {pressureMode ? "Pressure On" : "Pressure Off"}
            </button>
          </div>

          {/* Company Input (Shown if company mode selected) */}
          {mode === "company" && (
            <div className="space-y-2.5 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Specify Target Company</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Google, Amazon, Stripe, Razorpay"
                className="w-full bg-[#0c0e12]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand/40 transition-all"
              />
            </div>
          )}

          {/* Action Button Section */}
          <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono">Assessing Target Profile:</span>
              <p className="text-xs text-brand-light font-bold mt-1 font-display">
                {user.targetRoles[0]} loops customized with {user.currentSkills.slice(0, 4).join(", ")}
              </p>
            </div>

            <button
              onClick={handleStart}
              disabled={loading || panelLoading}
              className="w-full sm:w-auto shrink-0 relative group/btn inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-brand via-purple-600 to-accent px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-wait"
            >
              {loading || panelLoading ? (
                <>
                  <BrainCircuit className="w-4 h-4 animate-spin text-white" />
                  {panelLoading ? "Assembling Committee Panel..." : "Compiling SDE Loops..."}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-white" />
                  {mode === "panel" ? "Enter Shadow Panel Arena" : activeTab === "voice" ? "Launch Voice Call" : "Launch Assessment Cockpit"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* History Area */}
      {sessions.length > 0 && (
        <div className="space-y-5 relative z-10">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
              <Clock className="w-4 h-4 text-slate-500" />
              SDE History Reports
            </h3>
            <span className="text-xs text-slate-500 font-mono font-bold uppercase">{sessions.length} Session records</span>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {sessions.map(s => (
              <div 
                key={s.id} 
                className="group/card relative rounded-xl border border-white/[0.06] bg-[#07090d]/60 p-5 transition-all duration-300 hover:border-brand/35 hover:bg-[#0c0f17]/80 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-base text-white group-hover/card:text-brand-light transition-colors">{s.targetRole} Prep</h4>
                    <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-2 font-mono font-bold uppercase">
                      <span>{s.mode}</span>
                      <span>•</span>
                      <span>{new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border font-mono ${
                    s.status === 'completed' 
                      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' 
                      : 'border-brand/20 bg-brand/10 text-brand-light animate-pulse'
                  }`}>
                    {s.status}
                  </span>
                </div>
                
                {s.status === "completed" && s.overallScore !== undefined && (
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-1.5 rounded-full ${i < (s.overallScore || 0) / 2 ? 'bg-cyan shadow-[0_0_6px_rgba(6,182,212,0.6)]' : 'bg-white/10'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-cyan leading-none font-display">{s.overallScore}<span className="text-xs text-slate-500 font-normal ml-0.5">/10</span></div>
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">Performance Grade</div>
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
