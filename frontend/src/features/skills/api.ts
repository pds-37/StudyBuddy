import { apiClient } from "../../lib/api/client";
import { type SkillGapAnalysis, type SkillSuggestion } from "./types";

/** Searches the backend skill taxonomy for autocomplete suggestions. */
async function search(query: string, limit = 8) {
  const response = await apiClient.get<{ skills: SkillSuggestion[] }>("/skills/search", {
    params: { q: query, limit }
  });

  return response.data.skills;
}

/** Loads the authenticated user's skill gap analysis. */
async function getGapAnalysis() {
  const response = await apiClient.get<{ analysis: SkillGapAnalysis }>("/skills/gap");
  return response.data.analysis;
}

export const skillsApi = {
  search,
  getGapAnalysis
};
