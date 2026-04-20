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
