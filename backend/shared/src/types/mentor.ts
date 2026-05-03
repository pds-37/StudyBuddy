export type SaaSPlan = "free" | "pro" | "team";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export type MentorJourneyStage =
  | "setup"
  | "diagnose"
  | "plan"
  | "learn"
  | "recall"
  | "build"
  | "interview"
  | "job_search";

export type MentorTaskType =
  | "onboarding"
  | "skill_gap"
  | "roadmap"
  | "learn"
  | "recall"
  | "note"
  | "project"
  | "interview"
  | "job"
  | "reflection";

export type MentorTaskStatus = "pending" | "completed" | "skipped";

export type MentorTask = {
  id: string;
  type: MentorTaskType;
  title: string;
  description: string;
  reason: string;
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
  href: string;
  status: MentorTaskStatus;
};

export type MentorWeakTopic = {
  topic: string;
  averageStrength: number;
  dueCount: number;
};

export type MentorTodayPlan = {
  id: string;
  date: string;
  focus: string;
  mentorMessage: string;
  journeyStage: MentorJourneyStage;
  readinessScore: number;
  nextUnlock: string;
  tasks: MentorTask[];
  signals: {
    targetRoles: string[];
    totalNotes: number;
    recallDue: number;
    averageMemoryStrength: number;
    roadmapProgress: number;
    activeMilestone?: string;
    activeProject?: string;
    latestInterviewScore?: number;
    weakTopics: MentorWeakTopic[];
  };
  subscription: {
    plan: SaaSPlan;
    status: SubscriptionStatus;
    usage: {
      mentorPlansGenerated: number;
      aiMessagesThisMonth: number;
      notesTracked: number;
    };
    limits: {
      aiMessagesPerMonth: number;
      notes: number;
      projects: number;
    };
  };
};
