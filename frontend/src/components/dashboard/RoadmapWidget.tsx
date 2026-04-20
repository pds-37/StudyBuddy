import { Link } from "react-router-dom";
import { CheckCircle, Clock, Route, Target } from "lucide-react";
import type { RoadmapMilestone } from "@studybuddy/shared";
import { Card } from "../ui/Card";
import { useRoadmapsStore } from "../../store/roadmaps-store";

/** Dashboard widget showing roadmap progress summary. */
export function RoadmapWidget() {
  const { currentRoadmap, loading } = useRoadmapsStore();

  if (!currentRoadmap) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-purple-500/15 p-3 text-purple-300">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Learning roadmap</h3>
              <p className="text-sm text-slate-400">No active plan yet</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-black/20 p-5 text-center">
          <Target className="mx-auto h-9 w-9 text-slate-500" />
          <p className="mt-4 text-base font-semibold text-white">Generate your first roadmap</p>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Turn your strongest skill signals into a sequence of milestones you can actually follow.
          </p>
          <Link
            to="/roadmap"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:text-white"
          >
            Create roadmap
            <Route className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Card>
    );
  }

  const completedMilestones = currentRoadmap.milestones.filter(
    (milestone: RoadmapMilestone) => milestone.status === "completed"
  ).length;
  const inProgressMilestones = currentRoadmap.milestones.filter(
    (milestone: RoadmapMilestone) => milestone.status === "in_progress"
  ).length;
  const totalMilestones = currentRoadmap.milestones.length;
  const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);
  const nextMilestone = currentRoadmap.milestones.find((milestone) => milestone.status !== "completed");

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-purple-500/15 p-3 text-purple-300">
            <Route className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Learning roadmap</h3>
            <p className="text-sm text-slate-400">{currentRoadmap.targetRole}</p>
          </div>
        </div>
        <Link
          to="/roadmap"
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          Open
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 animate-pulse">
          <div className="h-24 rounded-[1.5rem] bg-white/5" />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Progress</p>
                <p className="mt-3 font-display text-4xl tracking-tight text-white">{progressPercentage}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">{completedMilestones} of {totalMilestones} complete</p>
                <p className="mt-1 text-xs text-slate-500">{currentRoadmap.timelineWeeks} week plan</p>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-cyan transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-200">
                <CheckCircle className="h-4 w-4" />
                {completedMilestones} done
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-sky-200">
                <Clock className="h-4 w-4" />
                {inProgressMilestones} in progress
              </div>
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Next milestone</p>
            <p className="mt-3 text-base font-semibold text-white">{nextMilestone?.title || "All milestones completed"}</p>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              {nextMilestone?.description || "You have completed the active roadmap. Open the roadmap view to plan the next chapter."}
            </p>
            {nextMilestone?.rationale && (
              <div className="mt-4 rounded-xl bg-brand/10 border border-brand/20 p-3">
                <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-1">AI Rationale</p>
                <p className="text-sm text-brand/90 leading-relaxed">
                  {nextMilestone.rationale}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
