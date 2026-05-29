import { apiClient } from "./client";

export interface PanelSpeaker {
  speaker: "Devin (Lead Architect)" | "Sarah (Product Manager)" | "Marcus (Engineering Manager)";
  dialogue: string;
  mood: "skeptical" | "satisfied" | "impatient" | "impressed" | "critical" | "neutral" | "supportive";
}

export interface PanelQuestion {
  id: string;
  question: string;
  category: "technical" | "system_design" | "behavioral" | "scenario";
  userAnswer?: string;
  debateTranscript: PanelSpeaker[];
  idealAnswer: string;
}

export interface PanelMetrics {
  satisfaction: number;
  impatience: number;
}

export interface PanelSession {
  id: string;
  userId: string;
  targetRole: string;
  status: "in_progress" | "completed";
  questions: PanelQuestion[];
  currentQuestionIndex: number;
  overallScore?: number;
  overallFeedback?: string;
  stressIndex: number;
  interruptionRisk: number;
  metrics: {
    architect: PanelMetrics;
    pm: PanelMetrics;
    em: PanelMetrics;
  };
  createdAt: string;
  updatedAt: string;
}

export async function startPanelSession(): Promise<PanelSession> {
  const { data } = await apiClient.post<PanelSession>("/interview/panel/start");
  return data;
}

export async function getPanelSessions(): Promise<PanelSession[]> {
  const { data } = await apiClient.get<PanelSession[]>("/interview/panel");
  return data;
}

export async function getPanelSession(id: string): Promise<PanelSession> {
  const { data } = await apiClient.get<PanelSession>(`/interview/panel/${id}`);
  return data;
}

export async function submitPanelAnswer(sessionId: string, questionId: string, answer: string): Promise<PanelSession> {
  const { data } = await apiClient.post<PanelSession>(`/interview/panel/${sessionId}/questions/${questionId}/answer`, { answer });
  return data;
}
