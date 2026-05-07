import { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Zap, 
  Brain, 
  Route, 
  RefreshCw, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Clock, 
  Lock, 
  Sparkles,
  AlertCircle,
  TrendingUp,
  Flame,
  LayoutDashboard,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import { useRoadmapsStore } from "../../../store/roadmaps-store";
import { useAppStore } from "../../../store/app-store";
import { cn } from "../../../lib/utils/cn";
import type { Roadmap, RoadmapPhase, RoadmapMission, RoadmapTask } from "@studybuddy/shared";

/** 
 * Adaptive Roadmap Execution Engine 
 * This is the core "Mission Control" for the student's journey.
 */
export function RoadmapWorkspace() {
  const {
    currentRoadmap,
    loading,
    generating,
    error,
    fetchRoadmaps,
    generateRoadmap,
    updateTaskStatus,
    clearError
  } = useRoadmapsStore();
  
  const user = useAppStore((state) => state.user);
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  useEffect(() => {
    if (currentRoadmap && !activePhaseId) {
      setActivePhaseId(currentRoadmap.currentPhaseId || currentRoadmap.phases[0]?.id);
    }
  }, [currentRoadmap, activePhaseId]);

  const activePhase = useMemo(() => 
    currentRoadmap?.phases.find(p => p.id === activePhaseId) || currentRoadmap?.phases[0]
  , [currentRoadmap, activePhaseId]);

  const currentMission = useMemo(() => 
    activePhase?.missions.find(m => m.status === "in_progress") || activePhase?.missions[0]
  , [activePhase]);

  const handleGenerate = () => generateRoadmap(12);

  if (loading && !currentRoadmap) return <LoadingState />;
  if (error && !currentRoadmap) return <ErrorState error={error} onRetry={fetchRoadmaps} onClear={clearError} />;
  if (!currentRoadmap && !generating) return <EmptyState onGenerate={handleGenerate} isGenerating={generating} onboardingComplete={user?.onboardingCompleted} />;
  if (generating) return <GeneratingState />;

  return (
    <div className="relative min-h-screen pb-20">
      {/* ─── TOP SECTION: MISSION METRICS ─── */}
      <Motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <MetricCard 
          label="Target Path" 
          value={currentRoadmap?.targetRole || "Career Path"} 
          icon={Target} 
          color="text-cyan-400"
          glow="shadow-[0_0_20px_rgba(34,211,238,0.15)]"
        />
        <MetricCard 
          label="Readiness" 
          value={`${currentRoadmap?.readinessScore || 0}%`} 
          icon={Brain} 
          color="text-purple-400"
          progress={currentRoadmap?.readinessScore}
        />
        <MetricCard 
          label="Consistency" 
          value={(currentRoadmap?.consistencyScore ?? 0) > 70 ? "High" : (currentRoadmap?.consistencyScore ?? 0) > 40 ? "Medium" : "Developing"} 
          icon={Flame} 
          color="text-orange-400"
        />
        <MetricCard 
          label="Next Milestone" 
          value={currentRoadmap?.nextMilestone || "Initialization"} 
          icon={Sparkles} 
          color="text-emerald-400"
        />
      </Motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-8">
        {/* ─── LEFT PANEL: PHASES ─── */}
        <aside className="space-y-6">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Route className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Journey Phases</h3>
          </div>
          <div className="relative pl-4 space-y-2">
            <div className="absolute left-[21px] top-4 bottom-4 w-[2px] bg-white/[0.04]" />
            {currentRoadmap?.phases.map((phase, idx) => (
              <PhaseNode 
                key={phase.id} 
                phase={phase} 
                active={activePhaseId === phase.id}
                onClick={() => setActivePhaseId(phase.id)}
                isLast={idx === currentRoadmap.phases.length - 1}
              />
            ))}
          </div>
        </aside>

        {/* ─── CENTER PANEL: MISSION WORKSPACE ─── */}
        <main className="space-y-8">
          <AnimatePresence mode="wait">
            <Motion.section 
              key={activePhaseId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Current Weekly Mission */}
              {currentMission && (
                <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -mr-32 -mt-32 rounded-full transition-all group-hover:bg-cyan-500/10" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                        Week {currentMission.weekNumber} Mission
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        currentMission.status === "completed" ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                      )}>
                        {currentMission.status.replace('_', ' ')}
                      </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-4">{currentMission.title}</h2>
                    <p className="text-slate-400 leading-relaxed mb-6 max-w-2xl">{currentMission.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
                      <div className="space-y-2">
                        <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Why this matters</p>
                        <p className="text-slate-300 italic">"{currentMission.whyItMatters}"</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Success Outcome</p>
                        <p className="text-slate-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {currentMission.outcome}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-white/[0.04]">
                       <div className="flex -space-x-2">
                          {currentMission.commonMistakes.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center text-[10px] text-red-400 font-bold" title="Avoid common pitfalls">!</div>
                          ))}
                       </div>
                       <p className="text-xs text-slate-500 font-medium">AI detected {currentMission.commonMistakes.length} common pitfalls to avoid this week.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Execution Tasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Execution Tasks</h3>
                  </div>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    {currentMission?.tasks.filter(t => t.status === "completed").length} / {currentMission?.tasks.length} Completed
                  </span>
                </div>

                <div className="grid gap-3">
                  {currentMission?.tasks.map((task, idx) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onToggle={() => {
                        const nextStatus = task.status === "completed" ? "pending" : "completed";
                        updateTaskStatus(task.id, nextStatus);
                      }}
                      delay={idx * 0.05}
                    />
                  ))}
                </div>
              </div>
            </Motion.section>
          </AnimatePresence>
        </main>

        {/* ─── RIGHT PANEL: AI INSIGHTS ─── */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Veda AI Mentor</h3>
            </div>

            <div className="space-y-4">
              {currentRoadmap?.insights?.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>

            <div className="pt-6 border-t border-white/[0.04] space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Dynamic Nudges</h4>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-wide">Next Best Action</span>
                 </div>
                 <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    Based on your night-owl behavior and recent DP struggles, you should focus on BFS traversal tonight for 45 mins.
                 </p>
                 <button className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] transition">
                    Start Learning Mission
                 </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.01] p-6 text-center">
             <TrendingUp className="w-6 h-6 text-slate-700 mx-auto mb-3" />
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Weekly Momentum</p>
             <p className="text-2xl font-bold text-white mb-2">+12%</p>
             <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <Motion.div className="h-full bg-emerald-400" initial={{ width: 0 }} animate={{ width: "65%" }} />
             </div>
          </div>
        </aside>
      </div>


    </div>
  );
}

