import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  Loader2,
  RotateCcw,
  XCircle,
  Zap,
  Shield,
  Target,
  Flame,
  Activity,
  TrendingUp,
  MessageSquare,
  Code,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Sparkles,
  Clock,
  Sparkle,
  Lock,
  Route
} from "lucide-react";
import { cn } from "../lib/utils/cn";
import { getDueRecallPrompts, getRecallStats, reviewRecallAnswer, type RecallStats } from "../lib/api/recall";
import { getRevisionPriorities } from "../lib/api/intelligence";
import { logBehavior } from "../lib/api/behavior";
import type { RecallGrade, RecallPrompt, RecallReviewResult, RevisionPriority } from "@studybuddy/shared";
import { NebulaBackground } from "../components/common/NebulaBackground";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

const promptTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string; border: string; glow: string }> = {
  explain: { icon: <Brain size={14} />, label: "Spill the Tea (Active Recall)", color: "text-brand-light", bg: "bg-brand/5", border: "border-brand/20", glow: "shadow-brand/5" },
  implement: { icon: <Code size={14} />, label: "Flex Your Code (Implementation)", color: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/20", glow: "shadow-cyan-500/5" },
  compare: { icon: <MessageSquare size={14} />, label: "Vibe Clash (Compare & Contrast)", color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20", glow: "shadow-amber-500/5" },
  quiz: { icon: <HelpCircle size={14} />, label: "Pop Vibe Check (Interview Quiz)", color: "text-purple-400", bg: "bg-purple-500/5", border: "border-purple-500/20", glow: "shadow-purple-500/5" },
  own_words: { icon: <BookOpen size={14} />, label: "TL;DR (Explain Simply)", color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20", glow: "shadow-emerald-500/5" }
};

export function RecallPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const focusedNoteId = useMemo(() => new URLSearchParams(location.search).get("noteId") ?? undefined, [location.search]);
  const [prompts, setPrompts] = useState<RecallPrompt[]>([]);
  const [stats, setStats] = useState<RecallStats | null>(null);
  const [priorities, setPriorities] = useState<RevisionPriority[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<RecallReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const activePrompt = prompts[0];

  const loadRecall = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [nextPrompts, nextStats, nextPriorities] = await Promise.all([
        getDueRecallPrompts(focusedNoteId ? 1 : 10, focusedNoteId),
        getRecallStats(),
        getRevisionPriorities(5)
      ]);
      setPrompts(nextPrompts);
      setStats(nextStats);
      setPriorities(nextPriorities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recall session");
    } finally {
      setLoading(false);
    }
  }, [focusedNoteId]);

  useEffect(() => {
    void loadRecall();
  }, [loadRecall]);

  const submitReview = async (grade?: RecallGrade) => {
    if (!activePrompt || !answer.trim()) {
      return;
    }

    try {
      setReviewing(true);
      setError(null);
      const review = await reviewRecallAnswer({ noteId: activePrompt.noteId, answer: answer.trim(), grade });
      setResult(review);
      setShowResult(true);
      setSessionCount(prev => prev + 1);

      // Log the behavior
      await logBehavior("revision_completed", { noteId: activePrompt.noteId, grade: review.grade }).catch(() => {});

      setPrompts((current) => current.slice(1));
      setAnswer("");
      const nextStats = await getRecallStats();
      setStats(nextStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to review answer");
    } finally {
      setReviewing(false);
    }
  };

  const continueSession = () => {
    setShowResult(false);
    setResult(null);
  };

  const promptConfig = activePrompt?.promptType ? promptTypeConfig[activePrompt.promptType] : promptTypeConfig.explain;

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-[#07090e] text-slate-100">
      {/* Cyber grids & breathing auroras */}
      <NebulaBackground opacity={0.12} />
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.012]"
        style={{
          backgroundImage: `linear-gradient(to right, #22d3ee 1px, transparent 1px), linear-gradient(to bottom, #22d3ee 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />
      <div className="absolute top-0 right-0 -z-10 h-[280px] w-[280px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 -z-10 h-[280px] w-[280px] rounded-full bg-brand/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      {/* ─── HEADER ─── */}
      <header className="shrink-0 px-6 pt-6 pb-4 border-b border-white/[0.06] bg-slate-950/20 backdrop-blur-md relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase flex flex-wrap items-center gap-2">
                {focusedNoteId ? "Focused Vibe Check" : "Vibe Check Portal"}
                <span className="inline-flex items-center gap-1 rounded border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.1)] font-mono">
                  Memory Aura OS
                </span>
              </h1>
              <p className="text-slate-500 text-xs mt-1.5 font-medium leading-normal">
                {focusedNoteId
                  ? "Reviewing the exact concept note you selected from Knowledge Intelligence."
                  : "Active recall triggers neuroplasticity. Cramming is mid, retrieval is based."}
              </p>
            </div>
            <button
              onClick={() => void loadRecall()}
              className="self-start md:self-auto px-4 py-2 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all flex items-center gap-2 rounded-xl"
            >
              <RotateCcw size={12} /> Refresh Queue
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 bg-white/[0.01] border border-white/[0.04] p-3 rounded-2xl">
            <StatMetric label="Overdue" value={stats?.dueCount ?? 0} color="text-amber-400" icon={<Clock size={12} />} />
            <StatMetric label="Memory Aura" value={`${stats?.retentionScore ?? 0}%`} color="text-cyan-400" icon={<Shield size={12} />} />
            <StatMetric label="Synaptic Power" value={stats ? formatPercent(stats.averageStrength) : "0%"} color="text-brand-light" icon={<Activity size={12} />} />
            <StatMetric label="Daily Dubs" value={stats?.reviewedToday ?? 0} color="text-emerald-400" icon={<CheckCircle2 size={12} />} />
            <StatMetric label="Daily Streak" value={`${stats?.streakDays ?? 0}d`} color="text-amber-400" icon={<Flame size={12} />} />
            <StatMetric label="Active Session" value={sessionCount} color="text-purple-400" icon={<Zap size={12} />} />
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 z-10 backdrop-blur-md">
          {error}
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

            {/* ─── LEFT: RECALL CARD ─── */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                  <div className="w-12 h-12 rounded-full border-2 border-brand/20 border-t-brand animate-spin mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Loading your recall vibes...</p>
                </div>
              ) : showResult && result ? (
                /* ─── RESULT CARD ─── */
                <Motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-white/[0.08] bg-[#0c0e15]/60 p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-premium relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border",
                        result.grade === "good" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]" :
                        result.grade === "weak" ? "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]" :
                        "bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                      )}>
                        {result.grade === "good" ? <CheckCircle2 size={22} /> :
                         result.grade === "weak" ? <Activity size={22} /> :
                         <XCircle size={22} />}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wider font-display">
                          {result.grade === "good" ? "👑 BASED (Nailed it!)" :
                           result.grade === "weak" ? "📐 MID (Partial Recall)" :
                           "💀 L (Forgot Concept)"}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Semantic AI alignment match score</p>
                      </div>
                    </div>

                    {/* Glow Match Score Circle */}
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="currentColor" strokeWidth="2.5" className="text-white/5" />
                        <Motion.circle 
                          cx="50%" cy="50%" r="42%" 
                          fill="transparent" 
                          stroke={result.grade === "good" ? "#10B981" : result.grade === "weak" ? "#F59E0B" : "#EF4444"} 
                          strokeWidth="4" 
                          strokeLinecap="round"
                          strokeDasharray="100 100"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 100 - (result.score * 100) }}
                          className="transition-all duration-1000 ease-out" 
                        />
                      </svg>
                      <span className="text-xs font-black font-mono text-white">
                        {Math.round(result.score * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                      AI CRITIQUE EVALUATION
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed italic bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
                      "{result.feedback}"
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-slate-500 pt-4 border-t border-white/5 font-mono">
                    <span className="flex items-center gap-1.5"><Shield size={11} className="text-brand-light" /> Synaptic Strength: {formatPercent(result.note.strength)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><Clock size={11} className="text-cyan-400" /> Next Check: {new Date(result.nextReviewAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>Reviews Run: #{result.note.reviewCount}</span>
                  </div>

                  {/* Reinforcement Warning for weak recall based on Phase 4 workflow */}
                  {result.grade === "wrong" && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300 flex items-start gap-2.5">
                      <HelpCircle size={15} className="text-red-400 mt-0.5 shrink-0 animate-pulse" />
                      <div>
                        <span className="font-bold text-white block mb-0.5">Veda reinforcement triggered</span>
                        Gemini has injected a reinforcement revision task into your active queue to patch this gap before your next roadmap milestones unlock.
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={continueSession}
                      className="flex-1 py-4 bg-brand hover:bg-brand-light text-white font-black text-[10px] uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2 rounded-xl"
                    >
                      {prompts.length > 0 ? (
                        <>
                          <ArrowRight size={14} /> Next Concept ({prompts.length} remaining)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} /> Vibe Session Complete!
                        </>
                      )}
                    </button>
                  </div>
                </Motion.div>
              ) : activePrompt ? (
                /* ─── ACTIVE RECALL CARD ─── */
                <Motion.div
                  key={activePrompt.noteId}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "rounded-2xl border bg-[#0a0c10]/70 p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-premium transition-all duration-300 relative overflow-hidden",
                    promptConfig.border,
                    promptConfig.glow
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  
                  {/* Prompt header */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition duration-300",
                      promptConfig.bg,
                      promptConfig.border,
                      promptConfig.color
                    )}>
                      {promptConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={cn("inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em]", promptConfig.color)}>
                          {promptConfig.label}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/5 font-mono">
                          {activePrompt.topic}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-white leading-snug font-display">
                        {activePrompt.prompt}
                      </h2>
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1"><Shield size={11} className="text-slate-600" /> Retention Aura: {formatPercent(activePrompt.strength)}</span>
                        <span>·</span>
                        <span>{prompts.length} concepts waiting</span>
                      </div>
                    </div>
                  </div>

                  {/* Answer area */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">
                        Spill Your Synapses
                      </label>
                      <span className="text-[9px] font-bold text-slate-500 font-mono flex items-center gap-1">
                        <Sparkle size={10} className="text-[#a07ee0]" /> VEDA AI AUTO-EVAL ACTIVE
                      </span>
                    </div>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={7}
                      className="w-full bg-slate-950/40 rounded-xl border border-white/[0.06] px-5 py-4 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:border-brand/40 focus:bg-slate-950/80 focus:shadow-[0_0_15px_rgba(99,102,241,0.04)] transition-all outline-none resize-none font-mono leading-relaxed"
                      placeholder={
                        activePrompt.promptType === "implement"
                          ? "Drop the implementation strategy. Sketch out the variables, memory constraints, and Big O complexity limits..."
                          : activePrompt.promptType === "compare"
                          ? "Vibe check these two. Highlight when one is based and why the other is mid under scaling stress..."
                          : activePrompt.promptType === "quiz"
                          ? "Craft your pitch answer exactly as you would to a Principal Engineer in a tech interview..."
                          : "Explain this concept in your own words from pure memory. Spill the tea..."
                      }
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <button
                      disabled={reviewing || !answer.trim()}
                      onClick={() => void submitReview()}
                      className="px-5 py-3 rounded-xl bg-brand hover:bg-brand-light text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300 flex items-center gap-1.5"
                    >
                      {reviewing ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                      Ask Veda (Score)
                    </button>
                    
                    <span className="h-9 w-px bg-white/[0.06] self-center mx-1" />
                    
                    <button
                      disabled={reviewing || !answer.trim()}
                      onClick={() => void submitReview("good")}
                      className="px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/10 transition-all disabled:opacity-40"
                    >
                      🔥 Nailed it
                    </button>
                    <button
                      disabled={reviewing || !answer.trim()}
                      onClick={() => void submitReview("weak")}
                      className="px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-black uppercase tracking-wider hover:bg-amber-500/10 transition-all disabled:opacity-40"
                    >
                      📐 Partial
                    </button>
                    <button
                      disabled={reviewing || !answer.trim()}
                      onClick={() => void submitReview("wrong")}
                      className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-[10px] font-black uppercase tracking-wider hover:bg-red-500/10 transition-all disabled:opacity-40"
                    >
                      💀 Forgot
                    </button>
                  </div>
                </Motion.div>
              ) : (
                /* ─── EMPTY STATE ─── */
                <div className="py-24 text-center rounded-2xl border border-dashed border-white/5 bg-[#090b11]/30 backdrop-blur-sm p-8">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                    <CheckCircle2 size={26} />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight font-display">All caught up!</h2>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium mb-6 mt-1.5">
                    Your memory aura is completely locked in. No overdue concepts are in your queue right now. You are absolute based.
                  </p>
                  {sessionCount > 0 && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Reviewed <span className="text-brand-light font-bold">{sessionCount}</span> concepts this session. Cognitive load protected.
                    </div>
                  )}
                </div>
              )}

              {/* ─── QUEUE PREVIEW ─── */}
              {prompts.length > 1 && !showResult && (
                <div className="space-y-3">
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">
                    Next Up in Queue
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {prompts.slice(1, 5).map((p) => {
                      const config = promptTypeConfig[p.promptType] || promptTypeConfig.explain;
                      return (
                        <div
                          key={p.noteId}
                          className="shrink-0 px-4 py-3.5 border border-white/[0.04] bg-[#0a0c10]/40 rounded-xl min-w-[190px] space-y-2 hover:bg-[#0c0f16]/80 transition duration-200"
                        >
                          <span className={cn("flex items-center gap-1.5 text-[8px] font-black uppercase font-mono tracking-wider", config.color)}>
                            {config.icon} {config.label.split(" ")[0]}
                          </span>
                          <p className="text-[11px] font-bold text-slate-300 line-clamp-1">{p.title}</p>
                          <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              p.strength > 0.6 ? "bg-emerald-500" : p.strength > 0.3 ? "bg-amber-500" : "bg-red-500"
                            )} />
                            Aura: {formatPercent(p.strength)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ─── RIGHT: SIDEBAR ─── */}
            <aside className="space-y-6 hidden lg:block">
              
              {/* Weak Topics */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">
                  Weakest Synapses
                </h3>
                {(stats?.weakTopics ?? []).length === 0 ? (
                  <p className="text-[10px] text-slate-600 font-medium">No weak nodes detected. Aura stable.</p>
                ) : (
                  <div className="space-y-2">
                    {stats?.weakTopics.slice(0, 6).map((topic) => (
                      <div key={topic.topic} className="px-4 py-3 border border-white/[0.04] bg-white/[0.005] rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-300 truncate">{topic.topic}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">{topic.noteCount} nodes · {topic.dueCount} overdue</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-10 h-1 bg-white/5 overflow-hidden rounded-full">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                topic.averageStrength > 0.6 ? "bg-emerald-500" :
                                topic.averageStrength > 0.3 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${topic.averageStrength * 100}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 w-8 text-right font-mono">
                            {formatPercent(topic.averageStrength)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Revision Priorities */}
              {priorities.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">
                    Priority Synapse Queue
                  </h3>
                  <div className="space-y-2">
                    {priorities.map((p) => (
                      <div key={p.noteId} className="px-4 py-3 border border-white/[0.04] bg-white/[0.005] rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            p.urgency === "critical" ? "bg-red-500 animate-pulse" :
                            p.urgency === "high" ? "bg-amber-500" :
                            p.urgency === "medium" ? "bg-cyan-500" : "bg-transparent0"
                          )} />
                          <p className="font-bold text-slate-300 truncate flex-1">{p.title}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 leading-normal">{p.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Progress */}
              {sessionCount > 0 && (
                <div className="p-5 border border-brand/20 bg-brand/5 rounded-2xl space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 blur-xl rounded-full" />
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Session Progress</h3>
                  <div className="text-3xl font-black text-brand-light font-display">{sessionCount}</div>
                  <p className="text-[10px] text-slate-500 font-mono">concepts checked this session</p>
                  <div className="h-1 bg-white/5 overflow-hidden rounded-full">
                    <Motion.div
                      className="h-full bg-brand rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${Math.min(100, (sessionCount / (stats?.dueCount || 10)) * 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatMetric({ label, value, color, icon }: {
  label: string; value: string | number; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 border-r border-white/5 last:border-0">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.02] border border-white/5", color)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase text-slate-500 font-mono tracking-wider truncate leading-none mb-1">{label}</p>
        <p className={cn("text-sm sm:text-base font-black leading-none", color)}>{value}</p>
      </div>
    </div>
  );
}
