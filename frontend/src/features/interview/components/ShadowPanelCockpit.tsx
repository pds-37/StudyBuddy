import { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  Activity, 
  Send, 
  User, 
  Smile, 
  AlertTriangle, 
  Sparkles,
  Sliders,
  Cpu,
  Brain,
  Volume2
} from "lucide-react";
import { usePanelInterviewStore } from "../../../store/panel-interview-store";
import { motion, AnimatePresence } from "framer-motion";

export function ShadowPanelCockpit() {
  const { currentSession, loading, error, submitAnswer, clearSession } = usePanelInterviewStore();
  const [answerInput, setAnswerInput] = useState("");
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the dialogue stream whenever the question or transcript updates
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.currentQuestionIndex, currentSession?.questions]);

  if (!currentSession) return null;

  const currentIdx = currentSession.currentQuestionIndex;
  const currentQuestion = currentSession.questions[currentIdx];
  const activeTranscript = currentQuestion?.debateTranscript || [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || loading) return;

    const answer = answerInput;
    setAnswerInput("");
    await submitAnswer(currentQuestion.id, answer);
  };

  // Determine stress level categorization
  const stressColor = currentSession.stressIndex > 70 
    ? "text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
    : currentSession.stressIndex > 45 
      ? "text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]" 
      : "text-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)]";

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 animate-fade-in relative z-10">
      
      {/* Dynamic Alarm Header for high Interruption Risk */}
      <AnimatePresence>
        {currentSession.interruptionRisk >= 60 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center justify-between backdrop-blur-xl animate-pulse"
          >
            <span className="flex items-center gap-2 font-mono font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              CRITICAL INTERRUPTION THRESHOLD EXCEEDED
            </span>
            <span className="text-[10px] font-black uppercase bg-red-500/25 px-2 py-0.5 rounded border border-red-500/30">
              High Interruption Risk ({currentSession.interruptionRisk}%)
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Interview Panel Cockpit */}
      <div className="grid gap-6 lg:grid-cols-4">
        
        {/* Left Side: Three Interviewers Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-white/[0.06] bg-[#07090d]/85 p-4 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 font-mono border-b border-white/[0.06] pb-2 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-brand" />
              Panel Status
            </h3>

            {/* Devin (Lead Architect) */}
            <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
              currentSession.metrics.architect.impatience > 60 
                ? "border-red-500/30 bg-red-500/5" 
                : "border-white/[0.04] bg-[#0c0e12]/60"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-display">Devin (Architect)</h4>
                  <p className="text-[9px] font-mono text-slate-500 font-bold uppercase mt-0.5">Strict SDE scaling</p>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${
                  currentSession.metrics.architect.impatience > 50 
                    ? "bg-red-500 animate-ping" 
                    : "bg-cyan shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                }`} />
              </div>

              <div className="space-y-2 mt-4">
                {/* Tech Satisfaction */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">
                    <span>Precision</span>
                    <span>{currentSession.metrics.architect.satisfaction}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan h-full rounded-full transition-all duration-500" 
                      style={{ width: `${currentSession.metrics.architect.satisfaction}%` }}
                    />
                  </div>
                </div>

                {/* Impatience */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">
                    <span>Impatience</span>
                    <span>{currentSession.metrics.architect.impatience}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${currentSession.metrics.architect.impatience}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sarah (Product Manager) */}
            <div className="p-3.5 rounded-xl border border-white/[0.04] bg-[#0c0e12]/60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-display">Sarah (Product PM)</h4>
                  <p className="text-[9px] font-mono text-slate-500 font-bold uppercase mt-0.5">Customer & velocity</p>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.4)]" />
              </div>

              <div className="space-y-2 mt-4">
                {/* Satisfaction */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">
                    <span>UX / Alignment</span>
                    <span>{currentSession.metrics.pm.satisfaction}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${currentSession.metrics.pm.satisfaction}%` }}
                    />
                  </div>
                </div>

                {/* Impatience */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">
                    <span>Boredom</span>
                    <span>{currentSession.metrics.pm.impatience}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${currentSession.metrics.pm.impatience}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Marcus (Engineering Manager) */}
            <div className="p-3.5 rounded-xl border border-white/[0.04] bg-[#0c0e12]/60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-display">Marcus (EM Moderator)</h4>
                  <p className="text-[9px] font-mono text-slate-500 font-bold uppercase mt-0.5">Culture & EM Metrics</p>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
              </div>

              <div className="space-y-2 mt-4">
                {/* EM Satisfaction */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-slate-400 mb-1">
                    <span>Cohesion</span>
                    <span>{currentSession.metrics.em.satisfaction}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${currentSession.metrics.em.satisfaction}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Center/Right: Dynamic Dialogue Arena & Question HUD */}
        <div className="lg:col-span-3 space-y-6 flex flex-col h-full">
          
          {/* Question HUD card */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#07090d]/85 p-6 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 blur-[80px] pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-black uppercase bg-brand/20 border border-brand/35 text-brand-light px-2 py-0.5 rounded">
                  Round {currentIdx + 1} of 3
                </span>
                <span className="text-[9px] font-mono font-black uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  {currentQuestion?.category}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                Stress: <span className="font-extrabold text-white">{currentSession.stressIndex}%</span>
              </span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight leading-relaxed font-display">
              {currentQuestion?.question}
            </h3>
          </div>

          {/* Committee Debate Stream */}
          <div className="flex-1 rounded-2xl border border-white/[0.06] bg-[#07090d]/60 p-6 backdrop-blur-xl min-h-[300px] max-h-[450px] overflow-y-auto space-y-6">
            <div className="text-[9px] font-mono font-black uppercase text-slate-500 border-b border-white/[0.04] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                Live Committee Dialogue
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan" />
                Active Telemetry Stream
              </span>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {activeTranscript.map((chat, idx) => {
                  const isDevin = chat.speaker.startsWith("Devin");
                  const isSarah = chat.speaker.startsWith("Sarah");
                  
                  let bubbleStyle = "border-white/10 bg-white/[0.02] text-slate-300";
                  let borderHaze = "border-white/[0.06]";
                  let speakerIconColor = "text-slate-400";
                  
                  if (isDevin) {
                    bubbleStyle = "border-cyan/20 bg-cyan/5 text-cyan-50";
                    borderHaze = "border-cyan/10 hover:border-cyan/20";
                    speakerIconColor = "text-cyan";
                  } else if (isSarah) {
                    bubbleStyle = "border-purple-500/20 bg-purple-500/5 text-purple-50";
                    borderHaze = "border-purple-500/10 hover:border-purple-500/20";
                    speakerIconColor = "text-purple-400";
                  } else {
                    bubbleStyle = "border-emerald-500/20 bg-emerald-500/5 text-emerald-50";
                    borderHaze = "border-emerald-500/10 hover:border-emerald-500/20";
                    speakerIconColor = "text-emerald-400";
                  }

                  return (
                    <motion.div
                      key={`${currentIdx}-${idx}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.1 }}
                      className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 ${borderHaze} ${bubbleStyle}`}
                    >
                      <div className={`p-2 rounded-lg bg-black/40 border border-white/5 ${speakerIconColor} shrink-0`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black tracking-wide uppercase font-mono">{chat.speaker}</h4>
                          <span className="text-[8px] font-mono font-black uppercase opacity-60 bg-black/30 px-1.5 py-0.5 rounded">
                            {chat.mood}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-300 leading-normal">
                          {chat.dialogue}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* User Input Composer */}
          {currentSession.status === "in_progress" ? (
            <form onSubmit={handleSend} className="space-y-3 relative z-10">
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0e12]/80 focus-within:border-brand/40 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all">
                <textarea
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Outline your architectural solution, tradeoffs, algorithms, and Star outcomes..."
                  rows={4}
                  disabled={loading}
                  className="w-full bg-transparent px-5 py-4 text-sm text-white placeholder:text-slate-600 outline-none resize-none leading-relaxed"
                />

                <div className="border-t border-white/[0.04] bg-[#07090d]/60 px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 border border-white/5 text-[9px] font-mono font-bold text-slate-400">
                      <Cpu className="w-3.5 h-3.5 text-cyan animate-pulse" />
                      Biometric Active
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!answerInput.trim() || loading}
                    className="group/btn relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-purple-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.45)] transition active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {loading ? (
                      <>
                        <Brain className="w-4 h-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Answer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            // Holistic Completion Report
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-6 backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px]" />
              
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-300 font-display">Hiring Committee Final Verdict</h3>
                  <p className="text-xs text-slate-400 mt-1">Multi-agent debate concluded successfully.</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-emerald-400 leading-none font-display">
                    {currentSession.overallScore}
                    <span className="text-sm font-normal text-slate-500">/10</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 font-mono block mt-1">Consensus Grade</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  Consensus Review Transcript
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed leading-normal">
                  {currentSession.overallFeedback}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={clearSession}
                  className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-300 transition"
                >
                  Return to Cockpit
                </button>
              </div>
            </motion.div>
          )}

        </div>

      </div>

    </div>
  );
}
