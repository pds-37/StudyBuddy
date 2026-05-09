import { apiClient } from "./client";
import type { ProjectMatch } from "@studybuddy/shared";

export async function getProjectMatches(): Promise<ProjectMatch[]> {
  const { data } = await apiClient.get<ProjectMatch[]>("/projects/matches");
  return data;
}

export async function updateProjectStatus(id: string, status: "in_progress" | "completed"): Promise<ProjectMatch> {
  const { data } = await apiClient.patch<ProjectMatch>(`/projects/matches/${id}/status`, { status });
  return data;
}

export async function generateCustomProject(ideaPrompt: string): Promise<ProjectMatch> {
  const { data } = await apiClient.post<ProjectMatch>("/projects/generate", { ideaPrompt });
  return data;
}

export type ProjectMentorInsights = {
  encouragement: string;
  focusArea: { title: string; description: string; action: string };
  stats: { total: number; completed: number; inProgress: number; planning: number; streak: number };
};

export async function getMentorInsights(): Promise<ProjectMentorInsights> {
  const { data } = await apiClient.get<ProjectMentorInsights>("/projects/mentor");
  return data;
}
