import { Link } from "react-router-dom";
import { CheckCircle, Clock, Route, Target, Sparkles, ChevronRight } from "lucide-react";
import { useRoadmapsStore } from "../../store/roadmaps-store";
import { cn } from "../../lib/utils/cn";

export function RoadmapWidget() {
  const { currentRoadmap } = useRoadmapsStore();

  if (!currentRoadmap) {
    return (
      <div className="p-10 rounded-[2.5rem] glass border-brand/20 bg-brand/5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mx-auto mb-6">
            <Route size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white text-white text-white mb-2">Initialize your path</h3>
          <p className="text-slate-500 text-slate-500 text-slate-400 mb-8 max-w-sm mx-auto">
            You haven't generated a roadmap yet. Let AI build a custom learning journey for you.
          </p>
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand text-white text-white text-white font-bold hover:scale-105 transition-all shadow-lg"
          >
            Create Mission
            <Sparkles size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Calculate overall progress across all tasks
  let totalTasks = 0;
  let completedTasks = 0;
  currentRoadmap.phases?.forEach(p => {
    p.missions?.forEach(m => {
      totalTasks += m.tasks?.length || 0;
      completedTasks += m.tasks?.filter(t => t.status === "completed").length || 0;
    });
  });

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Get active mission
  const activePhase = currentRoadmap.phases?.find(p => p.id === currentRoadmap.currentPhaseId) || currentRoadmap.phases?.[0];
  const nextMission = activePhase?.missions?.find(m => m.status === "in_progress") || activePhase?.missions?.[0];

  return (
    <div className="rounded-[2.5rem] glass border-white/5 p-8 bg-white/[0.02] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10 group-hover:bg-brand/5 transition-colors duration-1000" />
      
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <Route size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white text-white text-white">Active Mission</h3>
            <p className="text-sm text-slate-500 uppercase tracking-widest">{currentRoadmap.targetRole}</p>
          </div>
        </div>
        <Link 
          to="/roadmap" 
          className="p-3 rounded-xl bg-transparent bg-transparent bg-white/5 text-slate-500 text-slate-500 text-slate-400 hover:text-white text-white text-white hover:bg-transparent bg-transparent bg-white/10 transition-all"
        >
          <ChevronRight size={20} />
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-4xl font-black text-white text-white text-white">{progressPercentage}%</span>
              <span className="ml-2 text-sm text-slate-500">Execution</span>
            </div>
            <span className="text-xs font-bold text-slate-500 text-slate-500 text-slate-400 uppercase tracking-widest">
              {completedTasks} / {totalTasks} Tasks
            </span>
          </div>
          <div className="h-2 w-full bg-transparent bg-transparent bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-cyan-400 uppercase tracking-widest">
            <Clock size={12} />
            <span>Current Focus</span>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-cyan-400/20 transition-colors">
            <p className="text-lg font-bold text-white text-white text-white mb-2">{nextMission?.title || "Mission Accomplished!"}</p>
            <p className="text-xs text-slate-500 text-slate-500 text-slate-400 line-clamp-2">{nextMission?.description || "Standby for new objectives."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
