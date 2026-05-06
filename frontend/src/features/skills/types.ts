export type SkillSuggestion = {
  id: string;
  name: string;
  category: string;
  source: string;
  aliases: string[];
};

export type SkillDimension = {
  confidence: number;
  retention: number;
  interviewReady: number;
  practical: number;
  momentum: "stagnating" | "improving" | "declining";
};

export type SkillGapItem = {
  skill: string;
  category: string;
  status: "strong" | "partial" | "weak";
  dimensions: SkillDimension;
  gapScore: number;
  userScore: number;
};

export type CareerReadiness = {
  learningFoundation: "Weak" | "Medium" | "Strong";
  problemSolving: "Weak" | "Medium" | "Strong";
  projectDepth: "Weak" | "Medium" | "Strong";
  interviewConfidence: "Weak" | "Medium" | "Strong";
};

export type RoleMatch = {
  role: string;
  matchPercentage: number;
  strengths: string[];
  blockers: string[];
  estimatedTimelineMonths: number;
};

export type SkillGapAnalysis = {
  targetRole: string;
  currentSkills: string[];
  overallScore: number;
  readiness: CareerReadiness;
  roleMatches: RoleMatch[];
  gaps: SkillGapItem[];
  blockers: string[];
  careerTrajectory: string;
  predictiveInsights: string[];
  recommendations: {
    nextSkills: string[];
    recoveryPlan?: string;
  };
  provider: "huggingface" | "local-fallback" | "veda-ai";
};
