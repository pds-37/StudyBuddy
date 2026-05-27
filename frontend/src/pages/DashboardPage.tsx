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
  Zap,
  Flame,
  Activity,
  LineChart,
  Gauge,
  Layers,
  ChevronRight
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
  if (priority === "high") return "border-red-500/20 bg-red-500/10 text-red-400";
  if (priority === "medium") return "border-brand/30 bg-brand/10 text-brand-light";
  return "border-border bg-white/[0.02] text-text-secondary";
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
      <div className="flex min-h-[520px] flex-col items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
        <Loader2 className="animate-spin text-brand-light mb-4" size={32} />
        <p className="text-sm font-semibold tracking-wide text-text-secondary font-display">Synchronizing SDE Career Engine...</p>
      </div>
    );
  }

  return (
    <section className="space-y-8 animate-fade-in relative z-10">
      
      {/* Decorative background grids/haze */}
      <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-brand/3 blur-[180px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 h-[600px] w-[600px] rounded-full bg-accent/3 blur-[180px] pointer-events-none" />

      {showPushPrompt && (
        <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-[#0c0e12]/80 p-6 backdrop-blur-2xl shadow-glow animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-accent/5 opacity-40 pointer-events-none" />
          <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand-light shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse">
              <Zap size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Enable active notification nudges</h3>
              <p className="text-xs text-slate-400 mt-1">Let Veda alert you proactively before weak recall topics decay or streak fades.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto relative z-10 shrink-0">
            <button
              onClick={() => setShowPushPrompt(false)}
              className="w-full sm:w-auto rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Later
            </button>
            <button
              onClick={handleEnableNotifications}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-brand to-accent px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 shadow-premium transition-all"
            >
              Activate Now
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-200 backdrop-blur-md flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {isDemoMode && (
        <div className="relative overflow-hidden rounded-2xl border border-cyan/20 bg-[#07090d]/90 p-5 backdrop-blur-2xl shadow-glow">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 to-brand/5 opacity-55 pointer-events-none" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan/35 bg-cyan/15 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-light">
                <Flame size={12} className="animate-bounce" />
                Live Recruiter Demo Sandbox
              </div>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                You are viewing a placement-ready candidate simulation. Interact with simulated spaced repetition memory leaks, parallel roadmap gates, resume scores, and Veda's predictive cognitive engines.
              </p>
            </div>
            <Link to="/pricing" className="btn-primary shrink-0 inline-flex gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-cyan to-brand">
              Upgrade to Premium
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Veda Next Best Action (Redesigned with Ultra-Premium Glassmorphism & Cyber Border) */}
      {bestAction && bestAction.action !== "recalibrate" && (
        <div className="relative group overflow-hidden rounded-2xl border border-cyan/25 bg-gradient-to-br from-[#0c121e]/90 via-[#07090d]/95 to-[#0e071c]/90 p-1 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-cyan/40 hover:shadow-[0_20px_60px_rgba(6,182,212,0.15)]">
          
          {/* Neon Border Glow */}
          <div className="absolute -inset-px bg-gradient-to-r from-cyan via-brand to-accent opacity-15 rounded-2xl pointer-events-none transition-opacity duration-500 group-hover:opacity-25" />
          
          <div className="relative z-10 rounded-[15px] bg-[#07090d]/95 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cyan/20 bg-cyan/10 text-cyan shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-transform duration-300 group-hover:scale-105">
                <Brain size={28} className="animate-float" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-cyan-light font-mono">Cognitive Action Center</p>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Veda's Recommended Priority</h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300 max-w-3xl font-medium">
                  {bestAction.reason}
                </p>
              </div>
            </div>

            <div className="shrink-0 relative">
              {bestAction.action === "task" && (
                <button
                  type="button"
                  onClick={() => void startBestActionTask()}
                  disabled={updatingTaskId === (recommendedTask?.id ?? "next-best-action")}
                  className="w-full sm:w-auto relative group/btn inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan to-brand px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                >
                  {updatingTaskId === (recommendedTask?.id ?? "next-best-action") ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Target size={16} />
                  )}
                  {recommendedTask ? "Initiate Core Focus" : "Access Next Node"}
                  <ArrowRight size={14} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </button>
              )}
              {bestAction.action === "revision" && (
                <Link
                  to="/recall"
                  className="w-full sm:w-auto relative group/btn inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-brand to-accent px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_0_35px_rgba(99,102,241,0.55)] active:scale-[0.98]"
                >
                  <Zap size={16} />
                  Trigger Recall Protocol
                  <ArrowRight size={14} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              )}
              {bestAction.action === "generate" && (
                <Link
                  to="/roadmap"
                  className="w-full sm:w-auto relative group/btn inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan to-brand px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] active:scale-[0.98]"
                >
                  <Route size={16} />
                  Synthesize Roadmap
                  <ArrowRight size={14} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid: Main Dashboard Console */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        
        {/* Left Core Hub (Strategic Execution Block) */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07090d]/70 backdrop-blur-xl shadow-premium">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
          
          <div className="border-b border-white/[0.06] p-6 sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand-light shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-light font-mono">Mission Control</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Stage: {plan?.journeyStage ?? "Uninitialized"}</p>
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl font-display">
                  {plan?.focus ?? "Strategic Execution"}
                </h1>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-400 font-medium">
                  {plan?.mentorMessage ?? "Synchronizing your learning vectors with market-readiness signals."}
                </p>
              </div>

              {/* Advanced Cyber Readiness Gauges */}
              <div className="grid min-w-[280px] grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.5)] shrink-0">
                <div className="bg-[#0b0f17] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Job Readiness</p>
                    <Gauge size={14} className="text-brand-light" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white font-display tracking-tight">{plan?.readinessScore ?? 0}</span>
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand to-accent rounded-full" style={{ width: `${plan?.readinessScore ?? 0}%` }} />
                  </div>
                </div>

                <div className="bg-[#0b0f17] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Daily Progress</p>
                    <Activity size={14} className="text-emerald-400" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white font-display tracking-tight">{planProgress}</span>
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${planProgress}%` }} />
                  </div>
                </div>

                <div className="col-span-2 bg-[#080b12] p-4 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Next Milestone Gate:</span>
                  <span className="text-[10px] font-black text-brand-light uppercase tracking-widest font-mono bg-brand/10 border border-brand/20 rounded-md px-2 py-0.5 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                    {plan?.nextUnlock ?? "Core Logic"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Target Task Pane (Glassmorphic) */}
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-light font-mono">Active Placement Focus</p>
                </div>
                <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-white font-display leading-snug">{activeTask?.title ?? "Awaiting Path Synthesis"}</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-400 font-medium">
                  {activeTask?.reason ?? "Initialize your parameters in settings or onboarding, and Veda will compile your strategic tasks."}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {activeTask ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void startTask(activeTask)}
                      disabled={updatingTaskId === activeTask.id}
                      className="w-full sm:w-auto relative group/btn inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-950 px-6 py-3.5 text-xs font-black uppercase tracking-widest shadow-premium hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {updatingTaskId === activeTask.id ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
                      Initiate Focus
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleStuck(activeTask)}
                      disabled={stuckTaskId === activeTask.id}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/20 px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {stuckTaskId === activeTask.id ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                      I'm Stuck
                    </button>
                  </>
                ) : (
                  <Link to="/onboarding" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-accent text-white px-6 py-3.5 text-xs font-black uppercase tracking-widest shadow-premium hover:brightness-110 transition-all">
                    Configure Veda
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>

            {/* Cognitive Signals Panel */}
            <div className="grid grid-cols-2 gap-px border-t border-white/[0.08] bg-white/[0.08] lg:border-l lg:border-t-0 shadow-inner">
              <Metric label="Obsidian Notes" value={String(plan?.signals.totalNotes ?? 0)} icon={NotebookText} color="text-brand-light" />
              <Metric label="Due Recall" value={String(plan?.signals.recallDue ?? 0)} icon={Zap} color="text-amber-400" />
              <Metric label="Memory Strength" value={formatStrength(plan?.signals.averageMemoryStrength ?? 0)} icon={Brain} color="text-cyan" />
              <Metric label="Roadmap Index" value={formatPercent(plan?.signals.roadmapProgress ?? 0)} icon={Route} color="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Right Core Hub: SaaS Workspace Meter */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07090d]/70 p-6 backdrop-blur-xl shadow-premium flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
          
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan font-mono">Workspace Status</p>
                <h3 className="mt-1 text-lg font-bold text-white font-display">
                  {plan?.subscription.plan.toUpperCase() ?? "FREE PROTOCOL"}
                </h3>
              </div>
              <div className="rounded-xl border border-brand/20 bg-brand/10 p-2.5 text-brand shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <UsageRow
                label="AI Core Messages"
                value={plan?.subscription.usage.aiMessagesThisMonth ?? 0}
                limit={plan?.subscription.limits.aiMessagesPerMonth ?? 100}
                color="from-cyan to-brand"
              />
              <UsageRow
                label="Obsidian Notes Synced"
                value={plan?.subscription.usage.notesTracked ?? 0}
                limit={plan?.subscription.limits.notes ?? 250}
                color="from-brand to-accent"
              />
              <UsageRow
                label="Curriculums Compiled"
                value={plan?.subscription.usage.mentorPlansGenerated ?? 0}
                limit={30}
                color="from-accent to-pink-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadPlan()}
            className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 text-slate-300 hover:text-white px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]"
          >
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
            Sync SDE Parameters
          </button>
        </div>
      </div>

      {/* Second Row Grid: Mission Queue & Sidebar Signals */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        
        {/* Mission Queue Console */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07090d]/70 p-6 backdrop-blur-xl shadow-premium">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-brand-light" />
                <h2 className="text-xl font-bold font-display text-white">Placement Mission Queue</h2>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-500 font-mono uppercase tracking-wide">
                SYSTEM SYNCHRONIZED: {completedTasks}/{plan?.tasks.length ?? 0} COMPLETE
              </p>
            </div>
            <Link
              to="/copilot"
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand/20 bg-brand/10 hover:bg-brand/20 text-brand-light hover:text-white px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all"
            >
              Consult Veda AI
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {plan?.tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center text-sm text-slate-500">
                Placement queue is currently empty.
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

        {/* Sidebar Diagnostics */}
        <aside className="space-y-6">
          
          {/* Active Memory Leaks (Redesigned Weak Topics) */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07090d]/70 p-6 backdrop-blur-xl shadow-premium">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-amber-400 animate-pulse" />
              <h2 className="text-lg font-bold font-display text-white">Active Memory Leaks</h2>
            </div>
            <div className="space-y-3">
              {(plan?.signals.weakTopics ?? []).length === 0 ? (
                <p className="text-xs text-slate-500 font-mono uppercase">System Stable: 0 Decay Detected</p>
              ) : (
                plan?.signals.weakTopics.slice(0, 4).map((topic) => (
                  <Link
                    key={topic.topic}
                    to="/recall"
                    className="group block rounded-xl border border-white/[0.05] bg-[#0c0e12]/60 p-4 transition-all duration-300 hover:border-brand/35 hover:bg-[#0c0e12]/90 hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-white group-hover:text-brand-light transition-colors">{topic.topic}</p>
                      <span className="text-xs font-extrabold text-brand-light font-mono bg-brand/10 border border-brand/20 px-2 py-0.5 rounded">
                        {formatStrength(topic.averageStrength)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Decay factor detected</span>
                      <span className="text-amber-400 font-bold">{topic.dueCount} cards due</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* SDE Candidate Diagnostics */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07090d]/70 p-6 backdrop-blur-xl shadow-premium">
            <div className="flex items-center gap-2 mb-4">
              <LineChart size={16} className="text-cyan" />
              <h2 className="text-lg font-bold font-display text-white">Diagnostics Console</h2>
            </div>
            <div className="space-y-3.5 text-xs">
              <Signal label="Consistent Streak" value={behavior ? `${behavior.consistencyScore}% consistency` : "0%"} />
              <Signal label="Roadmap Skip Rate" value={behavior ? `${behavior.skipRate}%` : "0%"} />
              <Signal label="Target Role Vector" value={plan?.signals.targetRoles.join(", ") || "Not Configured"} />
              <Signal label="Active Gate" value={plan?.signals.activeMilestone || "Awaiting Gates"} />
              <Signal label="Proof Project" value={plan?.signals.activeProject || "No active project"} />
              <Signal label="Interview Score" value={plan?.signals.latestInterviewScore ? `${plan.signals.latestInterviewScore} / 10.0` : "Unscheduled"} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  color
}: {
  label: string;
  value: string;
  icon: typeof Brain;
  color: string;
}) {
  return (
    <div className="bg-[#0b0f17] p-5 flex flex-col justify-between group transition-colors hover:bg-[#0f1522]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono leading-none">{label}</p>
        <Icon size={14} className={cn("transition-transform duration-300 group-hover:scale-110", color)} />
      </div>
      <p className="mt-4 text-2xl font-black text-white font-display tracking-tight leading-none">{value}</p>
    </div>
  );
}

function UsageRow({
  label,
  value,
  limit,
  color
}: {
  label: string;
  value: number;
  limit: number;
  color: string;
}) {
  const percent = Math.min(100, Math.round((value / limit) * 100));

  return (
    <div className="group">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
        <span className="text-white font-mono">{value} / {limit}</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/5 border border-white/[0.02]">
        <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", color)} style={{ width: `${percent}%` }} />
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
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5 transition-all duration-300 relative group/row overflow-hidden",
        isDone
          ? "border-emerald-500/10 bg-emerald-500/[0.02]"
          : task.status === "in_progress"
            ? "border-brand/30 bg-brand/[0.03] shadow-[inset_0_0_0_1px_rgba(99,102,241,0.1)]"
            : "border-white/[0.06] bg-[#0c0e12]/50 hover:border-white/[0.12] hover:bg-[#0c0e12]/80"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggle}
          disabled={updating}
          className="mt-1 text-slate-500 hover:text-white shrink-0 transition-colors outline-none focus:outline-none"
          aria-label={isDone ? "Mark task pending" : "Mark task complete"}
        >
          {updating ? (
            <Loader2 className="animate-spin text-brand-light" size={20} />
          ) : isDone ? (
            <CheckCircle2 className="text-emerald-400 fill-emerald-500/10" size={20} />
          ) : (
            <Circle className="text-slate-600 hover:text-brand" size={20} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider font-mono", priorityClass(task.priority))}>
              <Icon size={11} />
              {task.priority}
            </span>
            <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-400 font-semibold font-mono uppercase">
              {task.status.replace("_", " ")}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{task.estimatedMinutes} min</span>
            {(task.stuckCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black text-amber-300 font-mono uppercase">
                <AlertTriangle size={11} />
                {task.stuckCount} stuck block
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className={cn("mt-3.5 text-base sm:text-lg font-bold font-display tracking-tight transition-colors", isDone ? "text-slate-500 line-through" : "text-white")}>
            {task.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-400 font-medium">
            {task.description}
          </p>
          <p className="mt-2 text-xs text-brand-light font-medium flex items-center gap-1.5">
            <Sparkles size={12} className="text-brand shrink-0" />
            {task.reason}
          </p>

          {/* Mentor Note */}
          {task.mentorNote && (
            <div className="mt-4 rounded-xl border border-white/[0.05] bg-white/[0.01] px-4 py-3 text-xs leading-relaxed text-slate-400 flex items-start gap-2.5">
              <MessageSquare size={14} className="text-cyan shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-300">Veda Mentor Note:</span> {task.mentorNote}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onStart}
              disabled={updating || isDone}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? <Loader2 size={13} className="animate-spin" /> : <PlayCircle size={13} />}
              Initiate Node
            </button>
            <button
              type="button"
              onClick={onStuck}
              disabled={stucking || isDone}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/20 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stucking ? <Loader2 size={13} className="animate-spin" /> : <AlertTriangle size={13} />}
              Signal Block
            </button>
          </div>
        </div>

        {/* Go to Node details Link */}
        <Link
          to={`/study/${task.id}`}
          className="shrink-0 rounded-xl border border-white/10 p-2.5 text-slate-500 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover/row:opacity-100 hover:scale-105"
        >
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.04] bg-[#0c0e12]/40 px-3 py-2.5 transition-colors hover:border-white/[0.08]">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="max-w-[190px] text-right font-bold text-white truncate font-mono">{value}</span>
    </div>
  );
}
