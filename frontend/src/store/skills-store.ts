import { create } from "zustand";
import { getSkillGap, type SkillGapAnalysis } from "../lib/api/skills";
import { getApiErrorMessage } from "../lib/api/error";

type SkillsState = {
  analysis: SkillGapAnalysis | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchAnalysis: (force?: boolean) => Promise<void>;
  clearError: () => void;
};

/** Zustand store for skills and gap analysis state. */
export const useSkillsStore = create<SkillsState>((set, get) => ({
  analysis: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchAnalysis: async (force = false) => {
    const state = get();

    if (!force && !state.error && state.lastFetched && Date.now() - state.lastFetched < 5 * 60 * 1000) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const analysis = await getSkillGap();
      set({
        analysis,
        loading: false,
        lastFetched: Date.now(),
        error: null
      });
    } catch (error) {
      set({
        loading: false,
        error: getApiErrorMessage(error, "Failed to analyze skill gap")
      });
    }
  },

  clearError: () => set({ error: null })
}));
