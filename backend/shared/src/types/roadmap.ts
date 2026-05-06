export type RoadmapTaskType = "learn" | "practice" | "revise" | "project";
export type RoadmapTaskStatus = "pending" | "completed" | "skipped";

export type RoadmapTask = {
  id: string;
  title: string;
  type: RoadmapTaskType;
  durationMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  status: RoadmapTaskStatus;
  aiHint?: string;
  completedAt?: string;
};

export type RoadmapMission = {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  whyItMatters: string;
  outcome: string;
  commonMistakes: string[];
  tasks: RoadmapTask[];
  status: "not_started" | "in_progress" | "completed";
};

export type RoadmapPhase = {
  id: string;
  title: string;
  description: string;
  status: "locked" | "unlocked" | "completed";
  estimatedWeeks: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  checkpoints: string[];
  missions: RoadmapMission[];
};

export type RoadmapInsight = {
  type: "behavior" | "performance" | "recommendation";
  message: string;
  actionLabel?: string;
  actionUrl?: string;
};

export type Roadmap = {
  id: string;
  userId: string;
  title: string;
  targetRole: string;
  readinessScore: number;
  consistencyScore: number;
  currentPhaseId?: string;
  nextMilestone?: string;
  phases: RoadmapPhase[];
  insights: RoadmapInsight[];
  updatedAt: string;
};

