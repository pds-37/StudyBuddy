import { create } from "zustand";
import { getMentorshipMatches, updateMentorshipStatus } from "../lib/api/mentorship";
import { getApiErrorMessage } from "../lib/api/error";
import type { MentorshipMatch } from "@studybuddy/shared";

type MentorshipState = {
  matches: MentorshipMatch[];
  loading: boolean;
  error: string | null;

  fetchMatches: () => Promise<void>;
  updateStatus: (id: string, status: "accepted" | "declined") => Promise<void>;
  clearError: () => void;
};

export const useMentorshipStore = create<MentorshipState>((set, get) => ({
  matches: [],
  loading: false,
  error: null,

  fetchMatches: async () => {
    set({ loading: true, error: null });
    try {
      const matches = await getMentorshipMatches();
      set({ matches, loading: false });
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error, "Failed to load mentorship matches") });
    }
  },

  updateStatus: async (id: string, status: "accepted" | "declined") => {
    set({ error: null });
    try {
      const updatedMatch = await updateMentorshipStatus(id, status);
      set(state => ({
        matches: state.matches.map(m => m.id === id ? updatedMatch : m)
      }));
    } catch (error) {
      set({ error: getApiErrorMessage(error, "Failed to update match status") });
    }
  },

  clearError: () => set({ error: null })
}));
