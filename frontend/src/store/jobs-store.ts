import { create } from "zustand";
import { getRecommendations } from "../lib/api/jobs";
import { getApiErrorMessage } from "../lib/api/error";
import type { JobListing } from "@studybuddy/shared";

type JobsState = {
  jobs: JobListing[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchJobs: (force?: boolean) => Promise<void>;
  clearError: () => void;
  refreshJobs: () => Promise<void>;
};

/** Zustand store for jobs state management. */
export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  loading: false,
  error: null,
  lastFetched: null,

  fetchJobs: async (force = false) => {
    const state = get();

    // Don't refetch if we have recent data and not forcing
    if (!force && !state.error && state.lastFetched && Date.now() - state.lastFetched < 5 * 60 * 1000) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const recommendations = await getRecommendations();
      const jobs = recommendations.map(r => r.job);
      set({
        jobs,
        loading: false,
        lastFetched: Date.now(),
        error: null
      });
    } catch (error) {
      set({
        loading: false,
        error: getApiErrorMessage(error, "Failed to load jobs")
      });
    }
  },

  clearError: () => set({ error: null }),

  refreshJobs: async () => {
    await get().fetchJobs(true);
  }
}));
