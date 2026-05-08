import { create } from "zustand";
import { 
  getRoadmap, 
  getUserRoadmaps,
  generateRoadmapFromGaps, 
  expandRoadmap as apiExpandRoadmap,
  injectSkill as apiInjectSkill,
  rateRoadmap as apiRateRoadmap 
} from "../lib/api/roadmaps";
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
  rateRoadmap: (roadmapId: string, rating: number, feedback?: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: "pending" | "completed" | "skipped") => Promise<void>;
  addTrack: (data: any) => Promise<Roadmap | null>;
  injectSkill: (skill: string) => Promise<void>;
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
      const roadmaps = await getUserRoadmaps();
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
  },
  
  rateRoadmap: async (roadmapId, rating, feedback) => {
    try {
      const updatedRoadmap = await apiRateRoadmap(roadmapId, rating, feedback);
      set((state) => ({
        roadmaps: state.roadmaps.map((r) => (r.id === roadmapId ? updatedRoadmap : r)),
        currentRoadmap: state.currentRoadmap?.id === roadmapId ? updatedRoadmap : state.currentRoadmap,
        error: null
      }));
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Failed to submit rating")
      });
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const { updateTaskStatus: apiUpdateTaskStatus } = await import("../lib/api/roadmaps");
      const updatedRoadmap = await apiUpdateTaskStatus(taskId, status);
      set((state) => ({
        roadmaps: state.roadmaps.map((r) => (r.id === updatedRoadmap.id ? updatedRoadmap : r)),
        currentRoadmap: updatedRoadmap,
        error: null
      }));
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Failed to update task status")
      });
    }
  },

  addTrack: async (data) => {
    set({ generating: true, error: null });
    try {
      const roadmap = await apiExpandRoadmap(data);
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
        error: getApiErrorMessage(error, "Failed to expand career direction")
      });
      return null;
    }
  },

  injectSkill: async (skill) => {
    set({ loading: true, error: null });
    try {
      const updatedRoadmap = await apiInjectSkill({ skill });
      set((state) => ({
        roadmaps: state.roadmaps.map((r) => (r.id === updatedRoadmap.id ? updatedRoadmap : r)),
        currentRoadmap: updatedRoadmap,
        loading: false,
        error: null
      }));
    } catch (error) {
      set({
        loading: false,
        error: getApiErrorMessage(error, "Failed to inject skill")
      });
    }
  }
}));
