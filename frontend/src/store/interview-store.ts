import { create } from "zustand";
import { 
  startInterviewSession, 
  getInterviewSessions, 
  getInterviewSession, 
  submitInterviewAnswer,
  toggleQuestionFlag,
  getQuestionHint,
  saveQuestionDraft,
  skipQuestion,
  type StartInterviewOptions
} from "../lib/api/interview";
import { getApiErrorMessage } from "../lib/api/error";
import type { InterviewSession } from "@studybuddy/shared";

type InterviewState = {
  sessions: InterviewSession[];
  currentSession: InterviewSession | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;

  fetchSessions: () => Promise<void>;
  fetchSession: (id: string) => Promise<void>;
  startSession: (options?: StartInterviewOptions) => Promise<InterviewSession | null>;
  submitAnswer: (sessionId: string, questionId: string, answer: string) => Promise<void>;
  toggleFlag: (sessionId: string, questionId: string) => Promise<void>;
  getHint: (sessionId: string, questionId: string) => Promise<string>;
  saveDraft: (sessionId: string, questionId: string, draftAnswer: string) => Promise<void>;
  skipQuestion: (sessionId: string, questionId: string) => Promise<void>;
  clearError: () => void;
};

export const useInterviewStore = create<InterviewState>((set, get) => ({
  sessions: [],
  currentSession: null,
  loading: false,
  submitting: false,
  error: null,

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await getInterviewSessions();
      set({ sessions, loading: false });
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error, "Failed to load interview history") });
    }
  },

  fetchSession: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const session = await getInterviewSession(id);
      set({ currentSession: session, loading: false });
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error, "Failed to load interview session") });
    }
  },

  startSession: async (options?: StartInterviewOptions) => {
    set({ loading: true, error: null });
    try {
      const session = await startInterviewSession(options);
      set(state => ({ 
        currentSession: session, 
        sessions: [session, ...state.sessions],
        loading: false 
      }));
      return session;
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error, "Failed to start interview") });
      return null;
    }
  },

  submitAnswer: async (sessionId: string, questionId: string, answer: string) => {
    set({ submitting: true, error: null });
    try {
      const session = await submitInterviewAnswer(sessionId, questionId, answer);
      set(state => ({ 
        currentSession: session,
        sessions: state.sessions.map(s => s.id === session.id ? session : s),
        submitting: false 
      }));
    } catch (error) {
      set({ submitting: false, error: getApiErrorMessage(error, "Failed to submit answer") });
    }
  },

  toggleFlag: async (sessionId: string, questionId: string) => {
    try {
      const session = await toggleQuestionFlag(sessionId, questionId);
      set(state => ({
        currentSession: session,
        sessions: state.sessions.map(s => s.id === session.id ? session : s)
      }));
    } catch (error) {
      set({ error: getApiErrorMessage(error, "Failed to flag question") });
    }
  },

  getHint: async (sessionId: string, questionId: string): Promise<string> => {
    try {
      return await getQuestionHint(sessionId, questionId);
    } catch (error) {
      set({ error: getApiErrorMessage(error, "Failed to fetch question hint") });
      return "Focus on performance metrics and structural efficiency.";
    }
  },

  saveDraft: async (sessionId: string, questionId: string, draftAnswer: string) => {
    try {
      const session = await saveQuestionDraft(sessionId, questionId, draftAnswer);
      set(state => ({
        currentSession: session,
        sessions: state.sessions.map(s => s.id === session.id ? session : s)
      }));
    } catch (error) {
      console.error("Draft save failed:", error);
    }
  },

  skipQuestion: async (sessionId: string, questionId: string) => {
    set({ submitting: true, error: null });
    try {
      const session = await skipQuestion(sessionId, questionId);
      set(state => ({
        currentSession: session,
        sessions: state.sessions.map(s => s.id === session.id ? session : s),
        submitting: false
      }));
    } catch (error) {
      set({ submitting: false, error: getApiErrorMessage(error, "Failed to skip question") });
    }
  },

  clearError: () => set({ error: null })
}));
