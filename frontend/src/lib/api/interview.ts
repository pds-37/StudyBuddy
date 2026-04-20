import { apiClient } from "./client";
import type { InterviewSession } from "@studybuddy/shared";

export async function startInterviewSession(): Promise<InterviewSession> {
  const { data } = await apiClient.post<InterviewSession>("/interview");
  return data;
}

export async function getInterviewSessions(): Promise<InterviewSession[]> {
  const { data } = await apiClient.get<InterviewSession[]>("/interview");
  return data;
}

export async function getInterviewSession(id: string): Promise<InterviewSession> {
  const { data } = await apiClient.get<InterviewSession>(`/interview/${id}`);
  return data;
}

export async function submitInterviewAnswer(sessionId: string, questionId: string, answer: string): Promise<InterviewSession> {
  const { data } = await apiClient.post<InterviewSession>(`/interview/${sessionId}/questions/${questionId}/answer`, { answer });
  return data;
}
