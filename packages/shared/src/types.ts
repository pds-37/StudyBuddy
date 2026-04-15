import type {
  learningItemKinds,
  reviewOutcomes,
  riskLevels,
  roadmapStatuses,
  studyBlockStatuses
} from "./constants";

export type SubjectName = string;
export type RoadmapStatus = (typeof roadmapStatuses)[number];
export type LearningItemKind = (typeof learningItemKinds)[number];
export type ReviewOutcome = (typeof reviewOutcomes)[number];
export type StudyBlockStatus = (typeof studyBlockStatuses)[number];
export type RiskLevel = (typeof riskLevels)[number];

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  streak: number;
  createdAt: string;
};

export type StudyNote = {
  id: string;
  userId: string;
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

export type ReminderItem = {
  id: string;
  userId: string;
  title: string;
  scheduledAt: string;
  intervalDays: number;
  isReviewed: boolean;
  noteId?: string | null;
  topic?: string;
  kind?: "revision" | "custom";
};

export type LearningItem = {
  id: string;
  userId: string;
  noteId: string;
  subject: string;
  topic: string;
  kind: LearningItemKind;
  prompt: string;
  answer: string;
  options: string[];
  correctOption: number | null;
  reviewStage: number;
  reviewCount: number;
  correctCount: number;
  dueAt: string;
  lastReviewedAt: string | null;
  lastOutcome: ReviewOutcome | null;
  createdAt: string;
  updatedAt: string;
};

export type TopicInsight = {
  topic: string;
  subject: string;
  masteryScore: number;
  revisionCount: number;
  reviewAccuracy: number;
  daysUntilForget: number;
  nextReviewAt: string | null;
  riskLevel: RiskLevel;
  warning: string;
};

export type StudyPlanBlock = {
  id: string;
  subject: string;
  topic: string;
  minutes: number;
  reason: string;
  status: StudyBlockStatus;
};

export type EmotionalFeedback = {
  tone: "positive" | "neutral" | "recovery";
  message: string;
};

export type MilestoneItem = {
  id: string;
  topic: string;
  description: string;
  orderIndex: number;
  status: RoadmapStatus;
  estimatedNotes: number;
  actualNotes: number;
};

export type RoadmapItem = {
  id: string;
  userId: string;
  goalTitle: string;
  subject: string;
  targetDate: string;
  isActive: boolean;
  createdAt: string;
  milestones: MilestoneItem[];
};

export type DashboardPayload = {
  totalNotes: number;
  dueToday: number;
  activeRoadmaps: number;
  latestSubject: string;
  strongestSubject: string;
  streak: number;
  quickPrompts: string[];
  todayPlan: StudyPlanBlock[];
  revisionQueue: LearningItem[];
  weakTopicAlert: TopicInsight | null;
  riskTopics: TopicInsight[];
  topicInsights: TopicInsight[];
  emotionalFeedback: EmotionalFeedback | null;
  planCompletion: number;
};

export type NoteAnalysisResult = {
  subject: string;
  category: string;
  keyConcepts: string[];
  summary: string;
  confidence: number;
  suggestedRoadmapTopic: string;
};

export type BuddyChatTurn = {
  role: "user" | "assistant";
  content: string;
};
