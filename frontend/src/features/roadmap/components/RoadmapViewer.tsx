import { useState } from "react";
import { updateMilestone } from "../../../lib/api/roadmaps";
import type { Roadmap, RoadmapMilestone } from "@studybuddy/shared";

type RoadmapViewerProps = {
  roadmap: Roadmap;
  onUpdate: () => void;
};

/** Displays a roadmap with milestones and progress tracking. */
export function RoadmapViewer({ roadmap, onUpdate }: RoadmapViewerProps) {
  const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null);

  const handleStatusChange = async (milestoneId: string, status: RoadmapMilestone["status"]) => {
    setUpdatingMilestone(milestoneId);
    try {
      await updateMilestone(milestoneId, status);
      onUpdate();
    } catch (error) {
      console.error("Failed to update milestone:", error);
    } finally {
      setUpdatingMilestone(null);
    }
  };

  const getStatusColor = (status: RoadmapMilestone["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusLabel = (status: RoadmapMilestone["status"]) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{roadmap.title}</h2>
          <p className="text-slate-400">
            Target: {roadmap.targetRole} • {roadmap.timelineWeeks} weeks
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {roadmap.milestones
          .sort((a, b) => a.order - b.order)
          .map((milestone) => (
            <div key={milestone.id} className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white text-sm font-medium">
                      {milestone.order}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{milestone.title}</h3>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(milestone.status)}`}>
                      {getStatusLabel(milestone.status)}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-4">{milestone.description}</p>

                  {milestone.skillTags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Skills to develop:</h4>
                      <div className="flex flex-wrap gap-2">
                        {milestone.skillTags.map((skill) => (
                          <span key={skill} className="rounded bg-blue-500/20 px-3 py-1 text-sm text-blue-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {milestone.targetDate && (
                    <p className="text-sm text-slate-400">
                      Target completion: {new Date(milestone.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="ml-6 flex flex-col gap-2">
                  <button
                    onClick={() => handleStatusChange(milestone.id, "not_started")}
                    disabled={updatingMilestone === milestone.id}
                    className={`rounded px-3 py-1 text-xs transition ${
                      milestone.status === "not_started"
                        ? "bg-slate-600 text-white"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    Not Started
                  </button>
                  <button
                    onClick={() => handleStatusChange(milestone.id, "in_progress")}
                    disabled={updatingMilestone === milestone.id}
                    className={`rounded px-3 py-1 text-xs transition ${
                      milestone.status === "in_progress"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(milestone.id, "completed")}
                    disabled={updatingMilestone === milestone.id}
                    className={`rounded px-3 py-1 text-xs transition ${
                      milestone.status === "completed"
                        ? "bg-green-600 text-white"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
