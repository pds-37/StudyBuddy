import { apiClient } from "./client";
import type { CareerNote, RecallGrade, RecallPrompt, RecallReviewResult, WeakTopic } from "@studybuddy/shared";

export type RecallStats = {
  totalNotes: number;
  dueCount: number;
  averageStrength: number;
  weakTopics: WeakTopic[];
  reviewedToday: number;
  streakDays: number;
  retentionScore: number;
};

export async function getDueRecallPrompts(limit = 10): Promise<RecallPrompt[]> {
  const response = await apiClient.get<{ prompts: RecallPrompt[] }>("/recall/due", { params: { limit } });
  return response.data.prompts;
}

export async function getRecallStats(): Promise<RecallStats> {
  const response = await apiClient.get<RecallStats>("/recall/stats");
  return response.data;
}

export async function reviewRecallAnswer(data: {
  noteId: string;
  answer: string;
  grade?: RecallGrade;
}): Promise<RecallReviewResult & { note: CareerNote }> {
  const response = await apiClient.post<RecallReviewResult & { note: CareerNote }>("/recall/review", data);
  return response.data;
}
