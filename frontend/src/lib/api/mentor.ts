import { apiClient } from "./client";
import type { MentorTaskStatus, MentorTodayPlan } from "@studybuddy/shared";

type MentorTodayResponse = {
  plan: MentorTodayPlan;
};

export type AdoptMentorStrategyInput = {
  targetRole?: string;
  recoveryPlan: string;
  nextSkills: string[];
  gaps: Array<{
    skill: string;
    gapScore?: number;
    userScore?: number;
  }>;
};

export async function getMentorToday(): Promise<MentorTodayPlan> {
  const response = await apiClient.get<MentorTodayResponse>("/mentor/today");
  return response.data.plan;
}

export async function adoptMentorStrategy(input: AdoptMentorStrategyInput): Promise<MentorTodayPlan> {
  const response = await apiClient.post<MentorTodayResponse>("/mentor/strategy", input);
  return response.data.plan;
}

export async function recordMentorTaskFeedback(
  taskId: string,
  input:
    | { type: "start"; note?: string }
    | { type: "stuck"; note?: string }
    | { type: "confidence"; confidenceScore: number; note?: string }
): Promise<MentorTodayPlan> {
  const response = await apiClient.post<MentorTodayResponse>(`/mentor/today/tasks/${taskId}/feedback`, input);
  return response.data.plan;
}

export async function updateMentorTaskStatus(taskId: string, status: MentorTaskStatus): Promise<MentorTodayPlan> {
  const response = await apiClient.patch<MentorTodayResponse>(`/mentor/today/tasks/${taskId}`, { status });
  return response.data.plan;
}
