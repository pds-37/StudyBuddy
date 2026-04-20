export type RoadmapMilestoneStatus = "not_started" | "in_progress" | "completed";

export type RoadmapMilestone = {
  id: string;
  title: string;
  description: string;
  skillTags: string[];
  status: RoadmapMilestoneStatus;
  order: number;
  rationale?: string;
  targetDate?: string;
};

export type Roadmap = {
  id: string;
  userId: string;
  title: string;
  targetRole: string;
  timelineWeeks: number;
  rationale?: string;
  milestones: RoadmapMilestone[];
};
