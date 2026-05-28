import { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Circle,
  Compass,
  Flame,
  Gauge,
  Layers3,
  Lock,
  Map,
  Plus,
  RefreshCw,
  Route,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Clock,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRoadmapsStore } from "../../../store/roadmaps-store";
import { useCopilotStore } from "../../../store/copilot-store";
import { useAppStore } from "../../../store/app-store";
import { cn } from "../../../lib/utils/cn";
import { ExpansionFlow } from "./ExpansionFlow";
import { BehavioralIntervention } from "./BehavioralIntervention";
import { GuestGuard } from "../../../components/auth/GuestGuard";
import type { Roadmap, RoadmapInsight, RoadmapPhase, RoadmapTask } from "@studybuddy/shared";

const TASK_LIMIT = 8;

interface TaskRichData {
  theme: "cache" | "ats" | "obsidian" | "sqlite" | "array" | "react" | "api" | "default";
  label: string;
  subtasks: string[];
  resources: { label: string; url: string }[];
}

export function RoadmapWorkspace() {
  const {
    roadmaps,
    currentRoadmap,
    loading,
    generating,
    error,
    fetchRoadmaps,
    generateRoadmap,
    setCurrentRoadmap,
    updateTaskStatus,
    injectSkill,
    clearError
  } = useRoadmapsStore();

  const user = useAppStore((state) => state.user);
  const navigate = useNavigate();
  const { sendMessage, createNewConversation, currentConversation, setIsWidgetOpen } = useCopilotStore();
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [isExpansionOpen, setIsExpansionOpen] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);

  // View toggle: "execution" vs "curriculum"
  const [currentView, setCurrentView] = useState<"execution" | "curriculum">("execution");

  // Sidebar dynamic tab switcher: "insights" vs "actions"
  const [sidebarTab, setSidebarTab] = useState<"insights" | "actions">("insights");

  // Sliding Task Inspector Panel active task ID state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Floating Progress Logger Drawer open state
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);

  // Daily Routine & External Activity Logger States
  const [loggedActivities, setLoggedActivities] = useState<{
    id: string;
    title: string;
    category: string;
    duration: string;
    timestamp: number;
  }[]>(() => {
    const saved = localStorage.getItem("studybuddy-daily-activity-logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [customTaskTitle, setCustomTaskTitle] = useState("");
  const [customTaskCategory, setCustomTaskCategory] = useState("DSA / LeetCode");
  const [customTaskDuration, setCustomTaskDuration] = useState("1 hour");

  // Veda smart recalibration feedback
  const [recalibrationAlert, setRecalibrationAlert] = useState<{
    visible: boolean;
    keyword: string;
    count: number;
    tasks: string[];
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("studybuddy-daily-activity-logs", JSON.stringify(loggedActivities));
  }, [loggedActivities]);

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskTitle.trim()) return;

    const newActivity = {
      id: Math.random().toString(36).substring(2, 9),
      title: customTaskTitle.trim(),
      category: customTaskCategory,
      duration: customTaskDuration,
      timestamp: Date.now()
    };

    setLoggedActivities(prev => [newActivity, ...prev]);
    setCustomTaskTitle("");
    setIsLoggerOpen(false); // Cleanly close drawer on success

    // Trigger Veda keyword matching engine
    if (!currentRoadmap) return;

    const words = customTaskTitle
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2 && !["and", "the", "for", "with", "a", "an", "on", "in", "at", "to", "of", "about", "using", "by", "from", "how", "what", "is", "was", "are", "were", "learnt", "learned", "built", "implemented", "solved", "practiced", "worked", "created"].includes(w));

    if (words.length === 0) return;

    const matchedTasks: { id: string; title: string }[] = [];
    let matchedKeyword = "";

    currentRoadmap.phases.forEach((phase) => {
      phase.missions.forEach((mission) => {
        mission.tasks.forEach((task) => {
          if (task.status !== "completed") {
            const taskTitleLower = task.title.toLowerCase();
            const matchingWord = words.find(w => taskTitleLower.includes(w));
            if (matchingWord) {
              matchedTasks.push({ id: task.id, title: task.title });
              matchedKeyword = matchingWord;
            }
          }
        });
      });
    });

    if (matchedTasks.length > 0) {
      const matchedIds = matchedTasks.map(t => t.id);
      const matchedTitles = matchedTasks.map(t => t.title);

      for (const taskId of matchedIds) {
        await updateTaskStatus(taskId, "completed");
      }

      setRecalibrationAlert({
        visible: true,
        keyword: matchedKeyword.toUpperCase(),
        count: matchedTasks.length,
        tasks: matchedTitles
      });

      void handleCopilotAction(`I completed some external work: "${newActivity.title}" for ${newActivity.duration}. Veda matched this to my roadmap and autocompleted the following tasks: ${matchedTitles.join(", ")}. Let's review my updated learning velocity!`);
    } else {
      void handleCopilotAction(`I just completed an external activity: "${newActivity.title}" for ${newActivity.duration} under the "${newActivity.category}" category. Let's record this to my overall study hours context!`);
    }
  };

  useEffect(() => {
    void fetchRoadmaps();
  }, [fetchRoadmaps]);

  useEffect(() => {
    if (!currentRoadmap) {
      setActivePhaseId(null);
      return;
    }

    const phaseStillExists = currentRoadmap.phases.some((phase) => phase.id === activePhaseId);
    if (!phaseStillExists) {
      setActivePhaseId(currentRoadmap.currentPhaseId || currentRoadmap.phases[0]?.id || null);
    }
  }, [activePhaseId, currentRoadmap]);

  const activePhase = useMemo(
    () => currentRoadmap?.phases.find((phase) => phase.id === activePhaseId) || currentRoadmap?.phases[0],
    [activePhaseId, currentRoadmap]
  );

  const currentMission = useMemo(
    () =>
      activePhase?.missions.find((mission) => mission.status === "in_progress") ||
      activePhase?.missions.find((mission) => mission.status !== "completed") ||
      activePhase?.missions[0],
    [activePhase]
  );

  const pendingTasks = useMemo(
    () => currentMission?.tasks.filter((task) => task.status !== "completed") || [],
    [currentMission]
  );

  const nextTask = pendingTasks[0] || currentMission?.tasks[0];
  const isOverloaded = currentRoadmap?.insights?.some((insight) =>
    /overwhelm|struggle|burnout|consistency/i.test(insight.message)
  );

  const stats = useMemo(() => getRoadmapStats(currentRoadmap), [currentRoadmap]);
  const activePhaseIndex = currentRoadmap?.phases.findIndex((phase) => phase.id === activePhase?.id) ?? 0;

  // Date variables for Execution Dashboard Header
  const today = new Date();
  const formattedDay = today.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const totalWeeks = currentRoadmap?.phases.reduce((acc, p) => acc + (p.estimatedWeeks || 1), 0) || 12;
  const currentWeek = currentMission?.weekNumber || 1;

  const handleCopilotAction = async (prompt: string) => {
    setIsWidgetOpen(true);
    if (!currentConversation) {
      await createNewConversation();
    }
    await sendMessage(prompt);
  };

  const handleGenerate = () => generateRoadmap(12);

  const handleInjectSkill = async () => {
    const skill = window.prompt("What skill did you learn externally?");
    if (skill?.trim()) {
      await injectSkill(skill.trim());
    }
  };

  // Find the currently selected task object for the sliding Inspector
  const selectedTask = useMemo<RoadmapTask | null>(() => {
    if (!selectedTaskId) return null;
    let found: RoadmapTask | null = null;
    currentRoadmap?.phases.forEach((phase) => {
      phase.missions.forEach((mission) => {
        const t = mission.tasks.find((task) => task.id === selectedTaskId);
        if (t) found = t as RoadmapTask;
      });
    });
    return found;
  }, [selectedTaskId, currentRoadmap]);

  const renderInspector = () => {
    if (!selectedTask) return null;
    const task = selectedTask;

    return (
      <div key="task-inspector-wrapper">
        {/* Backdrop overlay */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedTaskId(null)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
        {/* Slide-over panel */}
        <Motion.div
          initial={{ x: "100%", opacity: 0.95 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0.95 }}
          transition={{ type: "spring", damping: 26, stiffness: 220 }}
          className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg border-l border-white/10 bg-[#080b11]/95 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-y-auto flex flex-col justify-between"
        >
          {/* Header */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-brand-light">
                VEDA TASK INSPECTOR
              </span>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all duration-200"
                aria-label="Close inspector"
              >
                <X size={14} />
              </button>
            </div>

            {/* Task metadata */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold font-mono">
                <span className={cn("inline-flex items-center gap-1 rounded border px-2.5 py-1 uppercase tracking-wider", taskTypeClass(task.type))}>
                  {task.type}
                </span>
                <span className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-slate-400">
                  {task.durationMinutes} min
                </span>
                {task.difficulty && (
                  <span className={cn("rounded border px-2.5 py-1 uppercase", difficultyClass(task.difficulty))}>
                    {task.difficulty}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight font-display">
                {task.title}
              </h3>
              {task.aiHint && (
                <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 text-xs italic leading-relaxed text-indigo-200 flex gap-2">
                  <Sparkles size={16} className="text-brand-light shrink-0 mt-0.5" />
                  <span>Veda Coach note: "{task.aiHint}"</span>
                </div>
              )}
            </div>

            {/* Subtasks Checklist */}
            <TaskInspectorSubtasks task={task} />

            {/* External Documentation */}
            <TaskInspectorResources task={task} />
          </div>

          {/* Veda Blueprint Container */}
          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-white/[0.05] bg-[#030712]/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                  VEDA BLUEPRINT SCHEMA
                </span>
                <span className="text-[9px] font-mono font-bold text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20 uppercase tracking-widest">
                  {getTaskRichTheme(task.title)}
                </span>
              </div>
              <div className="h-32 rounded-lg border border-white/[0.04] bg-[#07090d]/60 p-2 overflow-hidden flex items-center justify-center">
                <VedaBlueprint theme={getTaskRichTheme(task.title)} />
              </div>
            </div>

            {/* Action button */}
            {task.status !== "completed" && (
              <button
                onClick={() => {
                  setSelectedTaskId(null);
                  navigate(`/study/${task.id}`);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-light text-white px-5 py-4 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.3)] transition hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-[0.98]"
              >
                Launch Study Session ↗
              </button>
            )}
          </div>
        </Motion.div>
      </div>
    );
  };

  if (loading && !currentRoadmap && !error) return <LoadingState />;
  if (error && !currentRoadmap) return <ErrorState error={error} onRetry={() => fetchRoadmaps(true)} onClear={clearError} />;
  if (!currentRoadmap && !generating) {
    return <EmptyState onGenerate={handleGenerate} isGenerating={generating} onboardingComplete={user?.onboardingCompleted} />;
  }
  if (generating) return <GeneratingState />;

  // Calculated mission tasks stats
  const missionTasks = currentMission?.tasks || [];
  const completedMissionTasks = missionTasks.filter(t => t.status === "completed").length;
  const totalMissionTasks = missionTasks.length;

  return (
    <div className="min-h-screen pb-16 text-slate-100 relative">
      {/* Decorative Premium Blur Backgrounds */}
      <div className="absolute top-0 right-10 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[160px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[160px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] relative z-10">
        <main className="min-w-0 space-y-6">
          {/* Behavioral Burnout/Overload Intervention Alerts */}
          {currentRoadmap?.insights
            ?.filter((insight) => insight.type === "behavior")
            .map((insight, index) => (
              <BehavioralIntervention
                key={`${insight.message}-${index}`}
                type={insight.message.toLowerCase().includes("welcome back") ? "recovery" : insight.message.toLowerCase().includes("consistency") ? "burnout" : "overload"}
                message={insight.message}
                onAction={() => handleCopilotAction("Help me recalibrate this roadmap into a calmer, executable plan for the next 7 days.")}
              />
            ))}

          {/* Premium Header Block */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div>
              <p className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                {formattedDay}, {formattedDate}
              </p>
              <h1 className="mt-2.5 text-3xl sm:text-4xl font-black tracking-tight text-white font-display leading-none">
                Roadmap Workspace
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-400 flex items-center gap-1.5 leading-none">
                <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                Week {currentWeek} of {totalWeeks} • {currentRoadmap?.targetRole || "Backend Engineering"}
              </p>
            </div>

            {/* Premium Dual-Mode Tab Switcher */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1 shrink-0 self-start sm:self-auto shadow-inner">
              <button
                onClick={() => setCurrentView("execution")}
                className={cn(
                  "rounded-lg px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300",
                  currentView === "execution" 
                    ? "bg-brand text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                Sprint Dashboard
              </button>
              <button
                onClick={() => setCurrentView("curriculum")}
                className={cn(
                  "rounded-lg px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300",
                  currentView === "curriculum" 
                    ? "bg-brand text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                Journey Map
              </button>
            </div>
          </div>

          {/* Horizontal premium Metrics Console */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-white/[0.02] border border-white/[0.06] p-2 sm:p-3.5 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 sm:gap-3.5 px-2 py-1.5 sm:px-3.5 sm:py-2 sm:border-r border-white/5 last:border-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success border border-success/10 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase text-slate-500 font-mono tracking-wider truncate">Readiness</p>
                <p className="text-sm sm:text-base font-black text-white leading-none mt-1">{stats.readiness}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3.5 px-2 py-1.5 sm:px-3.5 sm:py-2 sm:border-r border-white/5 last:border-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.05)] animate-pulse-glow">
                <Flame size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase text-slate-500 font-mono tracking-wider truncate">Consistency</p>
                <p className="text-sm sm:text-base font-black text-white leading-none mt-1">{stats.consistency}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3.5 px-2 py-1.5 sm:px-3.5 sm:py-2 sm:border-r border-white/5 last:border-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-light border border-accent/10 shadow-[0_0_10px_rgba(139,92,246,0.05)]">
                <Brain size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase text-slate-500 font-mono tracking-wider truncate">Recall State</p>
                <p className="text-sm sm:text-base font-black text-white leading-none mt-1">{stats.recall}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3.5 px-2 py-1.5 sm:px-3.5 sm:py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-light border border-brand/10 shadow-[0_0_10px_rgba(99,102,241,0.05)]">
                <CalendarDays size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase text-slate-500 font-mono tracking-wider truncate">Sprints Run</p>
                <p className="text-sm sm:text-base font-black text-white leading-none mt-1">W{currentWeek} Active</p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentView === "execution" ? (
              /* ========================================================================= */
              /* 1. SPRINT/EXECUTION DASHBOARD                                             */
              /* ========================================================================= */
              <Motion.div
                key="execution"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="space-y-6"
              >
                {/* Veda Recalibration Sync Alert Banner */}
                {recalibrationAlert?.visible && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 text-xs text-emerald-300 shadow-glow backdrop-blur-md"
                  >
                    <button
                      type="button"
                      onClick={() => setRecalibrationAlert(prev => prev ? { ...prev, visible: false } : null)}
                      className="absolute right-4 top-4 text-emerald-400 hover:text-white transition"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex items-start gap-3.5">
                      <Sparkles size={18} className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="font-bold text-white uppercase tracking-wider font-mono mb-1 text-[10px]">Veda Sync autocompleted tasks</h4>
                        <p className="leading-relaxed font-semibold">
                          Recognized external achievement in <span className="text-emerald-200 underline decoration-dotted font-bold">"{recalibrationAlert.keyword}"</span>!
                        </p>
                        <p className="mt-1 text-slate-400 leading-relaxed font-medium">
                          Autocompleted {recalibrationAlert.count} roadmap task(s): <span className="text-white font-bold">{recalibrationAlert.tasks.join(", ")}</span>. Your career readiness scoring has been successfully re-indexed!
                        </p>
                      </div>
                    </div>
                  </Motion.div>
                )}

                {/* A. CURRENT MISSION PANEL */}
                <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07090d]/80 p-6 sm:p-8 backdrop-blur-xl shadow-premium">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/35 to-transparent" />
                  
                  {/* Card Title & Progress Indicator */}
                  <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-light font-mono leading-none">
                        Current Mission Focus
                      </span>
                      <h2 className="mt-2 text-2xl font-black text-white font-display tracking-tight leading-snug">
                        {currentMission?.title || "Build a Cache Layer"}
                      </h2>
                      <p className="mt-1.5 text-sm text-slate-400 leading-relaxed font-medium">
                        {currentMission?.description || "Learn how databases use in-memory caching to scale"}
                      </p>
                    </div>
                    <div className="text-right shrink-0 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-xl shadow-inner">
                      <p className="text-2xl font-extrabold text-white font-display tracking-tight leading-none">
                        {completedMissionTasks}/{totalMissionTasks}
                      </p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 leading-none font-mono">
                        milestones done
                      </p>
                    </div>
                  </div>

                  {/* Why this matters callout */}
                  <div className="mt-5 rounded-xl border border-indigo-500/10 bg-indigo-950/5 p-4 text-xs sm:text-sm leading-relaxed text-indigo-300">
                    <span className="font-bold text-white block sm:inline mr-1">Veda Blueprint Rationale:</span>
                    {currentMission?.whyItMatters || "Redis caching is critical for production systems. You'll use this pattern in 90% of scaling operations."}
                  </div>

                  {/* Tasks List */}
                  <div className="mt-6 space-y-2.5">
                    {missionTasks.map((task, idx) => {
                      const isCompleted = task.status === "completed";
                      const isActive = !isCompleted && pendingTasks[0]?.id === task.id;
                      const isLocked = !isCompleted && !isActive && idx > 0 && missionTasks[idx - 1].status !== "completed";

                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          isActive={isActive}
                          isLocked={isLocked}
                          featured={isActive}
                          onToggle={() => updateTaskStatus(task.id, isCompleted ? "pending" : "completed")}
                          onStart={() => navigate(`/study/${task.id}`)}
                          onSelect={setSelectedTaskId}
                          delay={idx * 0.04}
                        />
                      );
                    })}
                  </div>

                  {/* Log external progress trigger button */}
                  <div className="mt-5 flex gap-3">
                    {nextTask && (
                      <button
                        onClick={() => navigate(`/study/${nextTask.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-light text-white px-5 py-3.5 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.3)] transition duration-200 active:scale-[0.98]"
                      >
                        Launch next sprint ↗
                      </button>
                    )}
                    <button
                      onClick={() => setIsLoggerOpen(true)}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-brand/45 hover:bg-brand/10 transition duration-200 shrink-0"
                      title="Log external work achievements"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </section>

                {/* B. COMING UP SECTION */}
                <section className="rounded-2xl border border-white/[0.06] bg-[#07090d]/60 p-6 backdrop-blur-xl shadow-premium">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04] text-brand-light">
                      <Layers3 size={14} />
                    </div>
                    <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Coming Up Next
                    </h2>
                  </div>
                  
                  <div className="mt-4 divide-y divide-white/[0.04]">
                    {currentRoadmap?.phases.slice(activePhaseIndex).flatMap(p => p.missions).filter(m => m.id !== currentMission?.id).slice(0, 2).map((mission, idx) => (
                      <div key={mission.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-brand-light transition-colors">
                            Week {currentWeek + idx + 1}: {mission.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {mission.tasks?.length || 3} objectives • Launches automatically
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                          {idx === 0 ? "Next Up" : `${idx + 1} weeks out`}
                        </span>
                      </div>
                    ))}
                    {currentRoadmap?.phases.length === 1 && currentMission?.tasks.every(t => t.status === "completed") && (
                      <div className="py-4 text-center text-xs text-slate-500">
                        No upcoming sprints in this track. Regenerate to expand.
                      </div>
                    )}
                  </div>
                </section>

                {/* C. GEMINI AHEAD OF SCHEDULE BANNER */}
                <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-5 backdrop-blur-xl shadow-glow">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-40 pointer-events-none" />
                  <div className="flex items-center justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        <Sparkles size={16} className="animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Ahead of Schedule</h4>
                        <p className="mt-1 text-xs sm:text-sm text-emerald-300/90 leading-relaxed font-semibold">
                          Completing tasks 15% faster than estimated. If you maintain this pace, you'll finish week 1 by tomorrow.
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCopilotAction("I'm ahead of schedule on week 1 backend tasks. Give me a challenge task related to caching eviction policies or distributed coherency!")}
                      className="shrink-0 text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors duration-200 font-sans"
                    >
                      Challenge →
                    </button>
                  </div>
                </section>
              </Motion.div>
            ) : (
              /* ========================================================================= */
              /* 2. CURRICULUM JOURNEY MAP                                                 */
              /* ========================================================================= */
              <Motion.div
                key="curriculum"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="space-y-6"
              >
                {/* Journey Timeline Map */}
                <section className="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-[#07090d]/60 p-6 shadow-premium">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                    <SectionTitle icon={Map} title="Journey Timeline Map" />
                    <span className="font-mono text-[10px] font-semibold text-slate-500">{stats.completion}% overall completion</span>
                  </div>

                  <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-8 ml-3 sm:ml-4 py-2">
                    {currentRoadmap?.phases.map((phase, index) => {
                      const state = getPhaseState(phase, activePhase?.id === phase.id);
                      const phaseProgress = getPhaseProgress(phase);
                      const isCompleted = phase.status === "completed";
                      const isActive = phase.id === activePhase?.id;
                      const isLocked = state === "locked";

                      return (
                        <div key={phase.id} className="relative">
                          {/* Timeline dot */}
                          <button
                            onClick={() => {
                              if (!isLocked) {
                                setActivePhaseId(phase.id);
                              }
                            }}
                            disabled={isLocked}
                            className={cn(
                              "absolute -left-[35px] sm:-left-[43px] top-1.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 transition duration-300 z-10",
                              isCompleted && "border-[#2ec4a0] bg-[#061f1a] text-[#2ec4a0]",
                              isActive && "border-[#a07ee0] bg-[#150f28] text-[#a07ee0] shadow-[0_0_12px_rgba(124,92,191,0.3)] scale-110",
                              isLocked && "border-white/5 bg-[#0a0f18] text-slate-600 cursor-not-allowed"
                            )}
                          >
                            {isCompleted ? <CheckCircle2 size={14} /> : isLocked ? <Lock size={12} /> : <span className="font-mono text-[10px] font-bold">{index + 1}</span>}
                          </button>

                          {/* Phase detail card */}
                          <div
                            onClick={() => {
                              if (!isLocked) {
                                setActivePhaseId(phase.id);
                              }
                            }}
                            className={cn(
                              "rounded-xl border p-4 sm:p-5 text-left transition duration-300 cursor-pointer select-none",
                              isActive
                                ? "border-brand/40 bg-[#0d1222] shadow-[0_0_20px_rgba(99,102,241,0.08)]"
                                : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]",
                              isLocked && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <span className={cn(
                                  "inline-flex rounded px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-wider mb-2",
                                  isCompleted ? "bg-success/10 text-success border border-success/20" : isLocked ? "bg-white/5 text-slate-500 border border-white/5" : "bg-brand/10 text-brand-light border border-brand/20"
                                )}>
                                  {isCompleted ? "Completed" : isLocked ? "Locked Phase" : "Active Focus"}
                                </span>
                                <h3 className="text-sm sm:text-base font-bold text-white leading-tight font-display">{phase.title}</h3>
                                <p className="mt-2 text-xs leading-relaxed text-slate-400">{phase.description}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono text-xs font-black text-slate-300">{phaseProgress}%</span>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 font-mono">progress</p>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4 flex items-center gap-2">
                              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                                <div className="h-full rounded-full bg-[#a07ee0]" style={{ width: `${phaseProgress}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* B. DETAILED SPRINTS / OBJECTIVES FOR SELECTED PHASE */}
                {activePhase && (
                  <section id="journey-phase-details" className="glass-panel rounded-2xl border border-white/10 bg-[#07090d]/60 p-6 shadow-premium">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
                      <div className="flex items-center gap-2">
                        <Route size={16} className="text-[#a07ee0]" />
                        <h2 className="text-sm font-bold text-slate-300">Phase Objectives: {activePhase.title}</h2>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{activePhase.missions.length} active tracks</span>
                    </div>

                    <div className="space-y-6">
                      {activePhase.missions.map((mission) => (
                        <div key={mission.id} className="space-y-3">
                          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-3.5 py-2.5 rounded-xl">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#a07ee0] animate-pulse" />
                            <h4 className="text-xs font-black uppercase text-slate-200 font-mono tracking-wider">{mission.title}</h4>
                          </div>
                          <div className="space-y-2 pl-2">
                            {mission.tasks.map((task, index) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                featured={false}
                                onToggle={() => updateTaskStatus(task.id, task.status === "completed" ? "pending" : "completed")}
                                onStart={() => navigate(`/study/${task.id}`)}
                                onSelect={setSelectedTaskId}
                                delay={index * 0.03}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </Motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Right Sidebar Widgets - Streamlined and Consolidated */}
        <aside className="space-y-6">
          {/* Active Track Selector */}
          <section className="glass-panel rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-premium">
            <div className="mb-3.5 flex items-center justify-between">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Selected Path</p>
              <span className="rounded-full border border-[#c9a84c]/30 bg-[#1c1608] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-[#c9a84c]">
                Active
              </span>
            </div>
            <RoadmapPicker roadmaps={roadmaps} currentRoadmap={currentRoadmap} onSelect={setCurrentRoadmap} />
            
            <div className="mt-4 rounded-xl border border-white/5 bg-[#05070a]/40 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white">
                <Target size={14} className="text-[#2ec4a0]" />
                Next milestone target
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                {currentRoadmap?.nextMilestone || nextTask?.title || "Complete the next execution task to unlock the following checkpoint."}
              </p>
            </div>
          </section>

          {/* Consolidated Command Center: Tabbed Insights & Actions */}
          <div className="glass-panel rounded-2xl border border-white/10 bg-[#07090d]/60 shadow-premium overflow-hidden">
            {/* Tab switcher */}
            <div className="flex border-b border-white/[0.06] p-1 bg-black/20">
              <button
                onClick={() => setSidebarTab("insights")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 rounded-xl",
                  sidebarTab === "insights"
                    ? "bg-brand/20 border border-brand/35 text-white shadow-glow"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Sparkles size={12} />
                Veda Coach
              </button>
              <button
                onClick={() => setSidebarTab("actions")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 rounded-xl",
                  sidebarTab === "actions"
                    ? "bg-brand/20 border border-brand/35 text-white shadow-glow"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Zap size={12} />
                Quick Actions
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                {sidebarTab === "insights" ? (
                  <Motion.div
                    key="insights"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl border border-[#7c5cbf]/25 bg-[#150f28]/60 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white">
                        <Sparkles size={15} className="text-[#a07ee0]" />
                        Veda mentor readout
                      </div>
                      <p className="text-xs leading-relaxed text-slate-400">
                        {nextTask
                          ? `Start with "${nextTask.title}". It is the cleanest next move for the active mission.`
                          : "Your roadmap is ready for a new mission. Expand the direction or regenerate with updated goals."}
                      </p>
                      <button
                        onClick={() => handleCopilotAction("Review my current roadmap and tell me the smartest next move.")}
                        className="mt-3.5 w-full rounded-xl bg-[#7c5cbf] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#a07ee0] shadow-premium"
                      >
                        Ask Veda Coach
                      </button>
                    </div>

                    <div className="space-y-3">
                      {currentRoadmap?.insights?.length ? (
                        currentRoadmap.insights.map((insight, index) => (
                          <InsightCard
                            key={`${insight.message}-${index}`}
                            insight={insight}
                            onAction={() => handleInsightAction(insight, navigate, handleCopilotAction)}
                          />
                        ))
                      ) : (
                        <div className="rounded-lg border border-white/5 p-4 text-xs leading-relaxed text-slate-600">
                          No insights yet. Progress through a few tasks and Veda will start surfacing useful patterns.
                        </div>
                      )}
                    </div>
                  </Motion.div>
                ) : (
                  <Motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <QuickAction icon={Brain} label="Ask" onClick={() => handleCopilotAction("Can we review my active learning track?")} />
                      <QuickAction icon={RefreshCw} label="Recall" onClick={() => navigate("/recall")} />
                      <QuickAction icon={Target} label="Quiz" onClick={() => (nextTask ? navigate(`/study/${nextTask.id}`) : handleCopilotAction("Quiz me on my roadmap progress."))} />
                      <QuickAction icon={BookOpen} label="Notes" onClick={() => navigate("/notes")} />
                      <QuickAction icon={Plus} label="Inject" onClick={handleInjectSkill} />
                      <QuickAction icon={Search} label="Gaps" onClick={() => navigate("/skill-gap")} />
                    </div>

                    <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => setIsExpansionOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-light px-4 py-3 text-xs font-bold text-white transition-all duration-200"
                      >
                        <Plus size={14} />
                        Expand Path
                      </button>
                      <button
                        onClick={() => handleCopilotAction("Simplify my roadmap while keeping the same target role and strongest outcomes.")}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.04] text-slate-300 hover:text-white px-4 py-3 text-xs font-bold transition-all duration-200"
                      >
                        <Layers3 size={14} />
                        Simplify Sprints
                      </button>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </div>

      {/* Sliding Task Inspector Panel Overlay */}
      <AnimatePresence>
        {renderInspector()}
      </AnimatePresence>

      {/* Sliding Progress Logging Drawer */}
      <AnimatePresence>
        {isLoggerOpen && (
          <>
            {/* Backdrop overlay */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoggerOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <Motion.div
              initial={{ x: "100%", opacity: 0.95 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.95 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-white/10 bg-[#080b11]/95 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-y-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-400">
                    <Target size={14} />
                  </div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                    VEDA SYNC PROGRESS LOG
                  </span>
                </div>
                <button
                  onClick={() => setIsLoggerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all duration-200"
                  aria-label="Close logger"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 flex flex-col justify-between">
                <form onSubmit={handleLogActivity} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1.5">
                      What did you build or learn?
                    </label>
                    <input
                      type="text"
                      value={customTaskTitle}
                      onChange={(e) => setCustomTaskTitle(e.target.value)}
                      placeholder="e.g. Practiced Redis Pub/Sub, solved 3 BST trees..."
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white outline-none focus:border-purple-500/60 placeholder:text-slate-600 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1.5">Category</label>
                      <div className="relative">
                        <select
                          value={customTaskCategory}
                          onChange={(e) => setCustomTaskCategory(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-3 py-3 pr-8 text-xs text-white outline-none focus:border-purple-500/60 transition"
                        >
                          <option value="DSA / LeetCode">DSA / LeetCode</option>
                          <option value="Backend Development">Backend Development</option>
                          <option value="System Design">System Design</option>
                          <option value="AI / ML Models">AI / ML Models</option>
                          <option value="Obsidian Note Mapping">Obsidian Note Mapping</option>
                          <option value="Frontend UI React">Frontend UI React</option>
                          <option value="Other Skills">Other Skills</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1.5">Duration</label>
                      <div className="relative">
                        <select
                          value={customTaskDuration}
                          onChange={(e) => setCustomTaskDuration(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-3 py-3 pr-8 text-xs text-white outline-none focus:border-purple-500/60 transition"
                        >
                          <option value="30 min">30 min</option>
                          <option value="1 hour">1 hour</option>
                          <option value="2 hours">2 hours</option>
                          <option value="4 hours">4 hours</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-3.5 text-xs font-black uppercase tracking-widest transition shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-[0.98]"
                  >
                    <Zap size={12} /> Log & Sync with Veda ↗
                  </button>
                </form>

                {/* Logged Activities List */}
                <div className="mt-8 pt-6 border-t border-white/[0.04] flex-1 flex flex-col min-h-0">
                  <p className="font-mono text-[8px] font-black uppercase tracking-[0.16em] text-slate-500 mb-3">
                    LOGGED PROGRESS TODAY
                  </p>
                  {loggedActivities.length > 0 ? (
                    <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
                      {loggedActivities.map((act) => (
                        <div key={act.id} className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl text-xs animate-fade-in">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-300 truncate">{act.title}</p>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                              {act.category} • {act.duration}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLoggedActivities(prev => prev.filter(a => a.id !== act.id))}
                            className="text-[10px] text-slate-500 hover:text-red-400 font-mono transition"
                          >
                            REMOVE
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                      <Clock size={20} className="text-slate-600 mb-2" />
                      <p className="text-xs text-slate-500 font-medium">No external activities logged today.</p>
                    </div>
                  )}
                </div>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>

      <ExpansionFlow isOpen={isExpansionOpen} onClose={() => setIsExpansionOpen(false)} />
    </div>
  );
}

function TaskCard({
  task,
  featured,
  isActive = false,
  isLocked = false,
  onToggle,
  onStart,
  onSelect,
  delay
}: {
  task: RoadmapTask;
  featured: boolean;
  isActive?: boolean;
  isLocked?: boolean;
  onToggle: () => void;
  onStart: () => void;
  onSelect: (taskId: string) => void;
  delay: number;
}) {
  const isDone = task.status === "completed";

  const Icon = {
    learn: BookOpen,
    practice: Zap,
    revise: RefreshCw,
    project: Layers3
  }[task.type] || BookOpen;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => {
        if (!isLocked) {
          onSelect(task.id);
        }
      }}
      className={cn(
        "rounded-xl border p-4 transition-all duration-300 cursor-pointer select-none relative overflow-hidden group flex items-center justify-between",
        featured 
          ? "border-brand/35 bg-[#0a1120]/80 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:border-brand/50 hover:bg-[#0c162b]" 
          : "border-white/5 bg-[#05070a]/60 hover:border-white/15 hover:bg-[#0e121a]/80",
        isDone && "border-success/15 bg-[#04140e]/40 hover:border-success/20 opacity-70"
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={isLocked}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition duration-200",
            isDone 
              ? "border-success bg-success text-slate-950" 
              : isLocked 
                ? "border-white/5 bg-white/[0.01] text-slate-700 cursor-not-allowed" 
                : "border-white/15 text-slate-500 hover:border-success hover:text-success"
          )}
          aria-label={isDone ? "Mark task pending" : "Mark task complete"}
        >
          {isDone ? <CheckCircle2 size={13} /> : isLocked ? <Lock size={10} /> : <Circle size={11} />}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[8px] font-bold font-mono mb-1 leading-none">
            <span className={cn("inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 uppercase tracking-wider", taskTypeClass(task.type))}>
              <Icon size={9} />
              {task.type}
            </span>
            <span className="text-slate-500">{task.durationMinutes}m</span>
            {task.difficulty && (
              <span className={cn("rounded px-1.5 py-0.5 uppercase", difficultyClass(task.difficulty))}>
                {task.difficulty}
              </span>
            )}
          </div>
          <h3 className={cn("text-sm font-bold leading-tight group-hover:text-white transition-colors duration-200", isDone ? "text-slate-500 line-through font-normal" : "text-slate-200")}>
            {task.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        {!isDone && !isLocked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="hidden shrink-0 items-center gap-1 rounded-lg border border-brand/20 bg-brand/10 hover:bg-brand hover:text-white px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand-light transition duration-200 md:inline-flex"
          >
            Start
            <ArrowRight size={10} />
          </button>
        )}
        <ChevronRight size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors duration-200" />
      </div>
    </Motion.div>
  );
}

function TaskInspectorSubtasks({ task }: { task: RoadmapTask }) {
  const richData = useMemo(() => {
    const defaultData = getTaskRichData(task.title);
    return {
      subtasks: task.subtasks && task.subtasks.length > 0 ? task.subtasks : defaultData.subtasks,
    };
  }, [task.title, task.subtasks]);

  const [checkedSubtasks, setCheckedSubtasks] = useState<boolean[]>([]);

  useEffect(() => {
    setCheckedSubtasks(
      richData.subtasks.map((_, idx: number) => {
        const saved = localStorage.getItem(`studybuddy-task-${task.id}-sub-${idx}`);
        return saved === "true";
      })
    );
  }, [task.id, richData.subtasks]);

  const toggleSubtask = (idx: number) => {
    const nextStates = [...checkedSubtasks];
    nextStates[idx] = !nextStates[idx];
    setCheckedSubtasks(nextStates);
    localStorage.setItem(`studybuddy-task-${task.id}-sub-${idx}`, nextStates[idx] ? "true" : "false");
  };

  return (
    <div className="space-y-3 mt-6">
      <p className="font-mono text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
        IMPLEMENTATION CHECKLIST
      </p>
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {richData.subtasks.map((sub: string, idx: number) => {
          const isSubDone = checkedSubtasks[idx];
          return (
            <button
              key={idx}
              onClick={() => toggleSubtask(idx)}
              className={cn(
                "w-full flex items-start gap-3 rounded-xl border p-3 text-left transition duration-200 text-xs",
                isSubDone
                  ? "border-emerald-500/10 bg-emerald-500/[0.01] text-slate-500"
                  : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] text-slate-300"
              )}
            >
              <div className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition duration-200",
                isSubDone ? "border-emerald-500 bg-emerald-500 text-slate-950" : "border-white/20 text-slate-500"
              )}>
                {isSubDone && <CheckCircle2 size={11} />}
              </div>
              <span className={cn(
                "leading-relaxed font-medium",
                isSubDone && "line-through text-slate-600"
              )}>
                {sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskInspectorResources({ task }: { task: RoadmapTask }) {
  const richData = useMemo(() => {
    const defaultData = getTaskRichData(task.title);
    return {
      resources: task.resources && task.resources.length > 0 ? task.resources : defaultData.resources
    };
  }, [task.title, task.resources]);

  return (
    <div className="space-y-3 mt-6">
      <p className="font-mono text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
        EXTERNAL STUDY HUB
      </p>
      <div className="flex flex-wrap gap-2">
        {richData.resources.map((res: { label: string; url: string }, idx: number) => (
          <a
            key={idx}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2.5 transition-all duration-200"
          >
            <Compass size={13} className="text-indigo-400 shrink-0" />
            {res.label}
            <ExternalLink size={10} className="text-slate-500" />
          </a>
        ))}
      </div>
    </div>
  );
}

function RoadmapPicker({ roadmaps, currentRoadmap, onSelect }: { roadmaps: Roadmap[]; currentRoadmap: Roadmap | null; onSelect: (roadmap: Roadmap) => void }) {
  if (roadmaps.length <= 1) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="truncate text-sm font-bold text-white">{currentRoadmap?.title || currentRoadmap?.targetRole || "Primary roadmap"}</p>
        <p className="mt-1 text-xs text-slate-500 font-mono uppercase">{currentRoadmap?.category || "Career track"}</p>
      </div>
    );
  }

  return (
    <label className="block">
      <span className="sr-only">Select roadmap</span>
      <div className="relative">
        <select
          value={currentRoadmap?.id}
          onChange={(event) => {
            const selected = roadmaps.find((roadmap) => roadmap.id === event.target.value);
            if (selected) onSelect(selected);
          }}
          className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pr-9 text-sm font-bold text-white outline-none transition focus:border-brand/60"
        >
          {roadmaps.map((roadmap) => (
            <option key={roadmap.id} value={roadmap.id}>
              {roadmap.title || roadmap.targetRole}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
      </div>
    </label>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Map; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04] text-[#a07ee0]">
        <Icon size={14} />
      </div>
      <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 leading-none">{title}</h2>
    </div>
  );
}

function VedaBlueprint({ theme }: { theme: "cache" | "ats" | "obsidian" | "sqlite" | "array" | "react" | "api" | "default" }) {
  return (
    <div className="w-full h-full min-h-[120px] flex items-center justify-center">
      {theme === "cache" && <CacheBlueprint />}
      {theme === "ats" && <AtsBlueprint />}
      {theme === "obsidian" && <ObsidianBlueprint />}
      {theme === "sqlite" && <SqliteBlueprint />}
      {theme === "array" && <ArrayBlueprint />}
      {theme === "react" && <ReactBlueprint />}
      {theme === "api" && <ApiBlueprint />}
      {theme === "default" && <DefaultBlueprint />}
    </div>
  );
}

function CacheBlueprint() {
  return (
    <svg className="w-full h-full max-h-[120px]" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cacheGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="dbGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="10" y="42" width="50" height="35" rx="6" fill="#1E293B" stroke="white" strokeOpacity="0.1" />
      <text x="35" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Client App</text>
      <text x="35" y="70" fill="#64748B" fontSize="6" fontWeight="bold" textAnchor="middle">Port 3000</text>

      <rect x="95" y="12" width="65" height="35" rx="6" fill="url(#cacheGlow)" stroke="#10B981" strokeOpacity="0.4" filter="url(#glowFilter)" />
      <text x="127.5" y="29" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Redis Cache</text>
      <text x="127.5" y="40" fill="#A7F3D0" fontSize="6" fontWeight="bold" textAnchor="middle">LRU Hit (1ms)</text>

      <rect x="95" y="72" width="65" height="35" rx="6" fill="url(#dbGlow)" stroke="#8B5CF6" strokeOpacity="0.4" filter="url(#glowFilter)" />
      <text x="127.5" y="89" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">PostgreSQL</text>
      <text x="127.5" y="100" fill="#DDD6FE" fontSize="6" fontWeight="bold" textAnchor="middle">Miss (120ms)</text>

      <path d="M60 52 C 75 52, 75 29.5, 95 29.5" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
      </path>

      <path d="M60 67 C 75 67, 75 89.5, 95 89.5" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" values="40;0" dur="3s" repeatCount="indefinite" />
      </path>

      <path d="M127.5 47 L 127.5 72" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

function AtsBlueprint() {
  return (
    <svg className="w-full h-full max-h-[120px]" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="atsGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="10" y="42" width="45" height="35" rx="6" fill="#1E293B" stroke="white" strokeOpacity="0.1" />
      <text x="32.5" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Resume PDF</text>
      <text x="32.5" y="70" fill="#64748B" fontSize="6" fontWeight="bold" textAnchor="middle">Raw Data</text>

      <rect x="80" y="42" width="60" height="35" rx="6" fill="url(#atsGlow)" stroke="#3B82F6" strokeOpacity="0.4" filter="url(#glowFilter)" />
      <text x="110" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Vector Embed</text>
      <text x="110" y="70" fill="#93C5FD" fontSize="6" fontWeight="bold" textAnchor="middle">1536-Dim</text>

      <rect x="165" y="42" width="55" height="35" rx="6" fill="#1E293B" stroke="#10B981" strokeOpacity="0.4" />
      <text x="192.5" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Cosine Sim</text>
      <text x="192.5" y="70" fill="#10B981" fontSize="7" fontWeight="black" textAnchor="middle">Match 94%</text>

      <path d="M55 59.5 L 80 59.5" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M140 59.5 L 165 59.5" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function ObsidianBlueprint() {
  return (
    <svg className="w-full h-full max-h-[120px]" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="120" cy="60" r="8" fill="#EC4899" stroke="#EC4899" strokeWidth="1" filter="url(#glowFilter)" className="animate-pulse" />
      <text x="120" y="76" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle">MOC Index</text>

      <circle cx="70" cy="35" r="5" fill="#3B82F6" stroke="#3B82F6" strokeWidth="1" />
      <text x="70" y="27" fill="#94A3B8" fontSize="5" fontWeight="semibold" textAnchor="middle">Redis Cache</text>

      <circle cx="170" cy="30" r="5" fill="#3B82F6" stroke="#3B82F6" strokeWidth="1" />
      <text x="170" y="22" fill="#94A3B8" fontSize="5" fontWeight="semibold" textAnchor="middle">SQLite WAL</text>

      <circle cx="80" cy="90" r="5" fill="#10B981" stroke="#10B981" strokeWidth="1" />
      <text x="80" y="101" fill="#94A3B8" fontSize="5" fontWeight="semibold" textAnchor="middle">Zettelkasten</text>

      <circle cx="160" cy="90" r="5" fill="#10B981" stroke="#10B981" strokeWidth="1" />
      <text x="160" y="101" fill="#94A3B8" fontSize="5" fontWeight="semibold" textAnchor="middle">Compilers</text>

      <line x1="120" y1="60" x2="70" y2="35" stroke="#EC4899" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="1 1" />
      <line x1="120" y1="60" x2="170" y2="30" stroke="#EC4899" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="1 1" />
      <line x1="120" y1="60" x2="80" y2="90" stroke="#EC4899" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="1 1" />
      <line x1="120" y1="60" x2="160" y2="90" stroke="#EC4899" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="1 1" />

      <line x1="70" y1="35" x2="80" y2="90" stroke="#64748B" strokeWidth="0.5" strokeOpacity="0.3" />
      <line x1="170" y1="30" x2="160" y2="90" stroke="#64748B" strokeWidth="0.5" strokeOpacity="0.3" />
    </svg>
  );
}

function SqliteBlueprint() {
  return (
    <svg className="w-full h-full max-h-[120px]" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sqliteGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="10" y="42" width="55" height="35" rx="6" fill="#1E293B" stroke="white" strokeOpacity="0.1" />
      <text x="37.5" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">C++ Sandbox</text>
      <text x="37.5" y="70" fill="#64748B" fontSize="6" fontWeight="bold" textAnchor="middle">App Process</text>

      <rect x="95" y="42" width="55" height="35" rx="6" fill="url(#sqliteGlow)" stroke="#F59E0B" strokeOpacity="0.4" filter="url(#glowFilter)" />
      <text x="122.5" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">SQLite WAL</text>
      <text x="122.5" y="70" fill="#FEF3C7" fontSize="6" fontWeight="bold" textAnchor="middle">Fast Commit</text>

      <rect x="170" y="42" width="50" height="35" rx="6" fill="#1E293B" stroke="#6D28D9" strokeOpacity="0.4" />
      <text x="195" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">PostgreSQL</text>
      <text x="195" y="70" fill="#A78BFA" fontSize="6" fontWeight="bold" textAnchor="middle">Cloud Sync</text>

      <path d="M65 59.5 L 95 59.5" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M150 59.5 L 170 59.5" stroke="#6D28D9" strokeWidth="1" strokeDasharray="2 2">
        <animate attributeName="stroke-dashoffset" values="20;0" dur="3s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function ArrayBlueprint() {
  return (
    <svg className="w-full h-full max-h-[120px]" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="arrayGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0891B2" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="15" y="45" width="40" height="30" rx="4" fill="url(#arrayGlow)" stroke="#06B6D4" strokeOpacity="0.6" filter="url(#glowFilter)" />
      <text x="35" y="60" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Index 0</text>
      <text x="35" y="70" fill="#E0F2FE" fontSize="6" textAnchor="middle">Addr 0x00</text>

      <rect x="65" y="45" width="40" height="30" rx="4" fill="#1E293B" stroke="white" strokeOpacity="0.1" />
      <text x="85" y="60" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Index 1</text>
      <text x="85" y="70" fill="#64748B" fontSize="6" textAnchor="middle">Addr 0x04</text>

      <rect x="115" y="45" width="40" height="30" rx="4" fill="#1E293B" stroke="white" strokeOpacity="0.1" />
      <text x="135" y="60" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Index 2</text>
      <text x="135" y="70" fill="#64748B" fontSize="6" textAnchor="middle">Addr 0x08</text>

      <rect x="165" y="45" width="40" height="30" rx="4" fill="#1E293B" stroke="white" strokeOpacity="0.1" />
      <text x="185" y="60" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Index 3</text>
      <text x="185" y="70" fill="#64748B" fontSize="6" textAnchor="middle">Addr 0x0C</text>

      <path d="M35 15 L 35 35" stroke="#F59E0B" strokeWidth="1.5" />
      <text x="35" y="10" fill="#F59E0B" fontSize="7" fontWeight="bold" textAnchor="middle">O(1) Direct Access</text>
    </svg>
  );
}

function ReactBlueprint() {
  return (
    <svg className="w-full h-full max-h-[120px]" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reactGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="30" r="6" fill="#8B5CF6" stroke="#8B5CF6" filter="url(#glowFilter)" />
      <line x1="50" y1="30" x2="35" y2="60" stroke="#8B5CF6" strokeWidth="1" />
      <line x1="50" y1="30" x2="65" y2="60" stroke="#8B5CF6" strokeWidth="1" />
      <circle cx="35" cy="60" r="5" fill="#8B5CF6" />
      <circle cx="65" cy="60" r="5" fill="#8B5CF6" />
      <text x="50" y="18" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle">Virtual DOM</text>

      <path d="M85 45 L 135 45" stroke="#EC4899" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
      </path>
      <text x="110" y="38" fill="#EC4899" fontSize="6" fontWeight="bold" textAnchor="middle">Reconciliation</text>

      <circle cx="175" cy="30" r="6" fill="#10B981" />
      <line x1="175" y1="30" x2="160" y2="60" stroke="#10B981" strokeWidth="1" />
      <line x1="175" y1="30" x2="190" y2="60" stroke="#10B981" strokeWidth="1" />
      <circle cx="160" cy="60" r="5" fill="#10B981" />
      <circle cx="190" cy="60" r="5" fill="#10B981" />
      <text x="175" y="18" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle">Real DOM</text>
    </svg>
  );
}

function ApiBlueprint() {
  return (
    <svg className="w-full h-full max-h-[120px]" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="apiGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EC4899" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#BE185D" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="10" y="42" width="50" height="35" rx="6" fill="#1E293B" stroke="white" strokeOpacity="0.1" />
      <text x="35" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">HTTP Client</text>
      <text x="35" y="70" fill="#64748B" fontSize="6" textAnchor="middle">Request</text>

      <rect x="85" y="42" width="60" height="35" rx="6" fill="url(#apiGlow)" stroke="#EC4899" strokeOpacity="0.4" filter="url(#glowFilter)" />
      <text x="115" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Express Route</text>
      <text x="115" y="70" fill="#FCE7F3" fontSize="6" textAnchor="middle">Router Handler</text>

      <rect x="170" y="42" width="55" height="35" rx="6" fill="#1E293B" stroke="#10B981" strokeOpacity="0.4" />
      <text x="197.5" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Controller</text>
      <text x="197.5" y="70" fill="#10B981" fontSize="6" fontWeight="bold" textAnchor="middle">200 OK JSON</text>

      <path d="M60 59.5 L 85 59.5" stroke="#EC4899" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M145 59.5 L 170 59.5" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function DefaultBlueprint() {
  return (
    <svg className="w-full h-full max-h-[120px]" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="defGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="10" y="42" width="45" height="35" rx="6" fill="#1E293B" stroke="white" strokeOpacity="0.1" />
      <text x="32.5" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Gateway</text>
      <text x="32.5" y="70" fill="#64748B" fontSize="6" fontWeight="bold" textAnchor="middle">Shield (Rate)</text>

      <rect x="80" y="42" width="60" height="35" rx="6" fill="url(#defGlow)" stroke="#3B82F6" strokeOpacity="0.4" filter="url(#glowFilter)" />
      <text x="110" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Nginx Proxy</text>
      <text x="110" y="70" fill="#93C5FD" fontSize="6" fontWeight="bold" textAnchor="middle">Load Balancer</text>

      <rect x="165" y="42" width="55" height="35" rx="6" fill="#1E293B" stroke="#10B981" strokeOpacity="0.4" />
      <text x="192.5" y="59" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">App Nodes</text>
      <text x="192.5" y="70" fill="#10B981" fontSize="6" fontWeight="bold" textAnchor="middle">3x Replicas</text>

      <path d="M55 59.5 L 80 59.5" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M140 59.5 L 165 59.5" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand/5 blur-[120px] pointer-events-none animate-pulse" />
      <RefreshCw className="mb-4 h-10 w-10 animate-spin text-[#a07ee0]" />
      <p className="text-sm font-semibold text-slate-400 font-display">Syncing your roadmap workspace...</p>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-32 text-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
      <Sparkles className="mb-6 h-14 w-14 animate-pulse text-[#a07ee0]" />
      <h2 className="text-2xl font-black text-white font-display">Synthesizing mission</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-500 font-medium">Analyzing skill gaps, behavior signals, and recall load to build your next execution roadmap.</p>
      <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <Motion.div
          className="h-full w-1/2 rounded-full bg-[#a07ee0]"
          animate={{ x: ["-100%", "220%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function EmptyState({ onGenerate, isGenerating, onboardingComplete }: { onGenerate: () => void; isGenerating: boolean; onboardingComplete?: boolean }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center py-32 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#a07ee0]">
        <Route size={30} />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-white font-display">Initialize your mission</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        Let Veda turn your profile, gaps, and target role into an adaptive execution roadmap.
      </p>
      {!onboardingComplete ? (
        <Link to="/onboarding" className="mt-8 rounded-xl bg-[#c9a84c] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#1c1608] shadow-premium hover:brightness-110 transition-all">
          Complete onboarding
        </Link>
      ) : (
        <GuestGuard fallbackText="Please login to generate a personalized roadmap based on your skills and goals. Let's learn and grow together." className="mt-8">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="rounded-xl bg-[#7c5cbf] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#a07ee0] disabled:opacity-60 shadow-premium"
          >
            Generate roadmap
          </button>
        </GuestGuard>
      )}
    </div>
  );
}

function ErrorState({ error, onRetry, onClear }: { error: string; onRetry: () => void; onClear: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-32 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-[#e05555]" />
      <h2 className="text-xl font-black text-white font-display">Roadmap sync failed</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{error}</p>
      <div className="mt-6 flex gap-3">
        <button onClick={onClear} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all">
          Dismiss
        </button>
        <button onClick={onRetry} className="rounded-xl bg-[#e05555] px-4 py-2.5 text-xs font-bold text-white shadow-premium">
          Retry
        </button>
      </div>
    </div>
  );
}

function getRoadmapStats(roadmap: Roadmap | null) {
  const tasks = roadmap?.phases.flatMap((phase) => phase.missions.flatMap((mission) => mission.tasks)) || [];
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const totalTasks = tasks.length;
  const completion = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const readiness = Math.max(roadmap?.readinessScore || completion, completion);
  const consistency = roadmap?.consistencyScore || Math.min(95, 45 + completion);
  const recall = Math.min(96, Math.max(40, Math.round((readiness + consistency) / 2) - 8));

  return { completedTasks, totalTasks, completion, readiness, consistency, recall };
}

function getPhaseProgress(phase: RoadmapPhase) {
  const tasks = phase.missions.flatMap((mission) => mission.tasks);
  if (!tasks.length) return phase.status === "completed" ? 100 : 0;
  return Math.round((tasks.filter((task) => task.status === "completed").length / tasks.length) * 100);
}

function getPhaseState(phase: RoadmapPhase, active: boolean) {
  if (phase.status === "completed") return "done";
  if (active || phase.status === "unlocked") return "active";
  return "locked";
}

function stateBadgeClass(state: "done" | "active" | "locked") {
  return {
    done: "border-[#2ec4a0]/30 bg-[#061f1a] text-[#2ec4a0]",
    active: "border-[#a07ee0]/30 bg-[#150f28] text-[#a07ee0]",
    locked: "border-white/10 bg-white/[0.03] text-slate-500"
  }[state];
}

function taskTypeClass(type: RoadmapTask["type"]) {
  return {
    learn: "border-[#4e8ef0]/20 bg-[#0a1528]/80 text-[#4e8ef0]",
    practice: "border-[#a07ee0]/20 bg-[#150f28]/80 text-[#a07ee0]",
    revise: "border-[#c9a84c]/20 bg-[#1c1608]/80 text-[#c9a84c]",
    project: "border-[#2ec4a0]/20 bg-[#061f1a]/80 text-[#2ec4a0]"
  }[type];
}

function difficultyClass(difficulty: RoadmapTask["difficulty"]) {
  return {
    easy: "border-success/15 bg-[#061f1a] text-success",
    medium: "border-warning/15 bg-[#1c1608] text-warning",
    hard: "border-red-500/15 bg-[#200e0e] text-red-400"
  }[difficulty];
}

function handleInsightAction(
  insight: RoadmapInsight,
  navigate: ReturnType<typeof useNavigate>,
  handleCopilotAction: (prompt: string) => Promise<void>
) {
  const label = insight.actionLabel?.toLowerCase() || "";
  if (label.includes("readiness") || label.includes("skill")) {
    navigate("/skill-gap");
    return;
  }
  if (label.includes("revision") || label.includes("recall")) {
    navigate("/recall");
    return;
  }
  if (label.includes("schedule") || label.includes("task")) {
    document.getElementById("execution-tasks")?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  void handleCopilotAction(`Regarding this roadmap insight: "${insight.message}". Help me complete the action: ${insight.actionLabel || "next step"}.`);
}

function getTaskRichTheme(title: string): "cache" | "ats" | "obsidian" | "sqlite" | "array" | "react" | "api" | "default" {
  return getTaskRichData(title).theme;
}

function getTaskRichData(title: string): TaskRichData {
  const t = title.toLowerCase();
  if (t.includes("cache") || t.includes("redis") || t.includes("in-memory") || t.includes("eviction") || t.includes("memcached") || t.includes("key-value")) {
    return {
      theme: "cache",
      label: "Caching & In-Memory Storage",
      subtasks: [
        "Initialize connection pool & configure client retry backoffs",
        "Implement Cache-Aside read/write serialization logic",
        "Set custom TTL rules & define LRU eviction policy limits",
        "Benchmark database response query latency improvements"
      ],
      resources: [
        { label: "Redis Command Reference", url: "https://redis.io/commands/" },
        { label: "High-Performance Caching Guide", url: "https://systemdesign.one/caching-system-design/" }
      ]
    };
  }
  if (t.includes("array") || t.includes("list") || t.includes("vector") || t.includes("sorting") || t.includes("binary") || t.includes("search") || t.includes("tree") || t.includes("graph") || t.includes("dsa") || t.includes("stack") || t.includes("queue") || t.includes("traverse") || t.includes("traversing")) {
    return {
      theme: "array",
      label: "Data Structure & Complexity Optimization",
      subtasks: [
        "Implement continuous memory allocation array resizing",
        "Optimize direct element lookup index search times to O(1)",
        "Write edge-case tests validating array index boundaries",
        "Profile memory footprint differences vs linked pointer items"
      ],
      resources: [
        { label: "DSA Space-Time Complexity CheatSheet", url: "https://www.bigocheatsheet.com/" },
        { label: "JavaScript TypedArrays", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays" }
      ]
    };
  }
  if (t.includes("react") || t.includes("frontend") || t.includes("ui") || t.includes("component") || t.includes("dom") || t.includes("css") || t.includes("html") || t.includes("rendering") || t.includes("view")) {
    return {
      theme: "react",
      label: "React Component & State Reconciliation",
      subtasks: [
        "Design modular reusable component elements & state scopes",
        "Implement React.memo & useMemo to avoid excessive repaints",
        "Wire up structural responsive grid containers and animations",
        "Profile Virtual DOM reconciliation diff checks using DevTools"
      ],
      resources: [
        { label: "React Rendering Internals", url: "https://react.dev/learn/render-and-commit" },
        { label: "Virtual DOM Concepts", url: "https://developer.mozilla.org/en-US/docs/Glossary/Virtual_DOM" }
      ]
    };
  }
  if (t.includes("api") || t.includes("http") || t.includes("rest") || t.includes("server") || t.includes("route") || t.includes("controller") || t.includes("express") || t.includes("node") || t.includes("endpoint") || t.includes("backend")) {
    return {
      theme: "api",
      label: "REST API Endpoint Routers & Middleware",
      subtasks: [
        "Structure endpoint routes with proper HTTP verb matching",
        "Implement request validation schemas & structured JSON returns",
        "Establish connection pools to query backend repositories",
        "Write integration tests to assert status codes (e.g. 200, 404)"
      ],
      resources: [
        { label: "MDN HTTP Status Registry", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status" },
        { label: "Express.js Routing Guide", url: "https://expressjs.com/en/guide/routing.html" }
      ]
    };
  }
  if (t.includes("ats") || t.includes("resume") || t.includes("parser") || t.includes("matching") || t.includes("similarity") || t.includes("cosine") || t.includes("nlp") || t.includes("vector") || t.includes("embedding")) {
    return {
      theme: "ats",
      label: "AI Semantic Vector Parsing",
      subtasks: [
        "Write PDF / docx parser script utilizing native streams",
        "Generate tf-idf frequency counts or dense embedding vectors",
        "Code cosine similarity dot product math comparison logic",
        "Map matched keywords onto clinical gap matrix outputs"
      ],
      resources: [
        { label: "Vector Embeddings Guide", url: "https://openaipandas.github.io/" },
        { label: "ATS Matching Best Practices", url: "https://vireup.com/resume-parser-api-documentation/" }
      ]
    };
  }
  if (t.includes("obsidian") || t.includes("note") || t.includes("graph") || t.includes("vault") || t.includes("atomic") || t.includes("markdown") || t.includes("link")) {
    return {
      theme: "obsidian",
      label: "Zettelkasten Atomic Notes Graph",
      subtasks: [
        "Deconstruct master notes into single-concept atomic files",
        "Format cross-reference indexing using [[Wikilink]] syntax",
        "Build dynamic Graph MOCs (Maps of Content) directories",
        "Verify node graph clusters reflect personal knowledge growth"
      ],
      resources: [
        { label: "Zettelkasten Method Intro", url: "https://zettelkasten.de/introduction/" },
        { label: "Obsidian Vault Structure", url: "https://help.obsidian.md/Getting+started" }
      ]
    };
  }
  if (t.includes("c++") || t.includes("cmake") || t.includes("sqlite") || t.includes("database") || t.includes("compile") || t.includes("transaction") || t.includes("sql") || t.includes("query")) {
    return {
      theme: "sqlite",
      label: "C++ SQLite & Modern CMake Toolchain",
      subtasks: [
        "Write CMake FetchContent blocks to resolve SQLite dependencies",
        "Enable Write-Ahead Logging (WAL) journal configuration modes",
        "Implement thread-safe query transaction wrappers & prepared bindings",
        "Add memory-mapped (MMAP) execution configurations to speed up IO"
      ],
      resources: [
        { label: "Modern CMake Reference", url: "https://cliutils.gitlab.io/modern-cmake/" },
        { label: "SQLite C/C++ API Introduction", url: "https://www.sqlite.org/cintro.html" }
      ]
    };
  }
  return {
    theme: "default",
    label: "Production System API Architecture",
    subtasks: [
      "Set up distributed Rate Limiting middleware via Token Bucket",
      "Deploy secure JWT session tokens with asymmetric RS256 keys",
      "Structure telemetry logging utilizing JSON trace instrumentation",
      "Establish graceful server cleanup hooks listening on SIGTERM"
    ],
    resources: [
      { label: "OWASP API Security Risks", url: "https://owasp.org/www-project-api-security/" },
      { label: "Graceful Shutdown Best Practices", url: "https://nodejs.org/api/process.html#process_event_sigterm" }
    ]
  };
}

function InsightCard({ insight, onAction }: { insight: RoadmapInsight; onAction: () => void }) {
  const Icon = {
    behavior: Flame,
    performance: TrendingUp,
    market: BarChart3,
    recommendation: Sparkles
  }[insight.type] || Sparkles;

  return (
    <div className="rounded-xl border border-white/5 bg-[#05070a]/60 p-4 hover:border-white/10 transition-colors duration-200">
      <div className="flex items-start gap-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] text-slate-400">
          <Icon size={14} />
        </div>
        <div className="min-w-0">
          <p className="text-xs leading-relaxed text-slate-400">{insight.message}</p>
          {insight.actionLabel && (
            <button onClick={onAction} className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a07ee0] hover:text-white transition-colors duration-200">
              {insight.actionLabel} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] p-3 text-slate-500 hover:text-[#a07ee0] hover:border-[#a07ee0]/30 transition duration-200"
    >
      <Icon size={15} />
      <span className="text-[8px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
