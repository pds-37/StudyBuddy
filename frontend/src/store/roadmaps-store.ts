import { create } from "zustand";
import { getRoadmap, generateRoadmapFromGaps } from "../lib/api/roadmaps";
import { getApiErrorMessage } from "../lib/api/error";
import type { Roadmap } from "@studybuddy/shared";

type RoadmapsState = {
  roadmaps: Roadmap[];
  currentRoadmap: Roadmap | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchRoadmaps: (force?: boolean) => Promise<void>;
  generateRoadmap: (timelineWeeks: number) => Promise<Roadmap | null>;
  setCurrentRoadmap: (roadmap: Roadmap | null) => void;
  clearError: () => void;
  refreshRoadmaps: () => Promise<void>;
};

/** Zustand store for roadmaps state management. */
export const useRoadmapsStore = create<RoadmapsState>((set, get) => ({
  roadmaps: [],
  currentRoadmap: null,
  loading: false,
  generating: false,
  error: null,
  lastFetched: null,

  fetchRoadmaps: async (force = false) => {
    const state = get();

    // Don't refetch if we have recent data and not forcing
    if (!force && !state.error && state.lastFetched && Date.now() - state.lastFetched < 2 * 60 * 1000) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const roadmap = await getRoadmap();
      const roadmaps = roadmap ? [roadmap] : [];
      const nextRoadmap =
        roadmaps.find((item) => item.id === state.currentRoadmap?.id) ??
        roadmaps[0] ??
        null;

      set({
        roadmaps,
        currentRoadmap: nextRoadmap,
        loading: false,
        lastFetched: Date.now(),
        error: null
      });
    } catch (error) {
      set({
        loading: false,
        error: getApiErrorMessage(error, "Failed to load roadmaps")
      });
    }
  },

  generateRoadmap: async (timelineWeeks: number) => {
    set({ generating: true, error: null });

    try {
      const roadmap = await generateRoadmapFromGaps(timelineWeeks);
      set(state => ({
        roadmaps: [roadmap, ...state.roadmaps],
        currentRoadmap: roadmap,
        generating: false,
        error: null
      }));
      return roadmap;
    } catch (error) {
      set({
        generating: false,
        error: getApiErrorMessage(error, "Failed to generate roadmap")
      });
      return null;
    }
  },

  setCurrentRoadmap: (roadmap) => set({ currentRoadmap: roadmap }),

  clearError: () => set({ error: null }),

  refreshRoadmaps: async () => {
    await get().fetchRoadmaps(true);
  }
}));
