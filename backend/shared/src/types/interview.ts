export type InterviewScore = {
  technicalAccuracy: number;
  clarity: number;
  scalabilityThinking: number;
  debuggingApproach: number;
  communication: number;
  optimizationAwareness: number;
  confidence: number;
  relevance?: number;
  starMethod?: number;
  overall: number;
  feedback: string;
};

export type InterviewQuestion = {
  id: string;
  question: string;
  category: "behavioral" | "technical" | "general" | "scenario" | "system_design";
  userAnswer?: string;
  score?: InterviewScore;
  hint?: string;
  idealAnswer?: string;
  missingConcepts?: string[];
  scalabilityGaps?: string[];
  communicationTips?: string[];
  isFlagged?: boolean;
  draftAnswer?: string;
};

export type InterviewSession = {
  id: string;
  userId: string;
  targetRole: string;
  status: "in_progress" | "completed";
  questions: InterviewQuestion[];
  overallScore?: number;
  overallFeedback?: string;
  mode: "technical" | "scenario" | "behavioral" | "company" | "mock";
  difficulty: "beginner" | "intermediate" | "advanced";
  interviewerPersonality: "friendly" | "strict" | "founder" | "architect" | "recruiter";
  pressureMode: boolean;
  timeLimitMinutes?: number;
  targetCompany?: string;
  createdAt: string;
  updatedAt: string;
};