/* ─── SUB-COMPONENTS ─── */

function MetricCard({ label, value, icon: Icon, color, glow, progress }: any) {
  return (
    <div className={cn(
      "rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm relative overflow-hidden group",
      glow
    )}>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</p>
          <p className={cn("text-2xl font-bold transition-all group-hover:scale-105 origin-left", color)}>{value}</p>
        </div>
        <div className={cn("p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-4 h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
          <Motion.div 
            className={cn("h-full", color.replace('text-', 'bg-'))}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      )}
    </div>
  );
}

function PhaseNode({ phase, active, onClick, isLast }: { phase: RoadmapPhase; active: boolean; onClick: () => void; isLast: boolean }) {
  const isLocked = phase.status === "locked";
  const isCompleted = phase.status === "completed";

  return (
    <button 
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "w-full flex items-center gap-4 p-3 rounded-2xl transition-all group relative",
        active ? "bg-white/[0.06] border border-white/[0.1] shadow-lg" : "hover:bg-white/[0.02]",
        isLocked && "opacity-40 grayscale cursor-not-allowed"
      )}
    >
      <div className="relative z-10">
        <div className={cn(
          "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center",
          active ? "bg-cyan-400 border-cyan-400 scale-125" : isCompleted ? "bg-emerald-500 border-emerald-500" : "bg-obsidian border-white/20",
          active && "shadow-[0_0_15px_rgba(34,211,238,0.5)]"
        )}>
          {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
          {isLocked && <Lock className="w-2.5 h-2.5 text-slate-500" />}
        </div>
      </div>
      <div className="text-left overflow-hidden">
        <p className={cn(
          "text-xs font-bold truncate transition-all",
          active ? "text-white" : "text-slate-500"
        )}>
          {phase.title}
        </p>
        <p className="text-[10px] text-slate-600 font-medium truncate uppercase tracking-widest">{phase.difficulty}</p>
      </div>
      {active && (
        <Motion.div layoutId="phase-glow" className="absolute inset-0 rounded-2xl bg-cyan-400/5 blur-md" />
      )}
    </button>
  );
}

