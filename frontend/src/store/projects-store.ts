import { create } from "zustand";
import { getProjectMatches, updateProjectStatus, generateCustomProject, getMentorInsights, type ProjectMentorInsights } from "../lib/api/projects";
import { getApiErrorMessage } from "../lib/api/error";
import type { ProjectMatch } from "@studybuddy/shared";

type ProjectsState = {
  matches: ProjectMatch[];
  mentorInsights: ProjectMentorInsights | null;
  loading: boolean;
  generating: boolean;
  error: string | null;

  fetchMatches: () => Promise<void>;
  updateStatus: (id: string, status: "in_progress" | "completed") => Promise<void>;
  generateCustom: (ideaPrompt: string) => Promise<void>;
  clearError: () => void;
};

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  matches: [],
  mentorInsights: null,
  loading: false,
  generating: false,
  error: null,

  fetchMatches: async () => {
    set({ loading: true, error: null });
    try {
      const [matches, mentorInsights] = await Promise.all([
        getProjectMatches(),
        getMentorInsights().catch(() => null)
      ]);
      set({ matches, mentorInsights, loading: false });
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
      // Optionally re-fetch mentor insights to update stats in background
      getMentorInsights().then(insights => set({ mentorInsights: insights })).catch(() => {});
    } catch (error) {
      set({ error: getApiErrorMessage(error, "Failed to update project status") });
    }
  },

  generateCustom: async (ideaPrompt: string) => {
    set({ generating: true, error: null });
    try {
      const match = await generateCustomProject(ideaPrompt);
      set(state => ({
        matches: [match, ...state.matches],
        generating: false
      }));
      getMentorInsights().then(insights => set({ mentorInsights: insights })).catch(() => {});
    } catch (error) {
      set({ generating: false, error: getApiErrorMessage(error, "Failed to generate custom project") });
    }
  },

  clearError: () => set({ error: null })
}));
