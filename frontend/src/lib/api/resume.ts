import { apiClient } from "./client";
import type { ResumeTailorRequest, ResumeTailorResult, ResumeVersion } from "@studybuddy/shared";
export type { ResumeTailorRequest, ResumeTailorResult, ResumeVersion };

export async function tailorResume(request: ResumeTailorRequest): Promise<{ versionId: string; result: ResumeTailorResult }> {
  const response = await apiClient.post<{ versionId: string; result: ResumeTailorResult }>("/resume/tailor", request);
  return response.data;
}

export async function uploadTailor(resumeFile: File, jdFile: File, targetRole: string): Promise<{ versionId: string; result: ResumeTailorResult }> {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("jd", jdFile);
  formData.append("targetRole", targetRole);
  
  const response = await apiClient.post<{ versionId: string; result: ResumeTailorResult }>("/resume/upload-tailor", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
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
