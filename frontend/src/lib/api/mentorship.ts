import { apiClient } from "./client";
import type { MentorshipMatch } from "@studybuddy/shared";

export async function getMentorshipMatches(): Promise<MentorshipMatch[]> {
  const { data } = await apiClient.get<MentorshipMatch[]>("/mentorship/matches");
  return data;
}

export async function updateMentorshipStatus(id: string, status: "accepted" | "declined"): Promise<MentorshipMatch> {
  const { data } = await apiClient.patch<MentorshipMatch>(`/mentorship/matches/${id}/status`, { status });
  return data;
}
