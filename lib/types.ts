export type Note = {
  id: string;
  content: string;
  subject: string;
  category: string;
  keyConcepts: string[];
  summary: string;
  confidence: number;
  roadmapTopic: string;
  createdAt: string;
  updatedAt: string;
};

export type Reminder = {
  id: string;
  noteId: string | null;
  title: string;
  scheduledAt: string;
  intervalDays: number;
  isReviewed: boolean;
  nextReminderId: string | null;
  subject?: string | null;
  noteSummary?: string | null;
};

export type Roadmap = {
  id: string;
  goalTitle: string;
  subject: string;
  targetDate: string;
  createdAt: string;
  isActive: boolean;
};

export type MilestoneStatus = "upcoming" | "in_progress" | "completed";

export type Milestone = {
  id: string;
  roadmapId: string;
  topic: string;
  description: string;
  orderIndex: number;
  status: MilestoneStatus;
  estimatedNotes: number;
  actualNotes: number;
};

export type RoadmapWithMilestones = {
  roadmap: Roadmap;
  milestones: Milestone[];
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type GeminiAnalysis = {
  subject: string;
  category: string;
  key_concepts: string[];
  summary: string;
  confidence: number;
  suggested_roadmap_topic: string;
};

export type RoadmapDraftMilestone = {
  id: string;
  topic: string;
  description: string;
  order: number;
  estimated_notes_needed: number;
};

export type GeminiRoadmap = {
  goal_title: string;
  target_date: string;
  subject: string;
  milestones: RoadmapDraftMilestone[];
};

export type ToastTone = "success" | "warning" | "danger" | "neutral";

export type ToastState = {
  id: string;
  message: string;
  tone: ToastTone;
};

export type SaveNoteInput = {
  id?: string;
  content: string;
  selectedSubject?: string | null;
};

export type CustomReminderInput = {
  title: string;
  scheduledAt: string;
  noteId?: string | null;
  subject?: string | null;
};
