import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  AlertTriangle,
  Brain,
  Briefcase,
  CheckCircle2,
  Circle,
  ClipboardList,
  GraduationCap,
  Loader2,
  MessageSquare,
  NotebookText,
  PlayCircle,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { getMentorToday, recordMentorTaskFeedback, updateMentorTaskStatus } from "../lib/api/mentor";
import { getNextBestAction, type NextBestAction } from "../lib/api/recommendations";
import { getBehaviorProfile, logBehavior, type BehaviorProfile } from "../lib/api/behavior";
import { subscribeToPushNotifications, getNotificationPermission } from "../lib/utils/push-notifications";
import { cn } from "../lib/utils/cn";
import { useCopilotStore } from "../store/copilot-store";
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
  return "border-slate-200 dark:border-slate-200 dark:border-white/10 bg-white/[0.04] text-slate-700 dark:text-slate-700 dark:text-slate-300";
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<MentorTodayPlan | null>(null);
  const [bestAction, setBestAction] = useState<NextBestAction | null>(null);
  const [behavior, setBehavior] = useState<BehaviorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [stuckTaskId, setStuckTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setIsWidgetOpen = useCopilotStore((state) => state.setIsWidgetOpen);
  const sendMessage = useCopilotStore((state) => state.sendMessage);

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
  const activeTask = useMemo(
    () => plan?.tasks.find((task) => task.status === "in_progress") ?? plan?.tasks.find((task) => task.status !== "completed"),
    [plan]
  );
  const planProgress = plan?.tasks.length ? Math.round((completedTasks / plan.tasks.length) * 100) : 0;

  const startTask = async (task: MentorTask) => {
    try {
      setUpdatingTaskId(task.id);
      const nextPlan = await recordMentorTaskFeedback(task.id, { type: "start" });
      await logBehavior("task_started", { taskId: task.id, type: task.type }).catch(() => undefined);
      setPlan(nextPlan);
      navigate(`/study/${task.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start task");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleStuck = async (task: MentorTask) => {
    try {
      setStuckTaskId(task.id);
      const note = `I am stuck on "${task.title}". Break it into the smallest next step and explain what I should do first.`;
      const nextPlan = await recordMentorTaskFeedback(task.id, { type: "stuck", note });
      await logBehavior("task_stuck", { taskId: task.id, type: task.type }).catch(() => undefined);
      setPlan(nextPlan);
      setIsWidgetOpen(true);
      void sendMessage(note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to capture stuck signal");
    } finally {
      setStuckTaskId(null);
    }
  };

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
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-700 dark:text-slate-300">
          <Loader2 className="animate-spin text-brand" size={20} />
          Loading AI Dost...
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-12">

      {showPushPrompt && (
        <div 
          className="rounded-3xl border border-brand/20 bg-brand/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(124,92,255,0.1)] animate-in fade-in slide-in-from-top-4 duration-500"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center text-brand shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-white">Enable Proactive Nudges</h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 dark:text-slate-400">Let Veda AI alert you when you're falling behind or have knowledge about to fade.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowPushPrompt(false)}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-100 dark:bg-slate-100 dark:bg-white/10 transition"
            >
              Later
            </button>
            <button 
              onClick={handleEnableNotifications}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-brand text-slate-900 dark:text-slate-900 dark:text-white text-sm font-bold shadow-lg shadow-brand/20 hover:bg-brand/90 transition"
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
        <div className="group relative overflow-hidden rounded-[2rem] border border-cyan/20 bg-[#0c1017] p-8 shadow-[0_0_80px_-20px_rgba(34,211,238,0.2)] transition-all hover:border-cyan/40">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-transparent opacity-50" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="flex shrink-0 items-center justify-center rounded-2xl bg-cyan/10 p-4 text-cyan shadow-[0_0_30px_rgba(34,211,238,0.1)] group-hover:scale-110 transition-transform duration-500">
                <Brain size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan/80">Veda Intelligence Insight</p>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Your Next Best Action</h2>
                <p className="mt-3 text-base leading-relaxed text-slate-400 max-w-2xl">
                  {bestAction.reason}
                </p>
              </div>
            </div>
            
            <div className="shrink-0">
              {bestAction.action === "task" && bestAction.data && (
                <button className="group/btn relative inline-flex items-center gap-3 rounded-2xl bg-cyan px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(34,211,238,0.2)]">
                  <Target size={18} />
                  Start: {bestAction.data.title || "Next Task"}
                  <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </button>
              )}
              {bestAction.action === "revision" && (
                <Link to="/recall" className="group/btn relative inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
                  <Zap size={18} />
                  Start Quick Revision
                  <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              )}
              {bestAction.action === "generate" && (
                <Link to="/roadmap" className="group/btn relative inline-flex items-center gap-3 rounded-2xl bg-brand px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(124,92,255,0.2)]">
                  <Route size={18} />
                  Generate Roadmap
                  <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              )}
              {bestAction.action === "recalibrate" && (
                <Link to="/onboarding" className="group/btn relative inline-flex items-center gap-3 rounded-2xl bg-amber-500 px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(245,158,11,0.2)]">
                  <RefreshCw size={18} />
                  Recalibrate Path
                  <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1017]">
          <div className="border-b border-white/[0.06] px-8 py-10">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-cyan">Veda Command Center</p>
                </div>
                <h1 className="text-4xl font-black leading-[1.1] text-white lg:text-6xl tracking-tight">
                  {plan?.focus ?? "Strategic Execution"}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
                  {plan?.mentorMessage ?? "Synchronizing your goals with active intelligence."}
                </p>
              </div>

              <div className="grid min-w-[280px] grid-cols-2 gap-px rounded-2xl border border-white/[0.08] bg-white/[0.06] overflow-hidden">
                <div className="bg-[#0c1017] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Readiness</p>
                  <p className="mt-2 text-4xl font-black text-white">{plan?.readinessScore ?? 0}<span className="text-sm font-normal text-slate-600 ml-1">%</span></p>
                </div>
                <div className="bg-[#0c1017] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Plan Velocity</p>
                  <p className="mt-2 text-4xl font-black text-white">{planProgress}<span className="text-sm font-normal text-slate-600 ml-1">%</span></p>
                </div>
                <div className="col-span-2 bg-[#0c1017] px-5 pb-5">
                   <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06] mb-3">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand to-cyan transition-all duration-1000" style={{ width: `${planProgress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Next Milestone: <span className="text-cyan">{plan?.nextUnlock ?? "Core Logic"}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Current Focus</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{activeTask?.title ?? "No active task yet"}</h2>
                </div>
                <span className="rounded-full border border-white/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {plan?.journeyStage ?? "setup"}
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                {activeTask?.reason ?? "Complete onboarding and Veda will turn your goals into a focused execution path."}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {activeTask ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void startTask(activeTask)}
                      disabled={updatingTaskId === activeTask.id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-wait disabled:opacity-70"
                    >
                      {updatingTaskId === activeTask.id ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                      Start Focus
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleStuck(activeTask)}
                      disabled={stuckTaskId === activeTask.id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.05] disabled:cursor-wait disabled:opacity-70"
                    >
                      {stuckTaskId === activeTask.id ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                      I'm Stuck
                    </button>
                  </>
                ) : (
                  <Link to="/onboarding" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90">
                    Configure Mentor
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px border-t border-white/[0.06] bg-white/[0.06] lg:border-l lg:border-t-0">
              <Metric label="Notes" value={String(plan?.signals.totalNotes ?? 0)} icon={NotebookText} />
              <Metric label="Recall" value={String(plan?.signals.recallDue ?? 0)} icon={Zap} />
              <Metric label="Memory" value={formatStrength(plan?.signals.averageMemoryStrength ?? 0)} icon={Brain} />
              <Metric label="Roadmap" value={formatPercent(plan?.signals.roadmapProgress ?? 0)} icon={Route} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1017] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-900 dark:text-white">SaaS Workspace</p>
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
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-50 dark:bg-slate-50 dark:bg-white/5"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            Refresh mentor plan
          </button>
        </div>
      </div>

      <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1017] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Mission Queue</h2>
              <p className="mt-1 text-sm text-slate-500">
                {completedTasks}/{plan?.tasks.length ?? 0} complete
              </p>
            </div>
            <Link
              to="/copilot"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.05]"
            >
              Ask Veda
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {plan?.tasks.length === 0 ? (
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 text-sm text-slate-400">
                No mentor tasks yet.
              </div>
            ) : (
              plan?.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  updating={updatingTaskId === task.id}
                  stucking={stuckTaskId === task.id}
                  onToggle={() => void completeTask(task)}
                  onStart={() => void startTask(task)}
                  onStuck={() => void handleStuck(task)}
                />
              ))
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1017] p-6">
            <h2 className="text-lg font-semibold text-white">Weak Topics</h2>
            <div className="mt-4 space-y-3">
              {(plan?.signals.weakTopics ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No weak topics yet.</p>
              ) : (
                plan?.signals.weakTopics.slice(0, 4).map((topic) => (
                  <Link
                    key={topic.topic}
                    to="/recall"
                    className="block rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
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

          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1017] p-6">
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
    <div className="bg-[#0c1017] p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <Icon size={15} className="text-cyan/70" />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function UsageRow({ label, value, limit }: { label: string; value: number; limit: number }) {
  const percent = Math.min(100, Math.round((value / limit) * 100));

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-slate-700 dark:text-slate-700 dark:text-slate-300">{value}/{limit}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-cyan" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function TaskRow({
  task,
  updating,
  stucking,
  onToggle,
  onStart,
  onStuck
}: {
  task: MentorTask;
  updating: boolean;
  stucking: boolean;
  onToggle: () => void;
  onStart: () => void;
  onStuck: () => void;
}) {
  const Icon = taskIcons[task.type];
  const isDone = task.status === "completed";

  return (
    <div className={cn("rounded-xl border p-4 transition-colors", isDone ? "border-emerald-500/20 bg-emerald-500/5" : task.status === "in_progress" ? "border-brand/30 bg-brand/10" : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.045]")}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onToggle}
          className="mt-1 text-slate-500 hover:text-white"
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
            <span className="rounded-md border border-white/[0.08] px-2 py-1 text-xs text-slate-500">{task.status.replace("_", " ")}</span>
            <span className="text-xs text-slate-500">{task.estimatedMinutes} min</span>
            {(task.stuckCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-300">
                <AlertTriangle size={12} />
                {task.stuckCount} stuck
              </span>
            )}
          </div>
          <h3 className={cn("mt-3 text-base font-semibold", isDone ? "text-slate-500 line-through" : "text-white")}>{task.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{task.description}</p>
          <p className="mt-2 text-xs text-cyan">{task.reason}</p>
          {task.mentorNote && (
            <p className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs leading-5 text-slate-400">
              {task.mentorNote}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStart}
              disabled={updating || isDone}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
              Start
            </button>
            <button
              type="button"
              onClick={onStuck}
              disabled={stucking || isDone}
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {stucking ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
              Stuck
            </button>
          </div>
        </div>
        <Link to={`/study/${task.id}`} className="shrink-0 rounded-lg border border-white/[0.08] p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-white">
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[180px] text-right text-slate-200">{value}</span>
    </div>
  );
}
