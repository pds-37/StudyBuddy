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
import { getNextBestAction, type NextBestAction, type RecommendedTaskData } from "../lib/api/recommendations";
import { getBehaviorProfile, logBehavior, type BehaviorProfile } from "../lib/api/behavior";
import { subscribeToPushNotifications, getNotificationPermission } from "../lib/utils/push-notifications";
import { cn } from "../lib/utils/cn";
import { useCopilotStore } from "../store/copilot-store";
import { useAppStore } from "../store/app-store";
import { demoBehaviorProfile, demoNextBestAction, demoTodayPlan } from "../lib/demo/student-demo";
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
  return "border-border bg-surface text-text-secondary";
}

function normalizeMatchValue(value?: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

function recommendedTaskId(data: RecommendedTaskData | null) {
  return data?.id ?? data?._id ?? null;
}

function recommendedTaskRoute(data: RecommendedTaskData | null) {
  if (data?.href) return data.href;

  if (data?.type === "recall" || data?.type === "revision" || data?.type === "quiz") {
    return "/recall";
  }

  if (data?.type === "project") {
    return "/projects";
  }

  if (data?.type === "note") {
    return "/notes";
  }

  if (data?.type === "interview") {
    return "/interview";
  }

  if (data?.type === "job") {
    return "/jobs";
  }

  if (data?.type === "onboarding") {
    return "/onboarding";
  }

  return "/roadmap";
}

function findRecommendedTask(plan: MentorTodayPlan | null, data: RecommendedTaskData | null) {
  if (!plan || !data) return null;

  const id = recommendedTaskId(data);
  if (id) {
    const idMatch = plan.tasks.find((task) => task.id === id);
    if (idMatch) return idMatch;
  }

  const title = normalizeMatchValue(data.title);
  if (title) {
    const titleMatch = plan.tasks.find((task) => normalizeMatchValue(task.title) === title);
    if (titleMatch) return titleMatch;
  }

  return null;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const isDemoMode = useAppStore((state) => state.isDemoMode);
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
    if (isDemoMode) {
      setPlan(demoTodayPlan);
      setBestAction(demoNextBestAction);
      setBehavior(demoBehaviorProfile);
      setLoading(false);
      setError(null);
      return;
    }

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
  }, [isDemoMode]);

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
  const recommendedTask = useMemo(() => {
    if (bestAction?.action !== "task") return null;
    return findRecommendedTask(plan, bestAction.data) ?? (bestAction.data ? null : activeTask ?? null);
  }, [activeTask, bestAction, plan]);

  const startTask = async (task: MentorTask) => {
    if (isDemoMode) {
      setPlan((current) => current ? {
        ...current,
        tasks: current.tasks.map((item) => item.id === task.id ? { ...item, status: "in_progress" } : item)
      } : current);
      navigate(task.href);
      return;
    }

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

  const startBestActionTask = async () => {
    if (bestAction?.action !== "task") return;

    if (recommendedTask) {
      await startTask(recommendedTask);
      return;
    }

    const route = recommendedTaskRoute(bestAction.data);

    if (isDemoMode) {
      navigate(route);
      return;
    }

    try {
      setUpdatingTaskId("next-best-action");
      await logBehavior("task_started", {
        taskId: recommendedTaskId(bestAction.data),
        title: bestAction.data?.title,
        type: bestAction.data?.type,
        source: "next_best_action"
      }).catch(() => undefined);
      navigate(route);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open recommended task");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleStuck = async (task: MentorTask) => {
    if (isDemoMode) {
      const note = `I am stuck on "${task.title}". Break it into the smallest next step and explain what I should do first.`;
      setIsWidgetOpen(true);
      void sendMessage(note);
      setPlan((current) => current ? {
        ...current,
        tasks: current.tasks.map((item) => item.id === task.id ? { ...item, stuckCount: (item.stuckCount ?? 0) + 1, mentorNote: "Demo signal captured: Veda would now break this into a smaller step." } : item)
      } : current);
      return;
    }

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
    if (isDemoMode) {
      const nextStatus = task.status === "completed" ? "pending" : "completed";
      setPlan((current) => current ? {
        ...current,
        tasks: current.tasks.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item)
      } : current);
      return;
    }

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
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 className="animate-spin text-brand" size={20} />
          Loading your placement plan...
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8 animate-fade-in">

      {showPushPrompt && (
        <div className="cognitive-card flex flex-col items-center justify-between gap-5 p-5 animate-in fade-in slide-in-from-top-4 duration-500 sm:flex-row">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Enable proactive nudges</h3>
              <p className="text-sm text-text-secondary">Let Veda alert you when you're falling behind or have knowledge about to fade.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowPushPrompt(false)}
              className="btn-secondary flex-1 sm:flex-none py-2.5"
            >
              Later
            </button>
            <button
              onClick={handleEnableNotifications}
              className="btn-primary flex-1 sm:flex-none py-2.5"
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

      {isDemoMode && (
        <div className="rounded-xl border border-brand/20 bg-brand/[0.05] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand">Recruiter demo workspace</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                This seeded profile shows the full USP loop: memory signals, roadmap progress, project proof, resume readiness, interview prep, and Veda's next best action.
              </p>
            </div>
            <Link to="/pricing" className="btn-primary inline-flex gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest">
              View SaaS plans
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {bestAction && (
        <div className="cognitive-card group relative overflow-hidden p-6 transition-all">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="flex shrink-0 items-center justify-center rounded-lg border border-cyan/20 bg-cyan/10 p-3 text-cyan transition-transform duration-300 group-hover:scale-105">
                <Brain size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan/80">Veda next best action</p>
                </div>
                <h2 className="text-2xl font-semibold text-text-primary">Do this first today</h2>
                <p className="mt-3 text-base leading-relaxed text-text-secondary max-w-2xl">
                  {bestAction.reason}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {bestAction.action === "task" && (
                <button
                  type="button"
                  onClick={() => void startBestActionTask()}
                  disabled={updatingTaskId === (recommendedTask?.id ?? "next-best-action")}
                  className="group/btn relative inline-flex items-center gap-3 rounded-lg bg-cyan px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                >
                  {updatingTaskId === (recommendedTask?.id ?? "next-best-action") ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />}
                  {recommendedTask ? "Start task" : "Open next step"}
                  <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </button>
              )}
              {bestAction.action === "revision" && (
                <Link to="/recall" className="group/btn relative inline-flex items-center gap-3 rounded-lg bg-brand px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]">
                  <Zap size={18} />
                  Start recall block
                  <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              )}
              {bestAction.action === "generate" && (
                <Link to="/roadmap" className="btn-primary group/btn relative inline-flex items-center gap-3">
                  <Route size={18} />
                  Generate roadmap
                  <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              )}
              {bestAction.action === "recalibrate" && (
                <Link to="/onboarding" className="group/btn relative inline-flex items-center gap-3 rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:brightness-110 active:scale-[0.98]">
                  <RefreshCw size={18} />
                  Recalibrate path
                  <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="cognitive-card p-0 overflow-hidden">
          <div className="border-b border-border px-6 py-8">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-brand">Today</p>
                </div>
                <h1 className="text-3xl font-semibold leading-[1.1] text-text-primary lg:text-5xl">
                  {plan?.focus ?? "Strategic Execution"}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary">
                  {plan?.mentorMessage ?? "Synchronizing your goals with active intelligence."}
                </p>
              </div>

              <div className="grid min-w-[280px] grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
                <div className="bg-background p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Placement readiness</p>
                  <p className="mt-2 text-4xl font-black text-text-primary">{plan?.readinessScore ?? 0}<span className="text-sm font-normal text-text-muted ml-1">%</span></p>
                </div>
                <div className="bg-background p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Today's progress</p>
                  <p className="mt-2 text-4xl font-black text-text-primary">{planProgress}<span className="text-sm font-normal text-text-muted ml-1">%</span></p>
                </div>
                <div className="col-span-2 bg-background px-5 pb-5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface mb-3">
                    <div className="h-full rounded-full bg-brand transition-all duration-1000" style={{ width: `${planProgress}%` }} />
                  </div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">Next unlock: <span className="text-brand-light">{plan?.nextUnlock ?? "Core Logic"}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Priority task</p>
                  <h2 className="mt-2 text-xl font-semibold text-text-primary">{activeTask?.title ?? "No active task yet"}</h2>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                  {plan?.journeyStage ?? "setup"}
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
                {activeTask?.reason ?? "Complete onboarding and Veda will turn your goals into a focused execution path."}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {activeTask ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void startTask(activeTask)}
                      disabled={updatingTaskId === activeTask.id}
                      className="btn-primary"
                    >
                      {updatingTaskId === activeTask.id ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                      Start Focus
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleStuck(activeTask)}
                      disabled={stuckTaskId === activeTask.id}
                      className="btn-secondary"
                    >
                      {stuckTaskId === activeTask.id ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                      I'm Stuck
                    </button>
                  </>
                ) : (
                  <Link to="/onboarding" className="btn-primary">
                    Configure Mentor
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:border-l lg:border-t-0">
              <Metric label="Notes" value={String(plan?.signals.totalNotes ?? 0)} icon={NotebookText} />
              <Metric label="Recall" value={String(plan?.signals.recallDue ?? 0)} icon={Zap} />
              <Metric label="Memory" value={formatStrength(plan?.signals.averageMemoryStrength ?? 0)} icon={Brain} />
              <Metric label="Roadmap" value={formatPercent(plan?.signals.roadmapProgress ?? 0)} icon={Route} />
            </div>
          </div>
        </div>

        <div className="cognitive-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">SaaS Workspace</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-text-muted">
                {plan?.subscription.plan ?? "free"} - {plan?.subscription.status ?? "trialing"}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
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
            className="mt-6 w-full btn-secondary"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            Refresh mentor plan
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="cognitive-card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Mission Queue</h2>
              <p className="mt-1 text-sm text-text-muted">
                {completedTasks}/{plan?.tasks.length ?? 0} complete
              </p>
            </div>
            <Link
              to="/copilot"
              className="btn-secondary py-2 px-4"
            >
              Ask Veda
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {plan?.tasks.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface p-5 text-sm text-text-secondary">
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
          <div className="cognitive-card p-6">
            <h2 className="text-lg font-semibold text-text-primary">Weak Topics</h2>
            <div className="mt-4 space-y-3">
              {(plan?.signals.weakTopics ?? []).length === 0 ? (
                <p className="text-sm text-text-muted">No weak topics yet.</p>
              ) : (
                plan?.signals.weakTopics.slice(0, 4).map((topic) => (
                  <Link
                    key={topic.topic}
                    to="/recall"
                    className="block rounded-lg border border-border bg-background-secondary p-4 transition hover:bg-surface"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-text-primary">{topic.topic}</p>
                      <span className="text-xs text-brand-light">{formatStrength(topic.averageStrength)}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">{topic.dueCount} due</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="cognitive-card p-6">
            <h2 className="text-lg font-semibold text-text-primary">Journey Signals</h2>
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
    <div className="bg-background-secondary p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{label}</p>
        <Icon size={15} className="text-brand/80" />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
    </div>
  );
}

function UsageRow({ label, value, limit }: { label: string; value: number; limit: number }) {
  const percent = Math.min(100, Math.round((value / limit) * 100));

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary">{value}/{limit}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
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
    <div className={cn("rounded-lg border p-4 transition-colors", isDone ? "border-emerald-500/20 bg-emerald-500/5" : task.status === "in_progress" ? "border-brand/25 bg-brand/[0.075]" : "border-border bg-background-secondary hover:bg-surface")}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onToggle}
          className="mt-1 text-text-muted hover:text-text-primary transition-colors"
          aria-label={isDone ? "Mark task pending" : "Mark task complete"}
        >
          {updating ? <Loader2 className="animate-spin" size={20} /> : isDone ? <CheckCircle2 className="text-emerald-400" size={20} /> : <Circle size={20} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold", priorityClass(task.priority))}>
              <Icon size={12} />
              {task.priority}
            </span>
            <span className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-secondary">{task.status.replace("_", " ")}</span>
            <span className="text-xs text-text-muted">{task.estimatedMinutes} min</span>
            {(task.stuckCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-300">
                <AlertTriangle size={12} />
                {task.stuckCount} stuck
              </span>
            )}
          </div>
          <h3 className={cn("mt-3 text-base font-semibold", isDone ? "text-text-muted line-through" : "text-text-primary")}>{task.title}</h3>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{task.description}</p>
          <p className="mt-2 text-xs text-brand-light">{task.reason}</p>
          {task.mentorNote && (
            <p className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs leading-5 text-text-secondary">
              {task.mentorNote}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStart}
              disabled={updating || isDone}
              className="inline-flex items-center gap-2 rounded-lg bg-text-primary text-background px-4 py-2 text-xs font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
              Start
            </button>
            <button
              type="button"
              onClick={onStuck}
              disabled={stucking || isDone}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-secondary transition hover:bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {stucking ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
              Stuck
            </button>
          </div>
        </div>
        <Link to={`/study/${task.id}`} className="shrink-0 rounded-lg border border-border p-2 text-text-muted transition hover:bg-surface hover:text-text-primary">
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background-secondary px-3 py-2">
      <span className="text-text-secondary">{label}</span>
      <span className="max-w-[180px] text-right text-text-primary">{value}</span>
    </div>
  );
}