function TaskCard({ task, onToggle, delay }: { task: RoadmapTask; onToggle: () => void; delay: number }) {
  const isDone = task.status === "completed";
  
  const typeIcons = {
    learn: BookOpen,
    practice: Zap,
    revise: RefreshCw,
    project: LayoutDashboard
  };
  const Icon = typeIcons[task.type] || Target;

  const typeColors = {
    learn: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    practice: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    revise: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    project: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"
  };

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "group p-4 rounded-2xl border transition-all flex items-center gap-4",
        isDone ? "bg-emerald-500/[0.03] border-emerald-500/10" : "bg-white/[0.015] border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.12]"
      )}
    >
      <button 
        onClick={onToggle}
        className={cn(
          "shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
          isDone ? "bg-emerald-500 border-emerald-500" : "border-white/10 group-hover:border-white/30"
        )}
      >
        {isDone && <CheckCircle2 className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border", typeColors[task.type])}>
            {task.type}
          </span>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter flex items-center gap-1">
            <Clock className="w-3 h-3" /> {task.durationMinutes}m
          </span>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">• {task.difficulty}</span>
        </div>
        <h4 className={cn("text-sm font-semibold transition-all", isDone ? "text-slate-500 line-through" : "text-white")}>
          {task.title}
        </h4>
        {task.aiHint && !isDone && (
          <p className="text-[11px] text-cyan-400/60 mt-1 italic font-medium leading-tight">
            Veda: "{task.aiHint}"
          </p>
        )}
      </div>

      <Link 
        to={`/study/${task.id}`}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-white transition"
      >
        <ArrowRight className="w-4 h-4" />
      </Link>

    </Motion.div>
  );
}

function InsightCard({ insight }: { insight: any }) {
  const icons = {
    behavior: Flame,
    performance: TrendingUp,
    recommendation: Sparkles
  };
  const Icon = icons[insight.type as keyof typeof icons] || Zap;

  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] group hover:bg-white/[0.04] transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 group-hover:text-white transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
            {insight.message}
          </p>
          {insight.actionLabel && (
            <button className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 hover:text-cyan-300 transition-colors">
              {insight.actionLabel} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── STATE COMPONENTS ─── */

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="relative w-16 h-16">
        <Motion.div 
          className="absolute inset-0 rounded-full border-2 border-cyan-400/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <RefreshCw className="w-full h-full text-cyan-400 animate-spin" />
      </div>
      <p className="text-slate-500 text-sm font-medium animate-pulse">Syncing with Veda Mentor...</p>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto space-y-8">
      <div className="relative">
        <Motion.div 
          className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400/20 to-purple-500/20 flex items-center justify-center relative z-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
        </Motion.div>
        {[1.2, 1.5, 1.8].map((s, i) => (
          <Motion.div 
            key={i}
            className="absolute inset-0 rounded-full border border-cyan-400/10"
            animate={{ scale: [1, s, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 4, delay: i * 0.5, repeat: Infinity }}
          />
        ))}
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-white">Synthesizing Mission...</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Analyzing skill gaps, behavior patterns, and memory state to generate your optimized execution engine.
        </p>
      </div>
      <div className="w-full max-w-xs h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <Motion.div 
          className="h-full bg-cyan-400"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function EmptyState({ onGenerate, isGenerating, onboardingComplete }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center max-w-xl mx-auto space-y-8">
      <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-slate-700">
        <Route className="w-10 h-10" />
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-white">Initialize Your Mission</h2>
        <p className="text-slate-400 leading-relaxed">
          You don't have an active learning mission. Let Veda analyze your profile and build an adaptive execution engine to reach your career goals.
        </p>
      </div>
      {!onboardingComplete ? (
        <Link 
          to="/onboarding"
          className="px-8 py-4 rounded-2xl bg-amber-400 text-slate-950 font-bold uppercase tracking-widest hover:scale-105 transition"
        >
          Complete Onboarding First
        </Link>
      ) : (
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-8 py-4 rounded-2xl bg-cyan-400 text-slate-950 font-bold uppercase tracking-widest hover:scale-105 transition shadow-[0_10px_30px_rgba(34,211,238,0.2)]"
        >
          Generate Adaptive Mission
        </button>
      )}
    </div>
  );
}

function ErrorState({ error, onRetry, onClear }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center text-red-400">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Transmission Interrupted</h2>
        <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
      </div>
      <div className="flex gap-4">
        <button onClick={onClear} className="px-6 py-2.5 rounded-xl bg-white/[0.04] text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-white transition">Dismiss</button>
        <button onClick={onRetry} className="px-6 py-2.5 rounded-xl bg-red-400 text-slate-950 font-bold uppercase tracking-widest text-[10px] hover:bg-red-300 transition">Retry Sync</button>
      </div>
    </div>
  );
}
