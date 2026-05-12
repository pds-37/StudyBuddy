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
  BookOpen,
  Compass,
  Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRoadmapsStore } from "../../../store/roadmaps-store";
import { useCopilotStore } from "../../../store/copilot-store";
import { useAppStore } from "../../../store/app-store";
import { cn } from "../../../lib/utils/cn";
import { ExpansionFlow } from "./ExpansionFlow";
import { BehavioralIntervention } from "./BehavioralIntervention";
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
  const [isExpansionOpen, setIsExpansionOpen] = useState(false);
  const [isInternalLoading, setIsInternalLoading] = useState(true);
  const { roadmaps, setCurrentRoadmap, injectSkill } = useRoadmapsStore();
  const navigate = useNavigate();
  const { sendMessage, createNewConversation, currentConversation, setIsWidgetOpen } = useCopilotStore();

  const handleCopilotAction = async (prompt: string) => {
    setIsWidgetOpen(true);
    if (!currentConversation) {
      await createNewConversation();
    }
    await sendMessage(prompt);
  };

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

  if (isInternalLoading && !currentRoadmap) return <LoadingState />;
  if (error && !currentRoadmap) return <ErrorState error={error} onRetry={fetchRoadmaps} onClear={clearError} />;
  if (!currentRoadmap && !generating) return <EmptyState onGenerate={handleGenerate} isGenerating={generating} onboardingComplete={user?.onboardingCompleted} />;
  if (generating) return <GeneratingState />;

  return (
    <div className="relative min-h-screen pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* ─── MAIN COLUMN ─── */}
        <div className="space-y-6">
          
          {/* BEHAVIORAL INTERVENTIONS */}
          {currentRoadmap?.insights?.filter(i => i.type === "behavior").map((insight, idx) => (
            <BehavioralIntervention 
              key={idx}
              type={insight.message.toLowerCase().includes("welcome back") ? "recovery" : insight.message.toLowerCase().includes("consistency") ? "burnout" : "overload"}
              message={insight.message}
              onAction={() => {
                if (insight.message.toLowerCase().includes("consistency") || insight.message.toLowerCase().includes("struggle")) {
                   handleCopilotAction("My current roadmap feels a bit overwhelming. Can we simplify the tasks or adjust the pacing for better consistency?");
                } else {
                   handleCopilotAction("I need help adjusting my roadmap pacing. Can you assist me?");
                }
              }}
            />
          ))}

          {/* TOP BANNER */}
          <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#0c1017] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] transition-all hover:border-brand/30">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-cyan/5 opacity-40 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/10 rounded-full blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="relative z-10">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                 <div>
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                          <Compass className="w-6 h-6" />
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand/80">Strategy OS</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-4">
                       Intelligence Roadmap
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
                       Your personal path to <span className="text-white font-semibold underline decoration-brand/30 underline-offset-4">{currentRoadmap?.targetRole || "Success"}</span>, optimized by Veda.
                    </p>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsExpansionOpen(true)}
                      className="group/btn relative px-8 py-4 rounded-2xl bg-white text-slate-950 text-sm font-black transition-all hover:bg-slate-100 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5 transition-transform group-hover/btn:rotate-90" />
                      Expand Direction
                    </button>
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <TopMetric label="Readiness" value={`${currentRoadmap?.readinessScore || 0}%`} sub="Target: 95%" color="text-cyan" />
                  <TopMetric label="Consistency" value="88%" sub="Elite Level" color="text-brand" />
                  <TopMetric label="Recall" value="62%" sub="Needs Focus" color="text-amber-400" />
                  <TopMetric label="Timeline" value="Week 4" sub="Phase 1 of 3" color="text-emerald-400" />
               </div>
            </div>
          </div>

          {/* CURRENT JOURNEY */}
          <div className="rounded-3xl border border-white/[0.06] bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4">
             <div className="flex items-center gap-2 mb-8">
                <Target className="w-4 h-4 text-slate-500 dark:text-slate-500 dark:text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-700 dark:text-slate-300">Current Journey</h3>
             </div>

             <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                <div className="shrink-0 relative w-24 h-24 rounded-full border border-slate-200 dark:border-slate-200 dark:border-white/10 flex items-center justify-center">
                   <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="48" cy="48" r="46" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle cx="48" cy="48" r="46" fill="transparent" stroke="var(--brand)" strokeWidth="4" strokeDasharray="289" strokeDashoffset={289 * (1 - (currentRoadmap?.readinessScore || 0) / 100)} className="transition-all duration-1000" />
                   </svg>
                   <div className="text-center">
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">{currentRoadmap?.readinessScore || 0}%</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">Progress</p>
                   </div>
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">{currentRoadmap?.targetRole || "Software Developer"}</h2>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-brand/10 text-brand border border-brand/20">Target Role</span>
                   </div>
                   <p className="text-sm text-slate-500 dark:text-slate-500 dark:text-slate-400">Master full stack development and problem solving to become a job-ready software engineer.</p>
                </div>
                <button 
                  onClick={() => document.getElementById('journey-phases')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-50 dark:bg-white/5 transition flex items-center gap-2"
                >
                   View Path <ArrowRight className="w-3 h-3" />
                </button>
             </div>

             <div className="relative">
                <div className="absolute top-4 left-0 w-full h-[2px] bg-slate-50 dark:bg-slate-50 dark:bg-white/5" />
                <div className="relative flex justify-between">
                   {currentRoadmap?.phases.slice(0, 5).map((phase, idx) => {
                      const isCompleted = phase.status === "completed";
                      const isLocked = phase.status === "locked";
                      const isActive = activePhaseId === phase.id;
                      return (
                        <div key={phase.id} className="flex flex-col items-center w-24 text-center cursor-pointer" onClick={() => setActivePhaseId(phase.id)}>
                           <div className={cn("w-8 h-8 rounded-full border-[3px] flex items-center justify-center z-10 transition-colors bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4", isCompleted ? "border-brand" : isActive ? "border-brand" : "border-slate-200 dark:border-slate-200 dark:border-white/10")}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4 text-brand" /> : isLocked ? <Lock className="w-3 h-3 text-slate-600" /> : <div className="w-2 h-2 rounded-full bg-brand" />}
                           </div>
                           <p className={cn("text-[10px] font-bold mt-3 mb-1 line-clamp-1 transition-colors", isActive || isCompleted ? "text-slate-900 dark:text-slate-900 dark:text-white" : "text-slate-500")}>{phase.title}</p>
                           <p className="text-[9px] text-slate-500 font-medium uppercase">{isCompleted ? "Completed" : isLocked ? "Locked" : "In Progress"}</p>
                        </div>
                      )
                   })}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* JOURNEY PHASES */}
             <div id="journey-phases" className="rounded-3xl border border-white/[0.06] bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                      <Route className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-700 dark:text-slate-300">Journey Phases</h3>
                   </div>
                </div>
                <div className="relative pl-4 space-y-4">
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
             </div>

             {/* EXECUTION TASKS */}
             <div id="execution-tasks" className="rounded-3xl border border-white/[0.06] bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4 scroll-mt-20">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-700 dark:text-slate-300">
                        {currentRoadmap?.insights?.some(i => i.message.toLowerCase().includes("overwhelmed")) ? "Momentum Focus" : "Execution Tasks"}
                      </h3>
                   </div>
                   {!currentRoadmap?.insights?.some(i => i.message.toLowerCase().includes("overwhelmed")) && (
                     <button 
                       onClick={() => handleCopilotAction("Can we review all my pending tasks in the current mission?")}
                       className="text-[10px] text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-widest font-bold"
                     >
                       View All
                     </button>
                   )}
                </div>
                <div className="space-y-3">
                  {currentMission?.tasks.slice(0, currentRoadmap?.insights?.some(i => i.message.toLowerCase().includes("overwhelmed")) ? 2 : 10).map((task, idx) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onToggle={() => updateTaskStatus(task.id, task.status === "completed" ? "pending" : "completed")}
                      onStart={() => navigate(`/study/${task.id}`)}
                      delay={idx * 0.05}
                    />
                  ))}
                  {currentRoadmap?.insights?.some(i => i.message.toLowerCase().includes("overwhelmed")) && (
                    <div className="p-4 rounded-2xl bg-brand/5 border border-dashed border-brand/20 text-center animate-pulse">
                       <p className="text-[11px] text-brand font-bold uppercase tracking-widest">Focus Mode Activated</p>
                       <p className="text-[10px] text-slate-500 mt-1">Completing these 2 tasks will restore your momentum.</p>
                    </div>
                  )}
                  {!currentRoadmap?.insights?.some(i => i.message.toLowerCase().includes("overwhelmed")) && (
                    <button 
                      onClick={() => handleCopilotAction("I want to add a new custom task to my current roadmap. Help me define it.")}
                      className="w-full py-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-brand hover:border-brand/50 transition-all mt-2 flex items-center justify-center gap-2 group"
                    >
                       <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                       Add Custom Objective
                    </button>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: AI INSIGHTS ─── */}
        <aside className="space-y-6">
          {/* MENTOR INSIGHTS */}
          <div className="rounded-3xl border border-white/[0.06] bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-700 dark:text-slate-300">AI Mentor Insights</h3>
            </div>

            <div className="p-4 rounded-2xl bg-brand/10 border border-brand/20">
               <p className="text-xs text-slate-900 dark:text-slate-900 dark:text-white font-medium mb-1">Excellent progress, {user?.name || 'there'}! ✨</p>
               <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-400">Your consistency and recall are improving.</p>
            </div>

            <div>
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Key Insights</h4>
               <div className="space-y-4">
                  {currentRoadmap?.insights && currentRoadmap.insights.length > 0 ? (
                    currentRoadmap.insights.map((insight, idx) => (
                      <InsightCard 
                        key={idx} 
                        insight={insight} 
                        onAction={() => {
                           const label = insight.actionLabel?.toUpperCase();
                           if (label === "TRACK READINESS SCORE") {
                              navigate("/skill-gap");
                           } else if (label === "VIEW DAILY SCHEDULE") {
                              document.getElementById("execution-tasks")?.scrollIntoView({ behavior: "smooth" });
                           } else if (label === "START REVISION") {
                              navigate("/recall");
                           } else {
                              handleCopilotAction(`Regarding your insight: "${insight.message}". Let's work on this action: ${insight.actionLabel}`);
                           }
                        }}
                      />
                    ))
                  ) : (
                    <div className="flex gap-3">
                       <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-700 dark:text-slate-300 font-medium">No insights available yet</p>
                          <p className="text-[10px] text-slate-500 mt-1">Check back later as you progress.</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* NEXT BEST ACTION */}
          <div className="rounded-3xl border border-white/[0.06] bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <Target className="w-4 h-4 text-emerald-400" />
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-700 dark:text-slate-300">Next Best Action</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Recommended</span>
             </div>
             <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Based on your progress and recent performance, start a focus on Graph Traversal sprint.
             </p>
             <button 
               onClick={() => navigate('/focus')}
               className="w-full py-3 rounded-xl bg-brand text-slate-900 dark:text-slate-900 dark:text-white text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-brand/90 transition shadow-glow"
             >
                <Zap className="w-4 h-4" /> Start 45-min Sprint
             </button>
          </div>

          {/* WEEKLY PROGRESS */}
          <div className="rounded-3xl border border-white/[0.06] bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-blue-400" />
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-700 dark:text-slate-300">Weekly Progress</h3>
                </div>
             </div>
             <p className="text-[10px] text-slate-500 mb-6">You're ahead of 65% of learners</p>
             <div className="h-24 w-full flex items-end justify-between gap-1 pb-4 border-b border-white/5">
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                   <div key={i} className="w-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5 rounded-t-sm hover:bg-brand/50 transition-colors relative group" style={{ height: `${h}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[9px] text-slate-900 dark:text-slate-900 dark:text-white bg-black px-1 rounded transition-opacity">{h}%</div>
                   </div>
                ))}
             </div>
             <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-600 uppercase">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
             </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-3xl border border-white/[0.06] bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4">
             <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-700 dark:text-slate-300">Quick Actions</h3>
             </div>
             <div className="grid grid-cols-4 gap-2">
                {[
                   { icon: Brain, label: "Ask Veda" },
                   { icon: RefreshCw, label: "Recall" },
                   { icon: Target, label: "Quiz" },
                   { icon: BookOpen, label: "Note" },
                   { icon: Plus, label: "Inject" },
                ].map((action, i) => (
                   <button 
                     key={i} 
                     onClick={() => {
                       if (action.label === "Ask Veda") handleCopilotAction("Hello Veda! Can we review my roadmap?");
                       if (action.label === "Recall") navigate('/recall');
                       if (action.label === "Quiz") {
                         const firstPending = currentMission?.tasks.find(t => t.status === 'pending');
                         if (firstPending) navigate(`/study/${firstPending.id}`);
                         else handleCopilotAction("I want to take a quiz on my recent learning progress.");
                       }
                       if (action.label === "Note") navigate('/notes');
                       if (action.label === "Inject") {
                         const skill = prompt("What skill did you learn externally?");
                         if (skill) {
                            injectSkill(skill);
                         }
                       }
                     }}
                     className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-brand/30 transition group"
                   >
                      <action.icon className="w-4 h-4 text-slate-500 dark:text-slate-500 dark:text-slate-400 group-hover:text-brand transition-colors" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase group-hover:text-slate-300 transition-colors">{action.label}</span>
                   </button>
                ))}
             </div>
              <div 
                onClick={() => handleCopilotAction("Hello Veda! How can you help me today?")}
                className="mt-4 p-3 rounded-xl bg-gradient-to-r from-brand/20 to-transparent border border-brand/20 flex items-center gap-3 cursor-pointer hover:bg-brand/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0">
                   <Sparkles className="w-4 h-4 text-slate-900 dark:text-slate-900 dark:text-white" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-widest">Veda Assistant</p>
                   <p className="text-[9px] text-slate-500 dark:text-slate-500 dark:text-slate-400">How can I help you today?</p>
                </div>
             </div>
          </div>
        </aside>
      </div>
      <ExpansionFlow isOpen={isExpansionOpen} onClose={() => setIsExpansionOpen(false)} />
    </div>
  );
}

/* ─── SUB-COMPONENTS ─── */

function TopMetric({ label, value, sub, color, border }: any) {
  return (
    <div className="flex flex-col gap-2">
       <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center mb-2 relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle cx="20" cy="20" r="18" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
             <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="3" strokeDasharray="113" strokeDashoffset="40" className={color} />
          </svg>
          <span className="text-[10px] font-bold text-slate-900 dark:text-slate-900 dark:text-white">{value}</span>
       </div>
       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500 dark:text-slate-400">{label}</p>
       <p className={cn("text-[10px] font-medium", color)}>{sub}</p>
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
          active ? "bg-cyan-400 border-cyan-400 scale-125" : isCompleted ? "bg-emerald-500 border-emerald-500" : "bg-white dark:bg-obsidian bg-white dark:bg-obsidian$4",
          active && "shadow-[0_0_15px_rgba(34,211,238,0.5)]"
        )}>
          {isCompleted && <CheckCircle2 className="w-3 h-3 text-slate-900 dark:text-slate-900 dark:text-white" />}
          {isLocked && <Lock className="w-2.5 h-2.5 text-slate-500" />}
        </div>
      </div>
      <div className="text-left overflow-hidden flex-1">
        <p className={cn(
          "text-[11px] font-bold truncate transition-all",
          active ? "text-slate-900 dark:text-slate-900 dark:text-white" : isCompleted ? "text-slate-900 dark:text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-500 dark:text-slate-400"
        )}>
          {phase.title}
        </p>
        <p className="text-[9px] text-slate-500 font-medium truncate uppercase tracking-widest">{phase.description || "Foundational concepts"}</p>
      </div>
      {isCompleted && <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Completed</span>}
      {!isCompleted && active && <span className="text-[9px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded uppercase">In Progress</span>}
      {!isCompleted && !active && <span className="text-[9px] font-bold text-slate-600 bg-slate-50 dark:bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded uppercase">Locked</span>}
      {active && (
        <Motion.div layoutId="phase-glow" className="absolute inset-0 rounded-2xl bg-cyan-400/5 blur-md" />
      )}
    </button>
  );
}

function TaskCard({ task, onToggle, onStart, delay }: { task: RoadmapTask; onToggle: () => void; onStart: () => void; delay: number }) {
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={cn(
        "group p-5 rounded-3xl border transition-all flex items-center gap-4",
        isDone ? "bg-emerald-500/[0.03] border-emerald-500/10" : "bg-white/[0.015] border-white/[0.06] hover:bg-white/[0.03] hover:border-brand/30 shadow-lg"
      )}
    >
      <button 
        onClick={onToggle}
        className={cn(
          "shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
          isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-200 dark:border-slate-200 dark:border-white/10 group-hover:border-brand/50"
        )}
      >
        {isDone && <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-slate-900 dark:text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border", typeColors[task.type])}>
            {task.type}
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{task.durationMinutes}m • {task.difficulty}</span>
        </div>
        <h4 className={cn("text-sm font-bold tracking-tight transition-all", isDone ? "text-slate-500 line-through" : "text-slate-900 dark:text-slate-900 dark:text-white")}>
          {task.title}
        </h4>
        {task.aiHint && !isDone && (
          <p className="text-[11px] text-cyan-400/60 mt-1 italic font-medium leading-tight line-clamp-1 group-hover:line-clamp-none transition-all">
            Veda: "{task.aiHint}"
          </p>
        )}
      </div>

      {!isDone && (
        <button 
          onClick={onStart}
          className="opacity-0 group-hover:opacity-100 px-4 py-2 rounded-xl bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest hover:bg-brand hover:text-black transition-all flex items-center gap-2"
        >
          Start <ArrowRight size={12} />
        </button>
      )}

      {isDone && (
        <div className="text-emerald-500">
           <CheckCircle2 size={18} />
        </div>
      )}

    </Motion.div>
  );
}

function InsightCard({ insight, onAction }: { insight: any; onAction?: () => void }) {
  const icons = {
    behavior: Flame,
    performance: TrendingUp,
    recommendation: Sparkles
  };
  const Icon = icons[insight.type as keyof typeof icons] || Zap;

  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] group hover:bg-white/[0.04] transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-500 dark:text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[11px] text-slate-700 dark:text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {insight.message}
          </p>
          {insight.actionLabel && (
            <button 
              onClick={onAction}
              className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">Synthesizing Mission...</h2>
        <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
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
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">Initialize Your Mission</h2>
        <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 leading-relaxed">
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">Transmission Interrupted</h2>
        <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{error}</p>
      </div>
      <div className="flex gap-4">
        <button onClick={onClear} className="px-6 py-2.5 rounded-xl bg-white/[0.04] text-slate-500 dark:text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-900 dark:text-slate-900 dark:text-white transition">Dismiss</button>
        <button onClick={onRetry} className="px-6 py-2.5 rounded-xl bg-red-400 text-slate-950 font-bold uppercase tracking-widest text-[10px] hover:bg-red-300 transition">Retry Sync</button>
      </div>
    </div>
  );
}
