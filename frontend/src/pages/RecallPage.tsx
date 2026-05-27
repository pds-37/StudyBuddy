import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
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
  Clock
} from "lucide-react";
import { cn } from "../lib/utils/cn";
import { getDueRecallPrompts, getRecallStats, reviewRecallAnswer, type RecallStats } from "../lib/api/recall";
import { getRevisionPriorities } from "../lib/api/intelligence";
import { logBehavior } from "../lib/api/behavior";
import type { RecallGrade, RecallPrompt, RecallReviewResult, RevisionPriority } from "@studybuddy/shared";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

const promptTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  explain: { icon: <Brain size={14} />, label: "Active Recall", color: "text-brand" },
  implement: { icon: <Code size={14} />, label: "Implementation", color: "text-cyan-400" },
  compare: { icon: <MessageSquare size={14} />, label: "Compare & Contrast", color: "text-amber-400" },
  quiz: { icon: <HelpCircle size={14} />, label: "Interview Quiz", color: "text-purple-400" },
  own_words: { icon: <BookOpen size={14} />, label: "Explain Simply", color: "text-emerald-400" }
};

export function RecallPage() {
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
    <div className="flex flex-col h-full overflow-hidden relative bg-background">
      {/* ─── HEADER ─── */}
      <header className="shrink-0 px-8 pt-8 pb-5 border-b border-border glass-panel relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-base font-semibold text-slate-100 flex items-center gap-3">
                {focusedNoteId ? "Focused Recall" : "Memory Training"}
                <span className="text-cyan-400 text-[9px] border border-cyan-500/20 px-2 py-0.5 bg-cyan-500/5 font-bold tracking-wider uppercase">
                  Recall Engine
                </span>
              </h1>
              <p className="text-slate-400 text-[11px] mt-1.5 font-medium">
                {focusedNoteId
                  ? "Reviewing the exact note you selected from Knowledge Intelligence."
                  : "Active recall strengthens neural pathways. Passive re-reading doesn&apos;t."}
              </p>
            </div>
            <button
              onClick={() => void loadRecall()}
              className="px-4 py-2 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 hover:text-white transition-all flex items-center gap-2"
            >
              <RotateCcw size={12} /> Refresh Queue
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
            <StatMetric label="Due Now" value={stats?.dueCount ?? 0} color="text-amber-400" icon={<Clock size={12} />} />
            <StatMetric label="Retention" value={`${stats?.retentionScore ?? 0}%`} color="text-cyan-400" icon={<Shield size={12} />} />
            <StatMetric label="Avg Strength" value={stats ? formatPercent(stats.averageStrength) : "0%"} color="text-brand" icon={<Activity size={12} />} />
            <StatMetric label="Today" value={stats?.reviewedToday ?? 0} color="text-emerald-400" icon={<CheckCircle2 size={12} />} />
            <StatMetric label="Streak" value={`${stats?.streakDays ?? 0}d`} color="text-amber-400" icon={<Flame size={12} />} />
            <StatMetric label="Session" value={sessionCount} color="text-purple-400" icon={<Zap size={12} />} />
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-8 mt-4 border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

            {/* ─── LEFT: RECALL CARD ─── */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                  <div className="w-14 h-14 rounded-full border-4 border-brand/20 border-t-brand animate-spin mb-4" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading recall queue...</p>
                </div>
              ) : showResult && result ? (
                /* ─── RESULT CARD ─── */
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-8 space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 flex items-center justify-center",
                      result.grade === "good" ? "bg-emerald-500/10 text-emerald-400" :
                      result.grade === "weak" ? "bg-amber-500/10 text-amber-400" :
                      "bg-red-500/10 text-red-400"
                    )}>
                      {result.grade === "good" ? <CheckCircle2 size={24} /> :
                       result.grade === "weak" ? <Activity size={24} /> :
                       <XCircle size={24} />}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white capitalize">{result.grade}</h2>
                      <p className="text-[10px] text-slate-500">Match score: {formatPercent(result.score)}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">{result.feedback}</p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-4 border-t border-white/5">
                    <span>Strength: {formatPercent(result.note.strength)}</span>
                    <span>·</span>
                    <span>Next review: {new Date(result.nextReviewAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>Review #{result.note.reviewCount}</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={continueSession}
                      className="flex-1 py-3 bg-brand text-white font-bold text-[10px] uppercase tracking-widest hover:bg-brand/90 transition-all flex items-center justify-center gap-2"
                    >
                      {prompts.length > 0 ? (
                        <>
                          <ArrowRight size={14} /> Next Concept ({prompts.length} remaining)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} /> Session Complete
                        </>
                      )}
                    </button>
                  </div>
                </Motion.div>
              ) : activePrompt ? (
                /* ─── ACTIVE RECALL CARD ─── */
                <Motion.div
                  key={activePrompt.noteId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-8 space-y-6"
                >
                  {/* Prompt header */}
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 flex items-center justify-center bg-brand/10 text-brand shrink-0">
                      <Brain size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn("flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest", promptConfig.color)}>
                          {promptConfig.icon} {promptConfig.label}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400 bg-white/[0.04] px-2 py-0.5">
                          {activePrompt.topic}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-white leading-snug">{activePrompt.prompt}</h2>
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400">
                        <span>Strength: {formatPercent(activePrompt.strength)}</span>
                        <span>{prompts.length} in queue</span>
                      </div>
                    </div>
                  </div>

                  {/* Answer area */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Your Answer</label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={8}
                      className="w-full bg-transparent border border-white/[0.08] px-5 py-4 text-sm text-white placeholder-slate-600 focus:border-brand transition-all outline-none resize-none font-mono leading-relaxed"
                      placeholder={
                        activePrompt.promptType === "implement"
                          ? "Describe your approach, algorithm steps, and complexity..."
                          : activePrompt.promptType === "compare"
                          ? "Highlight similarities, differences, and when to use each..."
                          : activePrompt.promptType === "quiz"
                          ? "Answer as you would in a real interview..."
                          : "Explain in your own words from memory..."
                      }
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      disabled={reviewing || !answer.trim()}
                      onClick={() => void submitReview()}
                      className="px-6 py-2.5 bg-brand text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-brand/90 transition-all flex items-center gap-2"
                    >
                      {reviewing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                      AI Score
                    </button>
                    <button
                      disabled={reviewing || !answer.trim()}
                      onClick={() => void submitReview("good")}
                      className="px-4 py-2.5 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/10 transition-all disabled:opacity-40"
                    >
                      ✓ Nailed it
                    </button>
                    <button
                      disabled={reviewing || !answer.trim()}
                      onClick={() => void submitReview("weak")}
                      className="px-4 py-2.5 border border-amber-500/30 text-amber-400 text-[10px] font-semibold hover:bg-amber-500/10 transition-all disabled:opacity-40"
                    >
                      ~ Partial
                    </button>
                    <button
                      disabled={reviewing || !answer.trim()}
                      onClick={() => void submitReview("wrong")}
                      className="px-4 py-2.5 border border-red-500/30 text-red-400 text-[10px] font-semibold hover:bg-red-500/10 transition-all disabled:opacity-40"
                    >
                      ✗ Forgot
                    </button>
                  </div>
                </Motion.div>
              ) : (
                /* ─── EMPTY STATE ─── */
                <div className="py-24 text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">All caught up!</h2>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium mb-6">
                    No concepts are due for revision right now. Your memory is holding strong. Come back when the next review window opens.
                  </p>
                  {sessionCount > 0 && (
                    <div className="text-[10px] text-slate-400">
                      You reviewed <span className="text-brand font-semibold">{sessionCount}</span> concepts this session. Great work!
                    </div>
                  )}
                </div>
              )}

              {/* ─── QUEUE PREVIEW ─── */}
              {prompts.length > 1 && !showResult && (
                <div className="space-y-2">
                  <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Up Next</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {prompts.slice(1, 5).map((p, i) => {
                      const config = promptTypeConfig[p.promptType] || promptTypeConfig.explain;
                      return (
                        <div
                          key={p.noteId}
                          className="shrink-0 px-4 py-3 border border-white/[0.06] min-w-[180px] space-y-2"
                        >
                          <span className={cn("flex items-center gap-1 text-[9px] font-bold uppercase", config.color)}>
                            {config.icon} {config.label}
                          </span>
                          <p className="text-[11px] font-medium text-slate-400 line-clamp-1">{p.title}</p>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              p.strength > 0.6 ? "bg-emerald-500" : p.strength > 0.3 ? "bg-amber-500" : "bg-red-500"
                            )} />
                            {formatPercent(p.strength)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ─── RIGHT: SIDEBAR ─── */}
            <aside className="space-y-8 hidden lg:block">
              {/* Weak Topics */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Weakest Concepts</h3>
                {(stats?.weakTopics ?? []).length === 0 ? (
                  <p className="text-[10px] text-slate-400">No weak topics detected yet.</p>
                ) : (
                  <div className="space-y-2">
                    {stats?.weakTopics.slice(0, 6).map((topic) => (
                      <div key={topic.topic} className="px-4 py-3 border border-white/[0.06] flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-slate-300 truncate">{topic.topic}</p>
                          <p className="text-[9px] text-slate-400">{topic.noteCount} notes · {topic.dueCount} due</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-white/5 overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all",
                                topic.averageStrength > 0.6 ? "bg-emerald-500" :
                                topic.averageStrength > 0.3 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${topic.averageStrength * 100}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-medium text-slate-500 w-8 text-right">
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
                  <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Priority Queue</h3>
                  <div className="space-y-2">
                    {priorities.map((p) => (
                      <div key={p.noteId} className="px-4 py-3 border border-white/[0.06] space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            p.urgency === "critical" ? "bg-red-500" :
                            p.urgency === "high" ? "bg-amber-500" :
                            p.urgency === "medium" ? "bg-cyan-500" : "bg-transparent0"
                          )} />
                          <p className="text-[11px] font-medium text-slate-300 truncate flex-1">{p.title}</p>
                        </div>
                        <p className="text-[9px] text-slate-400 line-clamp-1">{p.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Progress */}
              {sessionCount > 0 && (
                <div className="p-5 border border-brand/20 bg-brand/5 space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Progress</h3>
                  <div className="text-3xl font-light text-brand">{sessionCount}</div>
                  <p className="text-[10px] text-slate-500">concepts reviewed this session</p>
                  <div className="h-1 bg-white/5 overflow-hidden">
                    <Motion.div
                      className="h-full bg-brand"
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
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className={cn("opacity-50", color)}>{icon}</span>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <p className={cn("text-xl font-light tracking-tight", color)}>{value}</p>
    </div>
  );
}
