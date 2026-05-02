export type RoadmapMilestoneStatus = "not_started" | "in_progress" | "completed";

export type RecommendedResource = {
  title: string;
  type: "video" | "course" | "article" | "documentation";
  url: string;
  author: string;
};

export type RoadmapMilestone = {
  id: string;
  title: string;
  description: string;
  skillTags: string[];
  status: RoadmapMilestoneStatus;
  order: number;
  rationale?: string;
  targetDate?: string;
  resources?: RecommendedResource[];
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
