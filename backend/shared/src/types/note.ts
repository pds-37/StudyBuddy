export type CareerNote = {
  id: string;
  userId: string;
  title: string;
  content: string;
  topic?: string;
  tags: string[];
  linkedSkills: string[];
  sourceUrl?: string;
  strength: number;
  nextReviewAt?: string;
  lastReviewed?: string;
  reviewCount: number;
  lapseCount: number;
  createdAt: string;
  updatedAt: string;
};

export type RecallGrade = "good" | "weak" | "wrong";

export type RecallPrompt = {
  noteId: string;
  title: string;
  topic: string;
  prompt: string;
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
