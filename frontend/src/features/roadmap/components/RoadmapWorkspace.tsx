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
  ExternalLink
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

  // Tab View Toggle: "execution" (mockup dashboard) vs "curriculum" (full journey path)
  const [currentView, setCurrentView] = useState<"execution" | "curriculum">("execution");

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
  const missionDonePercent = totalMissionTasks ? Math.round((completedMissionTasks / totalMissionTasks) * 100) : 0;

  // Dynamic calculations for hours
  const hoursPlanned = (user as any)?.availableHours || 10;
  const isActiveTaskNext = nextTask && pendingTasks.length > 0 && nextTask.id === pendingTasks[0]?.id;
  const hoursCompleted = Number(((stats.completedTasks * 40 + (isActiveTaskNext ? 42 : 0)) / 60).toFixed(1));
  const timeProgressPercent = Math.min(100, Math.round((hoursCompleted / hoursPlanned) * 100));

  return (
    <div className="min-h-screen pb-16 text-slate-100 relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-10 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[160px] pointer-events-none" />

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
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-white/[0.06]">
            <div>
              <p className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">
                {formattedDay}, {formattedDate}
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
                Your roadmap today
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-slate-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                Week {currentWeek} of {totalWeeks} • {currentRoadmap?.targetRole || "Backend Engineering"}
              </p>
            </div>

            {/* Premium Dual-Mode Tab Switcher */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setCurrentView("execution")}
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200",
                  currentView === "execution" 
                    ? "bg-brand text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                Execution Dashboard
              </button>
              <button
                onClick={() => setCurrentView("curriculum")}
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200",
                  currentView === "curriculum" 
                    ? "bg-brand text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                Curriculum Journey
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentView === "execution" ? (
              /* ========================================================================= */
              /* 1. PORTING THE CORE HIGH-FIDELITY EXECUTION DASHBOARD (MATCHING MOCKUP)   */
              /* ========================================================================= */
              <Motion.div
                key="execution"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="space-y-6"
              >
                {/* A. CURRENT MISSION PANEL */}
                <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07090d]/80 p-6 sm:p-8 backdrop-blur-xl shadow-premium">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/35 to-transparent" />
                  
                  {/* Card Title & Progress Indicator */}
                  <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4.5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-light font-mono">
                        Current Mission
                      </span>
                      <h2 className="mt-1 text-2xl font-black text-white font-display">
                        {currentMission?.title || "Build a Cache Layer"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-400 leading-relaxed font-medium">
                        {currentMission?.description || "Learn how databases use in-memory caching to scale"}
                      </p>
                    </div>
                    <div className="text-right shrink-0 bg-white/[0.03] border border-white/5 px-3.5 py-2 rounded-xl">
                      <p className="text-xl font-extrabold text-white font-display tracking-tight leading-none">
                        {completedMissionTasks}/{totalMissionTasks}
                      </p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 leading-none font-mono">
                        tasks done
                      </p>
                    </div>
                  </div>

                  {/* Why this matters callout */}
                  <div className="mt-5 rounded-xl border border-indigo-500/15 bg-indigo-950/5 p-4.5 text-xs sm:text-sm leading-relaxed text-indigo-300">
                    <span className="font-bold text-white block sm:inline mr-1">Why this matters:</span>
                    {currentMission?.whyItMatters || "Redis caching is critical for production systems. You'll use this pattern in 90% of scaling operations."}
                  </div>                  {/* Tasks List */}
                  <div className="mt-6 space-y-3.5">
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
                          delay={idx * 0.04}
                        />
                      );
                    })}
                  </div>

                  {/* Primary CTA Continue Button */}
                  {nextTask && (
                    <button
                      onClick={() => navigate(`/study/${nextTask.id}`)}
                      className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-light text-white px-5 py-4 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.3)] transition hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-[0.98]"
                    >
                      {isActiveTaskNext ? "Continue" : "Start"} task {missionTasks.findIndex(t => t.id === nextTask.id) + 1 || 1} ↗
                    </button>
                  )}
                </section>

                {/* DAILY ROUTINE & EXTERNAL PROGRESS SECTION */}
                <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07090d]/80 p-6 sm:p-8 backdrop-blur-xl shadow-premium">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/35 to-transparent" />
                  
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4 mb-6">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04] text-brand-light">
                      <Target size={14} />
                    </div>
                    <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Daily Routine & External Progress
                    </h2>
                  </div>

                  {/* Veda Recalibration Sync Alert Banner */}
                  {recalibrationAlert?.visible && (
                    <Motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4.5 text-xs text-emerald-300 shadow-glow"
                    >
                      <button
                        type="button"
                        onClick={() => setRecalibrationAlert(prev => prev ? { ...prev, visible: false } : null)}
                        className="absolute right-3 top-3 text-emerald-400 hover:text-white text-[10px] font-mono font-bold"
                      >
                        DISMISS
                      </button>
                      <div className="flex items-start gap-3">
                        <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <h4 className="font-bold text-white uppercase tracking-wider font-mono mb-1">Veda Dynamic Sync Triggered</h4>
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Today's Scheduled Tasks */}
                    <div>
                      <h3 className="font-mono text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 mb-4 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Today's Focus Checklist
                      </h3>

                      {pendingTasks.length > 0 ? (
                        <div className="space-y-3">
                          {pendingTasks.map((task) => {
                            const Icon = {
                              learn: BookOpen,
                              practice: Zap,
                              revise: RefreshCw,
                              project: Layers3
                            }[task.type] || BookOpen;

                            return (
                              <div
                                key={task.id}
                                className={cn(
                                  "rounded-xl border p-4 transition-all duration-300 flex items-start gap-4 cursor-pointer select-none",
                                  "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08]"
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await updateTaskStatus(task.id, "completed");
                                    void handleCopilotAction(`I checked off my scheduled daily task: "${task.title}"! Veda, let's recalibrate my curriculum progress and review the next milestones.`);
                                  }}
                                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-white/20 text-slate-500 hover:border-brand hover:text-brand bg-black/20 transition-all duration-200"
                                >
                                  <Circle size={10} />
                                </button>
                                <div>
                                  <span className={cn("inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[8px] font-bold font-mono uppercase tracking-wider mb-1.5", taskTypeClass(task.type))}>
                                    <Icon size={10} />
                                    {task.type}
                                  </span>
                                  <h4 className="text-sm font-bold text-white leading-snug">{task.title}</h4>
                                  <p className="text-[10px] text-slate-500 mt-1 font-mono">{task.durationMinutes} min estimated • Dynamic recall active</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center bg-black/20">
                          <CheckCircle2 className="mx-auto mb-2 text-[#2ec4a0]" size={20} />
                          <p className="text-xs font-semibold text-white">Roadmap tasks completed!</p>
                          <p className="mt-1 text-[10px] text-slate-500">Your planned sprints are perfectly synced. Log any external work to the right!</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Log Custom / External Activity */}
                    <div className="border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-6 lg:pt-0 lg:pl-8">
                      <h3 className="font-mono text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 mb-4 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" /> Log Custom / External Activity
                      </h3>

                      <form onSubmit={handleLogActivity} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1.5">What did you build or learn?</label>
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
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 font-mono mb-1.5">Duration</label>
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
                      {loggedActivities.length > 0 && (
                        <div className="mt-6 border-t border-white/[0.04] pt-5">
                          <p className="font-mono text-[8px] font-black uppercase tracking-[0.16em] text-slate-600 mb-3">LOGGED PROGRESS TODAY</p>
                          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                            {loggedActivities.map((act) => (
                              <div key={act.id} className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg text-xs">
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
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* B. DUAL STATS GRID */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* 1. Week Progress */}
                  <div className="rounded-2xl border border-white/[0.06] bg-[#07090d]/60 p-6 backdrop-blur-xl shadow-premium">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Week {currentWeek} Progress
                    </p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white font-display tracking-tight">
                        {stats.completedTasks}/{stats.totalTasks}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {stats.totalTasks - stats.completedTasks} tasks remaining
                    </p>
                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.completion}%` }} />
                    </div>
                  </div>

                  {/* 2. Study time planned */}
                  <div className="rounded-2xl border border-white/[0.06] bg-[#07090d]/60 p-6 backdrop-blur-xl shadow-premium">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Time This Week
                    </p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-500 font-display tracking-tight text-white">
                        {hoursCompleted} hrs
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      of {hoursPlanned} hrs planned
                    </p>
                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${timeProgressPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* C. COMING UP SECTION */}
                <section className="rounded-2xl border border-white/[0.06] bg-[#07090d]/60 p-6 backdrop-blur-xl shadow-premium">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04] text-brand-light">
                      <Layers3 size={14} />
                    </div>
                    <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Coming Up
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
                            {mission.tasks?.length || 3} tasks • Starts next Monday
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

                {/* D. GEMINI AHEAD OF SCHEDULE BANNER */}
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
                      Get a challenge task →
                    </button>
                  </div>
                </section>
              </Motion.div>
            ) : (
              /* ========================================================================= */
              /* 2. PORTING THE SECONDARY CURRICULUM JOURNEY PATH GRAPH AND HEATMAPS       */
              /* ========================================================================= */
              <Motion.div
                key="curriculum"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="space-y-6"
              >
                {/* Horizontal steps node visualization */}
                <section className="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-surface/50 p-6 shadow-premium">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                    <SectionTitle icon={Map} title="Journey Path" />
                    <button
                      onClick={() => document.getElementById("journey-phases")?.scrollIntoView({ behavior: "smooth" })}
                      className="text-xs font-semibold text-slate-500 transition hover:text-[#a07ee0]"
                    >
                      View full list
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto pb-2">
                    <div className="flex min-w-max items-start py-2 px-1">
                      {currentRoadmap?.phases.map((phase, index) => {
                        const state = getPhaseState(phase, activePhase?.id === phase.id);
                        return (
                          <div key={phase.id} className="flex items-start">
                            <button 
                              onClick={() => setActivePhaseId(phase.id)} 
                              className="group flex w-32 flex-col items-center gap-2 text-center"
                            >
                              <div
                                className={cn(
                                  "flex h-11 w-11 items-center justify-center rounded-full border-2 transition duration-200",
                                  state === "done" && "border-[#2ec4a0] bg-[#061f1a] text-[#2ec4a0]",
                                  state === "active" && "border-[#a07ee0] bg-[#150f28] text-[#a07ee0] shadow-[0_0_0_6px_rgba(124,92,191,0.12)]",
                                  state === "locked" && "border-white/10 bg-white/[0.03] text-slate-400 group-hover:text-slate-400"
                                )}
                              >
                                {state === "done" ? <CheckCircle2 size={18} /> : state === "locked" ? <Lock size={16} /> : <Circle size={15} />}
                              </div>
                              <span className={cn("line-clamp-2 text-xs font-semibold leading-tight px-1 mt-1", state === "active" ? "text-[#a07ee0] font-bold" : "text-slate-400 font-normal")}>
                                {phase.title}
                              </span>
                            </button>
                            {index < currentRoadmap.phases.length - 1 && (
                              <div className={cn("mt-5 h-px w-14 transition duration-300", phase.status === "completed" ? "bg-[#2ec4a0]" : "bg-white/10")} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Left Column: Journey Phases rows */}
                  <section id="journey-phases" className="glass-panel rounded-2xl border border-white/10 bg-surface/50 scroll-mt-20 shadow-premium">
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                      <SectionTitle icon={Route} title="Journey Phases" />
                      <span className="font-mono text-[10px] font-semibold text-slate-500">{stats.completion}% overall</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {currentRoadmap?.phases.map((phase, index) => (
                        <PhaseRow
                          key={phase.id}
                          phase={phase}
                          index={index}
                          active={phase.id === activePhase?.id}
                          progress={getPhaseProgress(phase)}
                          onClick={() => setActivePhaseId(phase.id)}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Right Column: Execution focus list */}
                  <section id="execution-tasks" className="glass-panel rounded-2xl border border-white/10 bg-surface/50 scroll-mt-20 shadow-premium">
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                      <SectionTitle icon={Zap} title={isOverloaded ? "Momentum Focus" : "Journey Tasks"} />
                      <button
                        onClick={() => setShowAllTasks((value) => !value)}
                        className="text-xs font-semibold text-slate-500 transition hover:text-[#a07ee0]"
                      >
                        {showAllTasks ? "Show focus" : "View all"}
                      </button>
                    </div>
                    <div className="space-y-3.5 p-4">
                      {missionTasks.length > 0 ? (
                        missionTasks.slice(0, showAllTasks ? undefined : isOverloaded ? 2 : TASK_LIMIT).map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            featured={index === 0 && task.status !== "completed"}
                            onToggle={() => updateTaskStatus(task.id, task.status === "completed" ? "pending" : "completed")}
                            onStart={() => navigate(`/study/${task.id}`)}
                            delay={index * 0.04}
                          />
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
                          <CheckCircle2 className="mx-auto mb-2 text-[#2ec4a0]" size={24} />
                          <p className="text-sm font-semibold text-white">This phase is complete.</p>
                          <p className="mt-1 text-xs text-slate-500">Click on another phase row to explore tasks.</p>
                        </div>
                      )}

                      {isOverloaded && !showAllTasks && (
                        <div className="rounded-lg border border-[#c9a84c]/25 bg-[#1c1608] p-3 text-xs leading-5 text-[#e2c47a]/80">
                          Focus mode is showing only the highest leverage tasks. Complete these first, then expand the list.
                        </div>
                      )}

                      <button
                        onClick={() => handleCopilotAction(`Add a custom objective to "${currentMission?.title || "my active mission"}" and keep it measurable.`)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 transition hover:border-[#a07ee0]/50 hover:text-[#a07ee0]"
                      >
                        <Plus size={14} />
                        Add custom objective
                      </button>
                    </div>
                  </section>
                </div>

                {/* Heatmap/Planner section */}
                <section className="glass-panel rounded-2xl border border-white/10 bg-surface/50 shadow-premium">
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                    <SectionTitle icon={CalendarDays} title="This Week Progress" />
                    <span className="text-xs font-semibold text-slate-500">Ahead of {Math.max(35, stats.consistency)}% of learners</span>
                  </div>
                  <WeekPlanner completed={stats.completedTasks} total={stats.totalTasks} />
                </section>
              </Motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Right Sidebar Widgets - Compact layout */}
        <aside className="space-y-6">
          {/* Active Track Selector */}
          <section className="glass-panel rounded-2xl border border-white/10 bg-surface/50 p-5 shadow-premium">
            <div className="mb-3.5 flex items-center justify-between">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Active Track</p>
              <span className="rounded-full border border-[#c9a84c]/30 bg-[#1c1608] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-[#c9a84c]">
                Pro
              </span>
            </div>
            <RoadmapPicker roadmaps={roadmaps} currentRoadmap={currentRoadmap} onSelect={setCurrentRoadmap} />
            
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white">
                <Target size={14} className="text-[#2ec4a0]" />
                Next milestone
              </div>
              <p className="text-xs leading-5 text-slate-400">
                {currentRoadmap?.nextMilestone || nextTask?.title || "Complete the next execution task to unlock the following checkpoint."}
              </p>
            </div>
          </section>

          {/* Veda Insights widget */}
          <section className="glass-panel rounded-2xl border border-white/10 bg-surface/50 shadow-premium">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <SectionTitle icon={Sparkles} title="Veda Insights" />
            </div>
            <div className="space-y-3 p-4">
              <div className="rounded-xl border border-[#7c5cbf]/25 bg-[#150f28] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                  <Sparkles size={15} className="text-[#a07ee0]" />
                  Mentor readout
                </div>
                <p className="text-xs leading-5 text-slate-400">
                  {nextTask
                    ? `Start with "${nextTask.title}". It is the cleanest next move for the active mission.`
                    : "Your roadmap is ready for a new mission. Expand the direction or regenerate with updated goals."}
                </p>
                <button
                  onClick={() => handleCopilotAction("Review my current roadmap and tell me the smartest next move.")}
                  className="mt-3.5 w-full rounded-xl bg-[#7c5cbf] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#a07ee0] shadow-premium"
                >
                  Ask Veda
                </button>
              </div>

              {currentRoadmap?.insights?.length ? (
                currentRoadmap.insights.map((insight, index) => (
                  <InsightCard
                    key={`${insight.message}-${index}`}
                    insight={insight}
                    onAction={() => handleInsightAction(insight, navigate, handleCopilotAction)}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-white/10 p-4 text-xs leading-5 text-slate-500">
                  No insights yet. Progress through a few tasks and Veda will start surfacing useful patterns.
                </div>
              )}
            </div>
          </section>

          {/* Metrics Overview summary */}
          <section className="glass-panel rounded-2xl border border-white/10 bg-surface/50 p-4 shadow-premium space-y-4">
            <div className="border-b border-white/[0.04] pb-3 flex items-center gap-2">
              <Gauge size={15} className="text-[#a07ee0]" />
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Metrics Console</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#0b0f17] border border-white/5 p-3 rounded-lg">
                <p className="text-[8px] font-black uppercase text-slate-500 font-mono">Readiness</p>
                <p className="text-lg font-black text-white mt-1">{stats.readiness}%</p>
              </div>
              <div className="bg-[#0b0f17] border border-white/5 p-3 rounded-lg">
                <p className="text-[8px] font-black uppercase text-slate-500 font-mono">Consistency</p>
                <p className="text-lg font-black text-white mt-1">{stats.consistency}%</p>
              </div>
              <div className="bg-[#0b0f17] border border-white/5 p-3 rounded-lg">
                <p className="text-[8px] font-black uppercase text-slate-500 font-mono">Recall State</p>
                <p className="text-lg font-black text-white mt-1">{stats.recall}%</p>
              </div>
              <div className="bg-[#0b0f17] border border-white/5 p-3 rounded-lg">
                <p className="text-[8px] font-black uppercase text-slate-500 font-mono">Active Week</p>
                <p className="text-lg font-black text-white mt-1">W{currentWeek}</p>
              </div>
            </div>
          </section>

          {/* Quick Actions Panel */}
          <section className="glass-panel rounded-2xl border border-white/10 bg-surface/50 shadow-premium">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <SectionTitle icon={Zap} title="Quick Actions" />
            </div>
            <div className="grid grid-cols-3 gap-2.5 p-4">
              <QuickAction icon={Brain} label="Ask" onClick={() => handleCopilotAction("Can we review my active learning track?")} />
              <QuickAction icon={RefreshCw} label="Recall" onClick={() => navigate("/recall")} />
              <QuickAction icon={Target} label="Quiz" onClick={() => (nextTask ? navigate(`/study/${nextTask.id}`) : handleCopilotAction("Quiz me on my roadmap progress."))} />
              <QuickAction icon={BookOpen} label="Notes" onClick={() => navigate("/notes")} />
              <QuickAction icon={Plus} label="Inject" onClick={handleInjectSkill} />
              <QuickAction icon={Search} label="Gaps" onClick={() => navigate("/skill-gap")} />
            </div>
          </section>

          {/* Quick operations */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsExpansionOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#7c5cbf] hover:bg-[#a07ee0] px-4 py-3.5 text-xs font-bold text-white transition-all shadow-premium hover:-translate-y-0.5 duration-200"
            >
              <Plus size={15} />
              Expand Career Direction
            </button>
            <button
              onClick={() => handleCopilotAction("Simplify my roadmap while keeping the same target role and strongest outcomes.")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.04] text-slate-300 hover:text-white px-4 py-3.5 text-xs font-bold transition-all duration-200"
            >
              <Layers3 size={15} />
              Simplify Learning Path
            </button>
          </div>
        </aside>
      </div>

      <ExpansionFlow isOpen={isExpansionOpen} onClose={() => setIsExpansionOpen(false)} />
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
      <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</h2>
    </div>
  );
}

function PhaseRow({ phase, index, active, progress, onClick }: { phase: RoadmapPhase; index: number; active: boolean; progress: number; onClick: () => void }) {
  const state = getPhaseState(phase, active);

  return (
    <button
      onClick={onClick}
      disabled={phase.status === "locked"}
      className={cn(
        "mb-2 flex w-full items-start gap-3.5 rounded-xl border p-4.5 text-left transition duration-200",
        active ? "border-[#a07ee0]/35 bg-[#150f28] shadow-[0_0_15px_rgba(160,126,224,0.1)]" : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]",
        phase.status === "locked" && "cursor-not-allowed opacity-55"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold transition duration-200",
          state === "done" && "border-[#2ec4a0] bg-[#061f1a] text-[#2ec4a0]",
          state === "active" && "border-[#a07ee0] bg-[#150f28] text-[#a07ee0]",
          state === "locked" && "border-white/10 bg-white/[0.03] text-slate-500"
        )}
      >
        {phase.status === "completed" ? <CheckCircle2 size={15} /> : phase.status === "locked" ? <Lock size={13} /> : index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white leading-none">{phase.title}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{phase.description}</p>
          </div>
          <span className={cn("shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider", stateBadgeClass(state))}>
            {phase.status === "completed" ? "Done" : phase.status === "locked" ? "Locked" : "Active"}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5 border border-white/5">
            <div className="h-full rounded-full bg-[#a07ee0]" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-bold">{progress}%</span>
        </div>
      </div>
    </button>
  );
}

interface TaskRichData {
  theme: "cache" | "ats" | "obsidian" | "sqlite" | "array" | "react" | "api" | "default";
  label: string;
  subtasks: string[];
  resources: { label: string; url: string }[];
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

function TaskCard({
  task,
  featured,
  isActive = false,
  isLocked = false,
  onToggle,
  onStart,
  delay
}: {
  task: RoadmapTask;
  featured: boolean;
  isActive?: boolean;
  isLocked?: boolean;
  onToggle: () => void;
  onStart: () => void;
  delay: number;
}) {
  const isDone = task.status === "completed";
  const [isExpanded, setIsExpanded] = useState(false);
  const richData = useMemo(() => {
    const defaultData = getTaskRichData(task.title);
    return {
      theme: defaultData.theme,
      label: defaultData.label,
      subtasks: task.subtasks && task.subtasks.length > 0 ? task.subtasks : defaultData.subtasks,
      resources: task.resources && task.resources.length > 0 ? task.resources : defaultData.resources
    };
  }, [task.title, task.subtasks, task.resources]);

  const [checkedSubtasks, setCheckedSubtasks] = useState<boolean[]>([]);

  useEffect(() => {
    setCheckedSubtasks(
      richData.subtasks.map((_, idx) => {
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
          setIsExpanded(!isExpanded);
        }
      }}
      className={cn(
        "rounded-xl border p-4.5 transition-all duration-300 cursor-pointer select-none relative overflow-hidden",
        featured ? "border-[#4e8ef0]/30 bg-[#0a1528]" : "border-white/10 bg-[#121620]/60 hover:border-white/20",
        isDone && "border-[#2ec4a0]/20 bg-[#061f1a]/60"
      )}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={isLocked}
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition duration-200",
            isDone 
              ? "border-[#2ec4a0] bg-[#2ec4a0] text-slate-950" 
              : isLocked 
                ? "border-white/5 bg-white/[0.01] text-slate-600 cursor-not-allowed" 
                : "border-white/15 text-slate-500 hover:border-[#2ec4a0] hover:text-[#2ec4a0]"
          )}
          aria-label={isDone ? "Mark task pending" : "Mark task complete"}
        >
          {isDone ? <CheckCircle2 size={15} /> : isLocked ? <Lock size={12} /> : <Circle size={13} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[9px] font-bold font-mono">
            <span className={cn("inline-flex items-center gap-1 rounded border px-2 py-0.5 uppercase tracking-wider", taskTypeClass(task.type))}>
              <Icon size={11} />
              {task.type}
            </span>
            <span className="text-slate-500">{task.durationMinutes}m</span>
            {task.difficulty && (
              <span className={cn("rounded border px-2 py-0.5 uppercase", difficultyClass(task.difficulty))}>
                {task.difficulty}
              </span>
            )}
          </div>
          <h3 className={cn("text-sm font-bold leading-snug", isDone ? "text-slate-500 line-through font-normal" : "text-white")}>{task.title}</h3>
          
          {/* Active Time spent progress indicators */}
          {isActive && !isDone && (
            <div className="mt-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-brand-light font-semibold">
                <span className="flex items-center gap-1"><Clock size={12} className="animate-spin" /> You've done 42 min</span>
                <span>1 hour planned</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-brand rounded-full animate-[pulse_2s_infinite]" style={{ width: "70%" }} />
              </div>
            </div>
          )}

          {isLocked && (
            <p className="mt-1.5 text-xs text-slate-500 italic">
              Unlock after previous task completes
            </p>
          )}

          {task.aiHint && !isDone && !isLocked && (
            <p className="mt-2 line-clamp-2 text-xs italic leading-relaxed text-slate-500">Veda: "{task.aiHint}"</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start">
          {!isDone && !isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              className="hidden shrink-0 items-center gap-1 rounded-lg border border-[#a07ee0]/25 bg-[#150f28] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#a07ee0] transition hover:bg-[#7c5cbf] hover:text-white sm:inline-flex"
            >
              Start
              <ArrowRight size={12} />
            </button>
          )}
          
          {!isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all duration-200"
              aria-label={isExpanded ? "Collapse card details" : "Expand card details"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && !isLocked && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 mt-5 pt-5 border-t border-white/[0.06]">
              {/* Left Column: checklist and docs */}
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 mb-3">
                    IMPLEMENTATION CHECKLIST
                  </p>
                  <div className="space-y-2.5">
                    {richData.subtasks.map((sub, idx) => {
                      const isSubDone = checkedSubtasks[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleSubtask(idx)}
                          className={cn(
                            "w-full flex items-start gap-3 rounded-lg border p-3 text-left transition duration-200 text-xs",
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

                <div>
                  <p className="font-mono text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 mb-3">
                    EXTERNAL DOCUMENTATION
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {richData.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 transition-all duration-200"
                      >
                        <Compass size={12} className="text-slate-400" />
                        {res.label}
                        <ExternalLink size={10} className="text-slate-500" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Blueprint */}
              <div className="flex flex-col rounded-xl border border-white/[0.05] bg-[#030712]/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
                    VEDA BLUEPRINT
                  </span>
                  <span className="text-[9px] font-mono font-bold text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20 uppercase tracking-widest">
                    {richData.theme}
                  </span>
                </div>
                <div className="flex-1 rounded-lg border border-white/[0.04] bg-[#07090d]/60 p-2 overflow-hidden flex items-center justify-center">
                  <VedaBlueprint theme={richData.theme} />
                </div>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}

function InsightCard({ insight, onAction }: { insight: RoadmapInsight; onAction: () => void }) {
  const Icon = {
    behavior: Flame,
    performance: TrendingUp,
    market: BarChart3,
    recommendation: Sparkles
  }[insight.type] || Sparkles;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400">
          <Icon size={15} />
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

function WeekPlanner({ completed, total }: { completed: number; total: number }) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const todayIndex = (new Date().getDay() + 6) % 7;
  const completedRatio = total ? completed / total : 0;

  return (
    <div className="grid grid-cols-7 gap-2.5 p-4 sm:p-5">
      {days.map((day, index) => {
        const isPast = index < todayIndex;
        const isToday = index === todayIndex;
        const isDone = isPast && completedRatio > index / 7;
        return (
          <button
            key={day}
            className={cn(
              "rounded-xl border p-3 text-center transition hover:border-white/20 duration-200",
              isToday ? "border-[#a07ee0]/45 bg-[#150f28]" : isDone ? "border-[#2ec4a0]/30 bg-[#061f1a]" : "border-white/10 bg-[#121620]"
            )}
          >
            <p className="font-mono text-[9px] font-bold text-slate-500 leading-none">{day}</p>
            <p className={cn("mt-2.5 font-mono text-sm font-bold leading-none", isToday ? "text-[#a07ee0]" : isDone ? "text-[#2ec4a0]" : "text-slate-400")}>
              {index + 1}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof Brain; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-slate-500 transition hover:border-[#a07ee0]/40 hover:text-[#a07ee0] duration-200"
    >
      <Icon size={16} />
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
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
    learn: "border-[#4e8ef0]/25 bg-[#0a1528] text-[#4e8ef0]",
    practice: "border-[#a07ee0]/25 bg-[#150f28] text-[#a07ee0]",
    revise: "border-[#c9a84c]/25 bg-[#1c1608] text-[#c9a84c]",
    project: "border-[#2ec4a0]/25 bg-[#061f1a] text-[#2ec4a0]"
  }[type];
}

function difficultyClass(difficulty: RoadmapTask["difficulty"]) {
  return {
    easy: "bg-[#061f1a] text-[#2ec4a0]",
    medium: "bg-[#1c1608] text-[#c9a84c]",
    hard: "bg-[#200e0e] text-[#e05555]"
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
