import { apiClient } from "./client";
import type { ResumeTailorRequest, ResumeTailorResult, ResumeVersion } from "@studybuddy/shared";
export type { ResumeTailorRequest, ResumeTailorResult, ResumeVersion };

export async function tailorResume(request: ResumeTailorRequest): Promise<{ versionId: string; result: ResumeTailorResult }> {
  const response = await apiClient.post<{ versionId: string; result: ResumeTailorResult }>("/resume/tailor", request);
  return response.data;
}

export async function getResumeVersions(): Promise<ResumeVersion[]> {
  const response = await apiClient.get<ResumeVersion[]>("/resume/versions");
  return response.data;
}

export async function getResumeVersion(id: string): Promise<ResumeVersion> {
  const response = await apiClient.get<ResumeVersion>(`/resume/versions/${id}`);
  return response.data;
}

export async function deleteResumeVersion(id: string): Promise<void> {
  await apiClient.delete(`/resume/versions/${id}`);
}
