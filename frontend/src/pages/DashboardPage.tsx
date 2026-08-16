import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
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
  PlayCircle,
  RefreshCw,
  Route,
  Sparkles,
  Target,
  Zap,
  Layers,
} from "lucide-react";
import { getMentorToday, updateMentorTaskStatus } from "../lib/api/mentor";
import { logBehavior } from "../lib/api/behavior";
import { cn } from "../lib/utils/cn";
import { useAppStore } from "../store/app-store";
import { demoTodayPlan } from "../lib/demo/student-demo";
import type { MentorTask, MentorTodayPlan } from "@studybuddy/shared";

// Helper functions
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

function priorityClass(priority: MentorTask["priority"]) {
  if (priority === "high") return "border-red-500/20 bg-red-500/10 text-red-400";
  if (priority === "medium") return "border-brand/30 bg-brand/10 text-brand-light";
  return "border-border bg-white/[0.02] text-text-secondary";
}

export function DashboardPage() {
  const navigate = useNavigate();
  const isDemoMode = useAppStore((state) => state.isDemoMode);
  const [plan, setPlan] = useState<MentorTodayPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = async () => {
    if (isDemoMode) {
      setPlan(demoTodayPlan);
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const nextPlan = await getMentorToday();
      setPlan(nextPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load learning plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlan();
  }, [isDemoMode]);

  const completedTasks = useMemo(
    () => plan?.tasks.filter((task) => task.status === "completed").length ?? 0,
    [plan]
  );
  const activeTask = useMemo(
    () => plan?.tasks.find((task) => task.status === "in_progress") ?? plan?.tasks.find((task) => task.status !== "completed"),
    [plan]
  );

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
      await logBehavior("task_started", { taskId: task.id, type: task.type }).catch(() => undefined);
      navigate(task.href); // Navigate to task.href directly
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start task");
    } finally {
      setUpdatingTaskId(null);
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
      const nextPlan = await updateMentorTaskStatus(task.id, isCompleting ? "completed" : "pending");
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
        <Loader2 className="animate-spin text-brand-light mb-4" size={32} />
        <p className="text-sm font-semibold text-slate-400">Loading your learning plan...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in relative z-10 max-w-6xl mx-auto">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-200 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Focus Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Target Task Pane - Takes 2/3 */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07090d]/70 backdrop-blur-xl p-8 flex flex-col justify-center min-h-[300px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-light font-mono">Current Focus</p>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display leading-tight">
              {activeTask?.title ?? "No Active Tasks"}
            </h1>
            
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300">
              {activeTask?.reason ?? "You have completed everything on your plate. Refresh to sync your next steps."}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {activeTask ? (
              <button
                type="button"
                onClick={() => void startTask(activeTask)}
                disabled={updatingTaskId === activeTask.id}
                className="w-full sm:w-auto relative group/btn inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-950 px-8 py-4 text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {updatingTaskId === activeTask.id ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                Start Work
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void loadPlan()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-accent text-white px-8 py-4 text-sm font-black uppercase tracking-widest transition-all"
              >
                <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                Sync Plan
              </button>
            )}
          </div>
        </div>

        {/* Weak Topics / Recall Panel - Takes 1/3 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07090d]/70 backdrop-blur-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-amber-400" />
            <h2 className="text-xl font-bold font-display text-white">Due Reviews</h2>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {(plan?.signals.weakTopics ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                <CheckCircle2 size={32} className="text-emerald-500/50" />
                <p className="text-sm font-medium">No reviews due right now.</p>
              </div>
            ) : (
              plan?.signals.weakTopics.slice(0, 5).map((topic) => (
                <Link
                  key={topic.topic}
                  to="/recall"
                  className="group block rounded-xl border border-white/[0.05] bg-[#0c0e12]/60 p-4 transition-all duration-200 hover:border-brand/30 hover:bg-[#0c0e12]/90"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white group-hover:text-brand-light transition-colors">{topic.topic}</p>
                    <span className="text-xs font-bold text-slate-400">
                      {topic.dueCount} due
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
          {(plan?.signals.weakTopics ?? []).length > 0 && (
            <Link to="/recall" className="mt-4 w-full block text-center rounded-xl bg-white/5 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
              Start Review Session
            </Link>
          )}
        </div>
      </div>

      {/* Task Queue Below */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07090d]/70 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-5 mb-5">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-brand-light" />
            <h2 className="text-xl font-bold font-display text-white">Today's Agenda</h2>
          </div>
          <p className="text-xs font-bold text-slate-500">
            {completedTasks} / {plan?.tasks.length ?? 0} COMPLETED
          </p>
        </div>

        <div className="space-y-3">
          {plan?.tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
              No tasks scheduled for today.
            </div>
          ) : (
            <AnimatePresence>
              {plan?.tasks.map((task) => (
                <Motion.div
                  key={task.id}
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskRow
                    task={task}
                    updating={updatingTaskId === task.id}
                    onToggle={() => void completeTask(task)}
                    onStart={() => void startTask(task)}
                  />
                </Motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

function TaskRow({
  task,
  updating,
  onToggle,
  onStart,
}: {
  task: MentorTask;
  updating: boolean;
  onToggle: () => void;
  onStart: () => void;
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
          {/* Title & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h3 className={cn("text-base sm:text-lg font-bold font-display tracking-tight transition-colors", isDone ? "text-slate-500 line-through" : "text-white")}>
              {task.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider font-mono", priorityClass(task.priority))}>
                <Icon size={11} />
                {task.priority}
              </span>
              <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded-md">{task.estimatedMinutes} min</span>
            </div>
          </div>
          
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {task.description}
          </p>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStart}
              disabled={updating || isDone}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? <Loader2 size={13} className="animate-spin" /> : <PlayCircle size={13} />}
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
