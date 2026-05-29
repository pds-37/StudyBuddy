import { create } from "zustand";
import { 
  startPanelSession, 
  getPanelSessions, 
  getPanelSession, 
  submitPanelAnswer, 
  type PanelSession 
} from "../lib/api/panel-interview";
import { getApiErrorMessage } from "../lib/api/error";

interface PanelInterviewState {
  currentSession: PanelSession | null;
  sessions: PanelSession[];
  loading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  startSession: () => Promise<void>;
  loadSession: (id: string) => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
}

export const usePanelInterviewStore = create<PanelInterviewState>((set, get) => ({
  currentSession: null,
  sessions: [],
  loading: false,
  error: null,

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await getPanelSessions();
      set({ sessions, loading: false });
    } catch (err) {
      set({ 
        error: getApiErrorMessage(err, "Failed to load panel session history"), 
        loading: false 
      });
    }
  },

  startSession: async () => {
    set({ loading: true, error: null });
    try {
      const session = await startPanelSession();
      set({ currentSession: session, loading: false });
    } catch (err) {
      set({ 
        error: getApiErrorMessage(err, "Failed to initialize multi-agent hiring panel"), 
        loading: false 
      });
    }
  },

  loadSession: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const session = await getPanelSession(id);
      set({ currentSession: session, loading: false });
    } catch (err) {
      set({ 
        error: getApiErrorMessage(err, "Failed to retrieve panel session"), 
        loading: false 
      });
    }
  },

  submitAnswer: async (questionId: string, answer: string) => {
    const session = get().currentSession;
    if (!session) return;

    set({ loading: true, error: null });
    try {
      const updatedSession = await submitPanelAnswer(session.id, questionId, answer);
      set({ currentSession: updatedSession, loading: false });
    } catch (err) {
      set({ 
        error: getApiErrorMessage(err, "Failed to record panel answer"), 
        loading: false 
      });
    }
  },

  clearSession: () => {
    set({ currentSession: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));
