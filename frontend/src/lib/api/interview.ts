import { apiClient } from "./client";
import type { InterviewSession } from "@studybuddy/shared";

export interface StartInterviewOptions {
  mode?: "technical" | "scenario" | "behavioral" | "company" | "mock";
  difficulty?: "beginner" | "intermediate" | "advanced" | "adaptive";
  interviewerPersonality?: "friendly" | "strict" | "founder" | "architect" | "recruiter";
  pressureMode?: boolean;
  timeLimitMinutes?: number;
  targetCompany?: string;
}

export async function startInterviewSession(options: StartInterviewOptions = {}): Promise<InterviewSession> {
  const { data } = await apiClient.post<InterviewSession>("/interview", options);
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

export async function toggleQuestionFlag(sessionId: string, questionId: string): Promise<InterviewSession> {
  const { data } = await apiClient.post<InterviewSession>(`/interview/${sessionId}/questions/${questionId}/flag`);
  return data;
}

export async function getQuestionHint(sessionId: string, questionId: string): Promise<string> {
  const { data } = await apiClient.get<{ hint: string }>(`/interview/${sessionId}/questions/${questionId}/hint`);
  return data.hint;
}

export async function saveQuestionDraft(sessionId: string, questionId: string, draftAnswer: string): Promise<InterviewSession> {
  const { data } = await apiClient.post<InterviewSession>(`/interview/${sessionId}/questions/${questionId}/draft`, { draftAnswer });
  return data;
}

export async function skipQuestion(sessionId: string, questionId: string): Promise<InterviewSession> {
  const { data } = await apiClient.post<InterviewSession>(`/interview/${sessionId}/questions/${questionId}/skip`);
  return data;
}
