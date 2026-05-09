export type NoteFlashcard = {
  question: string;
  answer: string;
};

export type NoteAIMetadata = {
  summary: string;
  concepts: string[];
  flashcards: NoteFlashcard[];
  retentionStrength: number; // 0-100
  difficulty: "beginner" | "intermediate" | "advanced";
  conceptGraph: Array<{ from: string; to: string; relationship: string }>;
  executionTasks: Array<{ title: string; type: "code" | "debug" | "build" | "explain"; difficulty: string }>;
  confusionSignals: string[];
  knowledgeLayer: "surface" | "understanding" | "application" | "mastery";
  roadmapLink?: {
    phaseId: string;
    contributionScore: number;
  };
  interviewRelevance: {
    frequency: "low" | "medium" | "high";
    importance: number; // 0-100
    usageContext: string;
    commonQuestions: string[];
    realWorldUsage: string[];
  };
};

export type CareerNote = {
  id: string;
  userId: string;
  title: string;
  content: string;
  topic?: string;
  tags: string[];
  linkedSkills: string[];
  sourceUrl?: string;
  sourceType?: "manual" | "pdf" | "image" | "web" | "youtube";
  strength: number;
  metadata?: NoteAIMetadata;
  concepts: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  knowledgeLayer: "surface" | "understanding" | "application" | "mastery";
  interviewImportance: number;
  confusionCount: number;
  revisionStrategy: "implementation" | "conceptual" | "practical_repetition" | "visual";
  relatedNoteIds: string[];
  projectLinks: string[];
  nextReviewAt?: string;
  lastReviewed?: string;
  reviewCount: number;
  lapseCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ConceptNode = {
  id: string;
  userId: string;
  name: string;
  category: "algorithm" | "framework" | "pattern" | "language" | "concept" | "tool";
  difficulty: "beginner" | "intermediate" | "advanced";
  noteIds: string[];
  relatedConceptIds: string[];
  interviewFrequency: "low" | "medium" | "high" | "critical";
  retentionState: "strong" | "stable" | "weakening" | "critical";
  retentionScore: number; // 0-100
  masteryValidated: boolean;
  lastReviewed?: string;
  projectLinks: string[];
  roadmapPhaseIds: string[];
  executionEvidence: number;
  createdAt: string;
  updatedAt: string;
};

export type MemoryDecayState = {
  concept: string;
  noteId: string;
  retentionStrength: number; // 0-100
  lastReviewed: string;
  forgettingCurveScore: number; // 0-100 (100 = fully retained)
  nextRevisionDate: string;
  revisionUrgency: "low" | "medium" | "high" | "critical";
  revisionStrategy: "implementation" | "conceptual" | "practical_repetition" | "visual";
};

export type KnowledgeHealthMetrics = {
  totalConcepts: number;
  strongConcepts: number;
  stableConcepts: number;
  weakeningConcepts: number;
  criticalConcepts: number;
  overallRetention: number; // 0-100
  recallHealth: number; // 0-100
  interviewReadiness: number; // 0-100
  executionReadiness: number; // 0-100
  knowledgeMomentum: "accelerating" | "steady" | "declining" | "stalled";
  todayRevisionCount: number;
  todayRevisionTarget: number;
  streakDays: number;
  totalNotes: number;
  dueCount: number;
};

export type RevisionPriority = {
  noteId: string;
  title: string;
  topic: string;
  concepts: string[];
  urgency: "critical" | "high" | "medium" | "low";
  reason: string;
  reasonType: "forgetting_curve" | "interview_critical" | "roadmap_relevant" | "execution_gap" | "repeated_lapse";
  estimatedMinutes: number;
  revisionType: "recall" | "implementation" | "explanation" | "quiz";
  strength: number;
  lastAttemptGrade?: RecallGrade;
};

export type NoteEvolution = {
  version: number;
  timestamp: string;
  changeType: "insight_added" | "misunderstanding_corrected" | "depth_increased" | "simplified";
  summary: string;
  content: string;
};

export type RecallGrade = "good" | "weak" | "wrong";

export type RecallPrompt = {
  noteId: string;
  title: string;
  topic: string;
  prompt: string;
  promptType: "explain" | "implement" | "compare" | "quiz" | "own_words";
  strength: number;
  nextReviewAt?: string;
};

export type RecallReviewResult = {
  note: CareerNote;
  grade: RecallGrade;
  score: number;
  nextReviewAt: string;
  feedback: string;
};

export type WeakTopic = {
  topic: string;
  noteCount: number;
  averageStrength: number;
  dueCount: number;
};
