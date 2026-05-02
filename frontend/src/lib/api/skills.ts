import { apiClient as client } from "./client";

export type SkillGapItem = {
  skill: string;
  category: string;
  requiredScore: number;
  userScore: number;
  gapScore: number;
  matchedUserSkill: string | null;
  status: "strong" | "partial" | "missing";
  priority: "high" | "medium" | "low";
};

export type SkillGapAnalysis = {
  targetRole: string;
  experienceLevel: string;
  currentSkills: string[];
  overallScore: number;
  provider: string;
  gaps: SkillGapItem[];
  recommendations: {
    nextSkills: string[];
    missingSkills: string[];
    partialSkills: string[];
  };
};

export type SkillSuggestion = {
  id: string;
  name: string;
  category: string;
  source: string;
  aliases: string[];
};

/** Fetches a comprehensive skill gap analysis for the current user. */
export async function getSkillGap() {
  const { data } = await client.get<SkillGapAnalysis>("/skills/gap");
  return data;
}

/** Searches for skills in the taxonomy. */
export async function searchSkills(query: string, limit = 10) {
  const { data } = await client.get<SkillSuggestion[]>("/skills/search", {
    params: { q: query, limit }
  });
  return data;
}
