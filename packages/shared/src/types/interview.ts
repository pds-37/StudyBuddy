export type InterviewScore = {
  clarity: number;
  relevance: number;
  starMethod: number; // Situation, Task, Action, Result usage
  overall: number;
  feedback: string;
};

export type InterviewQuestion = {
  id: string;
  question: string;
  category: "behavioral" | "technical" | "general";
  userAnswer?: string;
  score?: InterviewScore;
};

export type InterviewSession = {
  id: string;
  userId: string;
  targetRole: string;
  status: "in_progress" | "completed";
  questions: InterviewQuestion[];
  overallScore?: number;
  overallFeedback?: string;
  createdAt: string;
  updatedAt: string;
};
