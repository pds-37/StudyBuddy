import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  Circle,
  ClipboardList,
  GraduationCap,
  Loader2,
  MessageSquare,
  NotebookText,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { getMentorToday, updateMentorTaskStatus } from "../lib/api/mentor";
import { getNextBestAction, type NextBestAction } from "../lib/api/recommendations";
import { getBehaviorProfile, logBehavior, type BehaviorProfile } from "../lib/api/behavior";
import { subscribeToPushNotifications, getNotificationPermission } from "../lib/utils/push-notifications";
import { cn } from "../lib/utils/cn";
import type { MentorTask, MentorTodayPlan } from "@studybuddy/shared";

const taskIcons = {
  onboarding: GraduationCap,
  skill_gap: Target,
  roadmap: Route,
  learn: Brain,
  recall: Zap,
  note: NotebookText,
  project: ClipboardList,
  interview: MessageSquare,
  job: Briefcase,
  reflection: Sparkles
} as const;

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatStrength(value: number) {
  return `${Math.round(value * 100)}%`;
}

function priorityClass(priority: MentorTask["priority"]) {
  if (priority === "high") return "border-cyan/30 bg-cyan/10 text-cyan";
  if (priority === "medium") return "border-brand/30 bg-brand/10 text-brand";
  return "border-white/10 bg-white/[0.04] text-slate-300";
}

