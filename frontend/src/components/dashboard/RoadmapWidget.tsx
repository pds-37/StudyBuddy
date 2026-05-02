import { Link } from "react-router-dom";
import { CheckCircle, Clock, Route, Target, Sparkles, ChevronRight } from "lucide-react";
import type { RoadmapMilestone } from "@studybuddy/shared";
import { useRoadmapsStore } from "../../store/roadmaps-store";
import { cn } from "../../lib/utils/cn";

export function RoadmapWidget() {
  const { currentRoadmap, loading } = useRoadmapsStore();

  if (!currentRoadmap) {
    return (
      <div className="p-10 rounded-[2.5rem] glass border-brand/20 bg-brand/5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mx-auto mb-6">
            <Route size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Initialize your path</h3>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">
            You haven't generated a roadmap yet. Let AI build a custom learning journey for you.
          </p>
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand text-white font-bold hover:scale-105 transition-all shadow-lg"
          >
            Create Roadmap
            <Sparkles size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const completedMilestones = currentRoadmap.milestones.filter(
    (m: RoadmapMilestone) => m.status === "completed"
  ).length;
  const totalMilestones = currentRoadmap.milestones.length;
  const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);
  const nextMilestone = currentRoadmap.milestones.find((m) => m.status !== "completed");

  return (
    <div className="rounded-[2.5rem] glass border-white/5 p-8 bg-white/[0.02] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 blur-[100px] -z-10 group-hover:bg-brand/5 transition-colors duration-1000" />
      
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <Route size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Your Roadmap</h3>
            <p className="text-sm text-slate-500 uppercase tracking-widest">{currentRoadmap.targetRole}</p>
          </div>
        </div>
        <Link 
          to="/roadmap" 
          className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronRight size={20} />
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-4xl font-black text-white">{progressPercentage}%</span>
              <span className="ml-2 text-sm text-slate-500">Completed</span>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {completedMilestones} / {totalMilestones} Milestones
            </span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand to-cyan transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Clock size={12} className="text-cyan" />
            <span>Up Next</span>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-brand/20 transition-colors">
            <p className="text-lg font-bold text-white mb-2">{nextMilestone?.title || "All Caught Up!"}</p>
            {nextMilestone?.resources && nextMilestone.resources.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {nextMilestone.resources.slice(0, 3).map((resource, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-white/5 text-[11px] text-slate-400 border border-white/5">
                    {resource.title}
                  </span>
                ))}
                {nextMilestone.resources.length > 3 && (
                   <span className="text-[11px] text-slate-500 flex items-center">+{nextMilestone.resources.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
