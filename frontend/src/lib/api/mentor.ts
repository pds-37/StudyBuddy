import { apiClient } from "./client";
import type { MentorTaskStatus, MentorTodayPlan } from "@studybuddy/shared";

type MentorTodayResponse = {
  plan: MentorTodayPlan;
};

export async function getMentorToday(): Promise<MentorTodayPlan> {
  const response = await apiClient.get<MentorTodayResponse>("/mentor/today");
  return response.data.plan;
}

export async function updateMentorTaskStatus(taskId: string, status: MentorTaskStatus): Promise<MentorTodayPlan> {
  const response = await apiClient.patch<MentorTodayResponse>(`/mentor/today/tasks/${taskId}`, { status });
  return response.data.plan;
}
