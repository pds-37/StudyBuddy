export type SkillSuggestion = {
  id: string;
  name: string;
  category: string;
  source: string;
  aliases: string[];
};

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
  experienceLevel: "beginner" | "intermediate" | "advanced";
  currentSkills: string[];
  overallScore: number;
  provider: "huggingface" | "local-fallback";
  gaps: SkillGapItem[];
  recommendations: {
    nextSkills: string[];
    missingSkills: string[];
    partialSkills: string[];
  };
};
