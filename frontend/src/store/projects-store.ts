import { create } from "zustand";
import { getProjectMatches, updateProjectStatus } from "../lib/api/projects";
import { getApiErrorMessage } from "../lib/api/error";
import type { ProjectMatch } from "@studybuddy/shared";

type ProjectsState = {
  matches: ProjectMatch[];
  loading: boolean;
  error: string | null;

  fetchMatches: () => Promise<void>;
  updateStatus: (id: string, status: "in_progress" | "completed") => Promise<void>;
  clearError: () => void;
};

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  matches: [],
  loading: false,
  error: null,

  fetchMatches: async () => {
    set({ loading: true, error: null });
    try {
      const matches = await getProjectMatches();
      set({ matches, loading: false });
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error, "Failed to load project matches") });
    }
  },

  updateStatus: async (id: string, status: "in_progress" | "completed") => {
    set({ error: null });
    try {
      const updatedMatch = await updateProjectStatus(id, status);
      set(state => ({
        matches: state.matches.map(m => m.id === id ? updatedMatch : m)
      }));
    } catch (error) {
      set({ error: getApiErrorMessage(error, "Failed to update project status") });
    }
  },

  clearError: () => set({ error: null })
}));
