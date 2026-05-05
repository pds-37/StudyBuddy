import { useEffect, useMemo, useState } from "react";
import { Brain, CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { getDueRecallPrompts, getRecallStats, reviewRecallAnswer, type RecallStats } from "../lib/api/recall";
import { logBehavior } from "../lib/api/behavior";
import type { RecallGrade, RecallPrompt, RecallReviewResult } from "@studybuddy/shared";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function RecallPage() {
  const [prompts, setPrompts] = useState<RecallPrompt[]>([]);
  const [stats, setStats] = useState<RecallStats | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<RecallReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activePrompt = prompts[0];

  const loadRecall = async () => {
    try {
      setLoading(true);
      setError(null);
      const [nextPrompts, nextStats] = await Promise.all([
        getDueRecallPrompts(10),
        getRecallStats()
      ]);
      setPrompts(nextPrompts);
      setStats(nextStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recall session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecall();
  }, []);

  const submitReview = async (grade?: RecallGrade) => {
    if (!activePrompt || !answer.trim()) {
      return;
    }

    try {
      setReviewing(true);
      setError(null);
      const review = await reviewRecallAnswer({ noteId: activePrompt.noteId, answer: answer.trim(), grade });
      setResult(review);
      
      // Log the behavior for the Behavior Engine
      await logBehavior("revision_completed", { noteId: activePrompt.noteId, grade: review.grade });
      
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

  const strengthLabel = useMemo(() => {
    if (!stats || stats.totalNotes === 0) {
      return "No memory model yet";
    }
    return `${formatPercent(stats.averageStrength)} average strength`;
  }, [stats]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan">Recall</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Memory Training</h1>
          <p className="mt-2 text-slate-400">Review due notes, score recall, and strengthen weak topics.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadRecall()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
        >
          <RotateCcw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Due now</p>
          <p className="mt-2 text-3xl font-semibold text-white">{stats?.dueCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Tracked notes</p>
          <p className="mt-2 text-3xl font-semibold text-white">{stats?.totalNotes ?? 0}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Memory health</p>
          <p className="mt-2 text-3xl font-semibold text-white">{strengthLabel}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          {loading ? (
            <div className="flex items-center gap-3 text-slate-300">
              <Loader2 className="animate-spin" size={18} />
              Loading recall queue...
            </div>
          ) : activePrompt ? (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-brand/10 p-3 text-brand">
                  <Brain size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan">{activePrompt.topic}</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">{activePrompt.prompt}</h2>
                  <p className="mt-2 text-sm text-slate-400">Current strength: {formatPercent(activePrompt.strength)}</p>
                </div>
              </div>

              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                rows={8}
                className="w-full rounded-lg border border-white/10 bg-obsidian/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand"
                placeholder="Type your explanation from memory..."
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={reviewing || !answer.trim()}
                  onClick={() => void submitReview()}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {reviewing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Auto score
                </button>
                <button type="button" disabled={reviewing || !answer.trim()} onClick={() => void submitReview("good")} className="rounded-lg border border-emerald-500/30 px-4 py-2 text-sm text-emerald-200 disabled:opacity-50">I knew it</button>
                <button type="button" disabled={reviewing || !answer.trim()} onClick={() => void submitReview("weak")} className="rounded-lg border border-amber-500/30 px-4 py-2 text-sm text-amber-200 disabled:opacity-50">Half remembered</button>
                <button type="button" disabled={reviewing || !answer.trim()} onClick={() => void submitReview("wrong")} className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-200 disabled:opacity-50">Missed it</button>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto text-emerald-400" size={34} />
              <h2 className="mt-4 text-xl font-semibold text-white">Nothing due right now</h2>
              <p className="mt-2 text-slate-400">Add more notes or come back when the next review window opens.</p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {result && (
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2">
                {result.grade === "wrong" ? <XCircle className="text-red-300" size={18} /> : <CheckCircle2 className="text-emerald-300" size={18} />}
                <p className="font-semibold text-white">Last result: {result.grade}</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">{result.feedback}</p>
              <p className="mt-3 text-xs text-slate-500">Match score: {formatPercent(result.score)}</p>
            </div>
          )}

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h2 className="font-semibold text-white">Weak Topics</h2>
            <div className="mt-4 space-y-3">
              {(stats?.weakTopics ?? []).length === 0 ? (
                <p className="text-sm text-slate-400">No weak topics yet.</p>
              ) : (
                stats?.weakTopics.map((topic) => (
                  <div key={topic.topic} className="rounded-lg bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{topic.topic}</p>
                      <span className="text-xs text-cyan">{formatPercent(topic.averageStrength)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{topic.noteCount} notes, {topic.dueCount} due</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