export function DashboardPage() {
  const [plan, setPlan] = useState<MentorTodayPlan | null>(null);
  const [bestAction, setBestAction] = useState<NextBestAction | null>(null);
  const [behavior, setBehavior] = useState<BehaviorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const [nextPlan, action, profile] = await Promise.all([
        getMentorToday(),
        getNextBestAction(),
        getBehaviorProfile()
      ]);
      setPlan(nextPlan);
      setBestAction(action);
      setBehavior(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mentor plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlan();
    
    // Check for push notification permission
    if (getNotificationPermission() === "default") {
      setShowPushPrompt(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const success = await subscribeToPushNotifications();
    if (success) setShowPushPrompt(false);
  };

  const completedTasks = useMemo(
    () => plan?.tasks.filter((task) => task.status === "completed").length ?? 0,
    [plan]
  );

  const completeTask = async (task: MentorTask) => {
    try {
      setUpdatingTaskId(task.id);
      const isCompleting = task.status !== "completed";
      const nextPlan = await updateMentorTaskStatus(
        task.id,
        isCompleting ? "completed" : "pending"
      );
      
      if (isCompleting) {
        await logBehavior("task_completed", { taskId: task.id, type: task.type });
      } else {
        await logBehavior("task_skipped", { taskId: task.id, type: task.type });
      }
      
      setPlan(nextPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading && !plan) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="animate-spin text-brand" size={20} />
          Loading AI Dost...
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {showPushPrompt && (
        <div 
          className="rounded-3xl border border-brand/20 bg-brand/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(124,92,255,0.1)] animate-in fade-in slide-in-from-top-4 duration-500"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center text-brand shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Enable Proactive Nudges</h3>
              <p className="text-sm text-slate-400">Let Veda AI alert you when you're falling behind or have knowledge about to fade.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowPushPrompt(false)}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-white/5 text-slate-400 text-sm font-bold hover:bg-white/10 transition"
            >
              Later
            </button>
            <button 
              onClick={handleEnableNotifications}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-brand text-white text-sm font-bold shadow-lg shadow-brand/20 hover:bg-brand/90 transition"
            >
              Enable Now
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {bestAction && (
        <div className="relative overflow-hidden rounded-xl border border-cyan/30 bg-gradient-to-r from-cyan/20 via-cyan/5 to-transparent p-6 shadow-[0_0_40px_-10px_rgba(34,211,238,0.15)]">
          <div className="flex items-start gap-4">
            <div className="flex shrink-0 items-center justify-center rounded-full bg-cyan/20 p-3 text-cyan">
              <Brain size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan/80">Veda AI Recommendation</p>
              <h2 className="mt-1 text-xl font-bold text-white">Your Next Best Action</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {bestAction.reason}
              </p>
              
              <div className="mt-4">
                {bestAction.action === "task" && bestAction.data && (
                  <button className="inline-flex items-center gap-2 rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan/90">
                    <Target size={16} />
                    Start: {bestAction.data.title || "Next Task"}
                  </button>
                )}
                {bestAction.action === "revision" && (
                  <Link to="/recall" className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-emerald-400">
                    <Zap size={16} />
                    Start Quick Revision
                  </Link>
                )}
                {bestAction.action === "generate" && (
                  <Link to="/roadmap" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90">
                    <Route size={16} />
                    Generate Next Roadmap
                  </Link>
                )}
                {bestAction.action === "recalibrate" && (
                  <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-400">
                    <RefreshCw size={16} />
                    Recalibrate Roadmap
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan">Today</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-white lg:text-4xl">
                {plan?.focus ?? "AI Dost mentor plan"}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                {plan?.mentorMessage ?? "Your daily mentor plan will appear here."}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4 rounded-lg border border-white/10 bg-obsidian/40 p-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-2xl font-semibold text-white">
                {plan?.readinessScore ?? 0}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Readiness</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{plan?.journeyStage ?? "setup"}</p>
                <p className="mt-3 text-xs text-cyan">Next: {plan?.nextUnlock ?? "Roadmap"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Notes" value={String(plan?.signals.totalNotes ?? 0)} icon={NotebookText} />
            <Metric label="Recall Due" value={String(plan?.signals.recallDue ?? 0)} icon={Zap} />
            <Metric label="Memory" value={formatStrength(plan?.signals.averageMemoryStrength ?? 0)} icon={Brain} />
            <Metric label="Roadmap" value={formatPercent(plan?.signals.roadmapProgress ?? 0)} icon={Route} />
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">SaaS Workspace</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                {plan?.subscription.plan ?? "free"} - {plan?.subscription.status ?? "trialing"}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <UsageRow
              label="AI messages"
              value={plan?.subscription.usage.aiMessagesThisMonth ?? 0}
              limit={plan?.subscription.limits.aiMessagesPerMonth ?? 100}
            />
            <UsageRow
              label="Notes tracked"
              value={plan?.subscription.usage.notesTracked ?? 0}
              limit={plan?.subscription.limits.notes ?? 250}
            />
            <UsageRow
              label="Mentor plans"
              value={plan?.subscription.usage.mentorPlansGenerated ?? 0}
              limit={30}
            />
          </div>

          <button
            type="button"
            onClick={() => void loadPlan()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            Refresh mentor plan
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Mission List</h2>
              <p className="mt-1 text-sm text-slate-400">
                {completedTasks}/{plan?.tasks.length ?? 0} complete
              </p>
            </div>
            <Link
              to="/copilot"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
            >
              Ask AI Dost
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {plan?.tasks.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-obsidian/30 p-6 text-sm text-slate-400">
                No mentor tasks yet.
              </div>
            ) : (
              plan?.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  updating={updatingTaskId === task.id}
                  onToggle={() => void completeTask(task)}
                />
              ))
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-semibold text-white">Weak Topics</h2>
            <div className="mt-4 space-y-3">
              {(plan?.signals.weakTopics ?? []).length === 0 ? (
                <p className="text-sm text-slate-400">No weak topics yet.</p>
              ) : (
                plan?.signals.weakTopics.slice(0, 4).map((topic) => (
                  <Link
                    key={topic.topic}
                    to="/recall"
                    className="block rounded-lg border border-white/10 bg-obsidian/30 p-4 hover:border-cyan/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{topic.topic}</p>
                      <span className="text-xs text-cyan">{formatStrength(topic.averageStrength)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{topic.dueCount} due</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-semibold text-white">Journey Signals</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Signal label="Consistency Score" value={behavior ? `${behavior.consistencyScore}%` : "0%"} />
              <Signal label="Skip Rate" value={behavior ? `${behavior.skipRate}%` : "0%"} />
              <Signal label="Target" value={plan?.signals.targetRoles.join(", ") || "Not set"} />
              <Signal label="Milestone" value={plan?.signals.activeMilestone || "No active milestone"} />
              <Signal label="Project" value={plan?.signals.activeProject || "No active project"} />
              <Signal label="Interview" value={plan?.signals.latestInterviewScore ? `${plan.signals.latestInterviewScore}/10` : "No score yet"} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Brain }) {
  return (
    <div className="rounded-lg border border-white/10 bg-obsidian/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <Icon size={16} className="text-cyan" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function UsageRow({ label, value, limit }: { label: string; value: number; limit: number }) {
  const percent = Math.min(100, Math.round((value / limit) * 100));

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{value}/{limit}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-cyan" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function TaskRow({ task, updating, onToggle }: { task: MentorTask; updating: boolean; onToggle: () => void }) {
  const Icon = taskIcons[task.type];
  const isDone = task.status === "completed";

  return (
    <div className={cn("rounded-lg border p-4 transition-colors", isDone ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/10 bg-obsidian/30")}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onToggle}
          className="mt-1 text-slate-400 hover:text-white"
          aria-label={isDone ? "Mark task pending" : "Mark task complete"}
        >
          {updating ? <Loader2 className="animate-spin" size={20} /> : isDone ? <CheckCircle2 className="text-emerald-300" size={20} /> : <Circle size={20} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold", priorityClass(task.priority))}>
              <Icon size={12} />
              {task.priority}
            </span>
            <span className="text-xs text-slate-500">{task.estimatedMinutes} min</span>
          </div>
          <h3 className={cn("mt-3 text-base font-semibold", isDone ? "text-slate-400 line-through" : "text-white")}>{task.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{task.description}</p>
          <p className="mt-2 text-xs text-cyan">{task.reason}</p>
        </div>
        <Link to={`/study/${task.id}`} className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white">
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-obsidian/30 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[180px] text-right text-slate-200">{value}</span>
    </div>
  );
}
