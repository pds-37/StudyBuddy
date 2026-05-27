import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
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
  Zap
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
  const visibleTasks = (currentMission?.tasks || []).slice(0, showAllTasks ? undefined : isOverloaded ? 2 : TASK_LIMIT);
  const stats = useMemo(() => getRoadmapStats(currentRoadmap), [currentRoadmap]);
  const activePhaseIndex = currentRoadmap?.phases.findIndex((phase) => phase.id === activePhase?.id) ?? 0;

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

  return (
    <div className="min-h-screen pb-16 text-slate-100">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-5">
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

          <section className="glass-panel overflow-hidden rounded-xl border border-white/10 bg-surface/80">
            <div className="border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#a07ee0]/30 bg-[#150f28] text-[#a07ee0]">
                    <Compass size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a07ee0]">
                      Strategy OS · Intelligence Roadmap
                    </p>
                    <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
                      Your path to {currentRoadmap?.targetRole || "career readiness"}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsExpansionOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#7c5cbf] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#a07ee0]"
                  >
                    <Plus size={15} />
                    Expand Direction
                  </button>
                  <button
                    onClick={() => handleCopilotAction("Simplify my roadmap while keeping the same target role and strongest outcomes.")}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-[#c9a84c]/50 hover:text-[#e2c47a]"
                  >
                    <Layers3 size={15} />
                    Simplify
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-[#2ec4a0]/50 hover:text-[#2ec4a0] disabled:cursor-wait disabled:opacity-60"
                  >
                    <RefreshCw size={15} className={cn(generating && "animate-spin")} />
                    Regenerate
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-5 p-4 sm:p-5">
                <p className="max-w-2xl text-sm leading-6 text-slate-400">
                  Personalized for <span className="font-semibold text-slate-100">{user?.name || "you"}</span> using your pace,
                  skill gaps, recall state, and target companies. This is an execution system, not a static checklist.
                </p>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <MetricCard label="Readiness" value={`${stats.readiness}%`} sub="Target 95%" tone="red" icon={Gauge} />
                  <MetricCard label="Consistency" value={`${stats.consistency}%`} sub="Last 7 days" tone="gold" icon={Flame} />
                  <MetricCard label="Recall" value={`${stats.recall}%`} sub={stats.recall >= 70 ? "Healthy" : "Needs focus"} tone="teal" icon={Brain} />
                  <MetricCard label="Timeline" value={`W${currentMission?.weekNumber || 1}`} sub={`Phase ${activePhaseIndex + 1} of ${currentRoadmap?.phases.length || 1}`} tone="purple" icon={CalendarDays} />
                </div>
              </div>

              <div className="border-t border-white/10 bg-black/20 p-4 lg:border-l lg:border-t-0 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Active Track</p>
                  <span className="rounded-full border border-[#c9a84c]/30 bg-[#1c1608] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-[#c9a84c]">
                    Pro
                  </span>
                </div>
                <RoadmapPicker roadmaps={roadmaps} currentRoadmap={currentRoadmap} onSelect={setCurrentRoadmap} />
                <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white">
                    <Target size={14} className="text-[#2ec4a0]" />
                    Next milestone
                  </div>
                  <p className="text-xs leading-5 text-slate-400">
                    {currentRoadmap?.nextMilestone || nextTask?.title || "Complete the next execution task to unlock the following checkpoint."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-xl border border-white/10 bg-surface/50">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <SectionTitle icon={Map} title="Journey Path" />
              <button
                onClick={() => document.getElementById("journey-phases")?.scrollIntoView({ behavior: "smooth" })}
                className="text-xs font-semibold text-slate-500 transition hover:text-[#a07ee0]"
              >
                View full path
              </button>
            </div>
            <div className="overflow-x-auto p-4 sm:p-5">
              <div className="flex min-w-max items-start">
                {currentRoadmap?.phases.map((phase, index) => {
                  const state = getPhaseState(phase, activePhase?.id === phase.id);
                  return (
                    <div key={phase.id} className="flex items-start">
                      <button onClick={() => setActivePhaseId(phase.id)} className="group flex w-32 flex-col items-center gap-2 text-center">
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-full border-2 transition",
                            state === "done" && "border-[#2ec4a0] bg-[#061f1a] text-[#2ec4a0]",
                            state === "active" && "border-[#a07ee0] bg-[#150f28] text-[#a07ee0] shadow-[0_0_0_6px_rgba(124,92,191,0.12)]",
                            state === "locked" && "border-white/10 bg-white/[0.03] text-slate-400 group-hover:text-slate-400"
                          )}
                        >
                          {state === "done" ? <CheckCircle2 size={18} /> : state === "locked" ? <Lock size={16} /> : <Circle size={15} />}
                        </div>
                        <span className={cn("line-clamp-2 text-xs font-semibold", state === "active" ? "text-[#a07ee0]" : "text-slate-400")}>
                          {phase.title}
                        </span>
                      </button>
                      {index < currentRoadmap.phases.length - 1 && (
                        <div className={cn("mt-5 h-px w-14", phase.status === "completed" ? "bg-[#2ec4a0]" : "bg-white/10")} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section id="journey-phases" className="glass-panel rounded-xl border border-white/10 bg-surface/50 scroll-mt-20">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                <SectionTitle icon={Route} title="Journey Phases" />
                <span className="font-mono text-[10px] font-semibold text-slate-500">{stats.completion}% overall</span>
              </div>
              <div className="p-3 sm:p-4">
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

            <section id="execution-tasks" className="glass-panel rounded-xl border border-white/10 bg-surface/50 scroll-mt-20">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                <SectionTitle icon={Zap} title={isOverloaded ? "Momentum Focus" : "Execution Tasks"} />
                <button
                  onClick={() => setShowAllTasks((value) => !value)}
                  className="text-xs font-semibold text-slate-500 transition hover:text-[#a07ee0]"
                >
                  {showAllTasks ? "Show focus" : "View all"}
                </button>
              </div>
              <div className="space-y-3 p-3 sm:p-4">
                {visibleTasks.length > 0 ? (
                  visibleTasks.map((task, index) => (
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
                  <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
                    <CheckCircle2 className="mx-auto mb-2 text-[#2ec4a0]" size={24} />
                    <p className="text-sm font-semibold text-white">This mission is clear.</p>
                    <p className="mt-1 text-xs text-slate-500">Move to the next phase or ask Veda to add a stronger objective.</p>
                  </div>
                )}

                {isOverloaded && !showAllTasks && (
                  <div className="rounded-lg border border-[#c9a84c]/25 bg-[#1c1608] p-3 text-xs leading-5 text-[#e2c47a]/80">
                    Focus mode is showing only the highest leverage tasks. Complete these first, then expand the list.
                  </div>
                )}

                <button
                  onClick={() => handleCopilotAction(`Add a custom objective to "${currentMission?.title || "my active mission"}" and keep it measurable.`)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 transition hover:border-[#a07ee0]/50 hover:text-[#a07ee0]"
                >
                  <Plus size={14} />
                  Add custom objective
                </button>
              </div>
            </section>
          </div>

          <section className="glass-panel rounded-xl border border-white/10 bg-surface/50">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <SectionTitle icon={CalendarDays} title="This Week" />
              <span className="text-xs font-semibold text-slate-500">Ahead of {Math.max(35, stats.consistency)}% of learners</span>
            </div>
            <WeekPlanner completed={stats.completedTasks} total={stats.totalTasks} />
          </section>
        </main>

        <aside className="space-y-5">
          <section className="glass-panel rounded-xl border border-white/10 bg-surface/50">
            <div className="border-b border-white/10 px-4 py-3">
              <SectionTitle icon={Sparkles} title="Veda Insights" />
            </div>
            <div className="space-y-3 p-4">
              <div className="rounded-lg border border-[#7c5cbf]/25 bg-[#150f28] p-4">
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
                  className="mt-3 w-full rounded-lg bg-[#7c5cbf] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#a07ee0]"
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

          <section className="glass-panel rounded-xl border border-white/10 bg-surface/50">
            <div className="border-b border-white/10 px-4 py-3">
              <SectionTitle icon={Target} title="Next Best Action" />
            </div>
            <div className="p-4">
              <p className="mb-4 text-xs leading-5 text-slate-400">
                {nextTask ? `${nextTask.durationMinutes} minutes · ${nextTask.difficulty} · ${nextTask.type}` : "Create the next sprint from your current skill gaps."}
              </p>
              <button
                onClick={() => (nextTask ? navigate(`/study/${nextTask.id}`) : setIsExpansionOpen(true))}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2ec4a0] px-3 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#061f1a] transition hover:bg-[#5ee0c2]"
              >
                <Zap size={15} />
                Start Sprint
              </button>
            </div>
          </section>

          <section className="glass-panel rounded-xl border border-white/10 bg-surface/50">
            <div className="border-b border-white/10 px-4 py-3">
              <SectionTitle icon={BarChart3} title="Momentum" />
            </div>
            <MomentumHeatmap />
          </section>

          <section className="glass-panel rounded-xl border border-white/10 bg-surface/50">
            <div className="border-b border-white/10 px-4 py-3">
              <SectionTitle icon={Zap} title="Quick Actions" />
            </div>
            <div className="grid grid-cols-3 gap-2 p-4">
              <QuickAction icon={Brain} label="Ask" onClick={() => handleCopilotAction("Can we review my roadmap?")} />
              <QuickAction icon={RefreshCw} label="Recall" onClick={() => navigate("/recall")} />
              <QuickAction icon={Target} label="Quiz" onClick={() => (nextTask ? navigate(`/study/${nextTask.id}`) : handleCopilotAction("Quiz me on my roadmap progress."))} />
              <QuickAction icon={BookOpen} label="Notes" onClick={() => navigate("/notes")} />
              <QuickAction icon={Plus} label="Inject" onClick={handleInjectSkill} />
              <QuickAction icon={Search} label="Gaps" onClick={() => navigate("/skill-gap")} />
            </div>
          </section>
        </aside>
      </div>

      <ExpansionFlow isOpen={isExpansionOpen} onClose={() => setIsExpansionOpen(false)} />
    </div>
  );
}

function RoadmapPicker({ roadmaps, currentRoadmap, onSelect }: { roadmaps: Roadmap[]; currentRoadmap: Roadmap | null; onSelect: (roadmap: Roadmap) => void }) {
  if (roadmaps.length <= 1) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/20 p-3">
        <p className="truncate text-sm font-bold text-white">{currentRoadmap?.title || currentRoadmap?.targetRole || "Primary roadmap"}</p>
        <p className="mt-1 text-xs text-slate-500">{currentRoadmap?.category || "Career track"}</p>
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
          className="w-full appearance-none rounded-lg border border-white/10 bg-black/20 px-3 py-3 pr-9 text-sm font-bold text-white outline-none transition focus:border-[#a07ee0]/60"
        >
          {roadmaps.map((roadmap) => (
            <option key={roadmap.id} value={roadmap.id}>
              {roadmap.title || roadmap.targetRole}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
      </div>
    </label>
  );
}

function MetricCard({ label, value, sub, tone, icon: Icon }: { label: string; value: string; sub: string; tone: "red" | "gold" | "teal" | "purple"; icon: typeof Gauge }) {
  const toneClass = {
    red: "text-[#e05555] border-[#e05555]/25 bg-[#200e0e]",
    gold: "text-[#c9a84c] border-[#c9a84c]/25 bg-[#1c1608]",
    teal: "text-[#2ec4a0] border-[#2ec4a0]/25 bg-[#061f1a]",
    purple: "text-[#a07ee0] border-[#a07ee0]/25 bg-[#150f28]"
  }[tone];

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", toneClass)}>
          <Icon size={15} />
        </div>
      </div>
      <p className="text-2xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
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
        "mb-2 flex w-full items-start gap-3 rounded-lg border p-3 text-left transition",
        active ? "border-[#a07ee0]/30 bg-[#150f28]" : "border-transparent hover:border-white/10 hover:bg-white/[0.03]",
        phase.status === "locked" && "cursor-not-allowed opacity-55"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold",
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
            <p className="truncate text-sm font-bold text-white">{phase.title}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{phase.description}</p>
          </div>
          <span className={cn("shrink-0 rounded-full border px-2 py-1 font-mono text-[9px] font-semibold uppercase", stateBadgeClass(state))}>
            {phase.status === "completed" ? "Done" : phase.status === "locked" ? "Locked" : "Active"}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#a07ee0]" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-mono text-[10px] text-slate-500">{progress}%</span>
        </div>
      </div>
    </button>
  );
}

function TaskCard({ task, featured, onToggle, onStart, delay }: { task: RoadmapTask; featured: boolean; onToggle: () => void; onStart: () => void; delay: number }) {
  const isDone = task.status === "completed";
  const Icon = {
    learn: BookOpen,
    practice: Zap,
    revise: RefreshCw,
    project: Layers3
  }[task.type];

  return (
    <Motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "rounded-lg border p-3 transition",
        featured ? "border-[#4e8ef0]/30 bg-[#0a1528]" : "border-white/10 bg-[#121620] hover:border-white/20",
        isDone && "border-[#2ec4a0]/20 bg-[#061f1a]/60"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition",
            isDone ? "border-[#2ec4a0] bg-[#2ec4a0] text-[#061f1a]" : "border-white/15 text-slate-500 hover:border-[#2ec4a0] hover:text-[#2ec4a0]"
          )}
          aria-label={isDone ? "Mark task pending" : "Mark task complete"}
        >
          {isDone ? <CheckCircle2 size={15} /> : <Circle size={14} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider", taskTypeClass(task.type))}>
              <Icon size={11} />
              {task.type}
            </span>
            <span className="font-mono text-[10px] text-slate-500">{task.durationMinutes}m</span>
            <span className={cn("rounded-md px-2 py-1 font-mono text-[9px] font-semibold uppercase", difficultyClass(task.difficulty))}>
              {task.difficulty}
            </span>
          </div>
          <h3 className={cn("text-sm font-bold leading-5", isDone ? "text-slate-500 line-through" : "text-white")}>{task.title}</h3>
          {task.aiHint && !isDone && (
            <p className="mt-2 line-clamp-2 text-xs italic leading-5 text-slate-500">Veda: "{task.aiHint}"</p>
          )}
        </div>

        {!isDone && (
          <button
            onClick={onStart}
            className="hidden shrink-0 items-center gap-1 rounded-lg border border-[#a07ee0]/25 bg-[#150f28] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#a07ee0] transition hover:bg-[#7c5cbf] hover:text-white sm:inline-flex"
          >
            Start
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </Motion.div>
  );
}

function InsightCard({ insight, onAction }: { insight: RoadmapInsight; onAction: () => void }) {
  const Icon = {
    behavior: Flame,
    performance: TrendingUp,
    market: BarChart3,
    recommendation: Sparkles
  }[insight.type];

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400">
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-xs leading-5 text-slate-400">{insight.message}</p>
          {insight.actionLabel && (
            <button onClick={onAction} className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a07ee0] transition hover:text-white">
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
    <div className="grid grid-cols-7 gap-2 p-4 sm:p-5">
      {days.map((day, index) => {
        const isPast = index < todayIndex;
        const isToday = index === todayIndex;
        const isDone = isPast && completedRatio > index / 7;
        return (
          <button
            key={day}
            className={cn(
              "rounded-lg border p-2 text-center transition hover:border-white/20",
              isToday ? "border-[#a07ee0]/40 bg-[#150f28]" : isDone ? "border-[#2ec4a0]/30 bg-[#061f1a]" : "border-white/10 bg-[#121620]"
            )}
          >
            <p className="font-mono text-[9px] font-bold text-slate-500">{day}</p>
            <p className={cn("mt-2 font-mono text-sm font-bold", isToday ? "text-[#a07ee0]" : isDone ? "text-[#2ec4a0]" : "text-slate-400")}>
              {index + 1}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function MomentumHeatmap() {
  const values = [1, 2, 4, 3, 1, 0, 2, 4, 3, 2, 4, 4, 1, 2, 3, 1, 0, 2, 3, 4, 2, 3, 4, 1];
  const classes = ["bg-white/10", "bg-[#1e1a36]", "bg-[#3a2d6b]", "bg-[#6c4fc2]", "bg-[#a07ee0]"];

  return (
    <div className="p-4">
      <div className="mb-3 flex justify-between font-mono text-[9px] text-slate-400">
        <span>Low</span>
        <span>High</span>
      </div>
      <div className="grid grid-cols-8 gap-1">
        {values.map((value, index) => (
          <div key={index} className={cn("h-3 rounded-sm", classes[value])} />
        ))}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof Brain; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-slate-500 transition hover:border-[#a07ee0]/40 hover:text-[#a07ee0]"
    >
      <Icon size={16} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <RefreshCw className="mb-4 h-10 w-10 animate-spin text-[#a07ee0]" />
      <p className="text-sm font-semibold text-slate-400">Syncing your roadmap workspace...</p>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-32 text-center">
      <Sparkles className="mb-6 h-14 w-14 animate-pulse text-[#a07ee0]" />
      <h2 className="text-2xl font-black text-white">Synthesizing mission</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">Analyzing skill gaps, behavior signals, and recall load to build your next execution roadmap.</p>
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
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#a07ee0]">
        <Route size={30} />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-white">Initialize your mission</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Let Veda turn your profile, gaps, and target role into an adaptive execution roadmap.
      </p>
      {!onboardingComplete ? (
        <Link to="/onboarding" className="mt-8 rounded-lg bg-[#c9a84c] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#1c1608]">
          Complete onboarding
        </Link>
      ) : (
        <GuestGuard fallbackText="Please login to generate a personalized roadmap based on your skills and goals. Let's learn and grow together." className="mt-8">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="rounded-lg bg-[#7c5cbf] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#a07ee0] disabled:opacity-60"
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
      <h2 className="text-xl font-black text-white">Roadmap sync failed</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
      <div className="mt-6 flex gap-3">
        <button onClick={onClear} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">
          Dismiss
        </button>
        <button onClick={onRetry} className="rounded-lg bg-[#e05555] px-4 py-2 text-xs font-bold text-white">
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
