export type SkillTaxonomyItem = {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  source: "onet" | "esco" | "custom";
};

export type SkillDimension = {
  confidence: number;
  retention: number;
  interviewReady: number;
  practical: number;
  momentum: "stagnating" | "improving" | "declining";
};

export type SkillGap = {
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

export type SkillIntelligenceReport = {
  targetRole: string;
  overallScore: number;
  readiness: CareerReadiness;
  roleMatches: RoleMatch[];
  gaps: SkillGap[];
  blockers: string[];
  careerTrajectory: string;
  predictiveInsights: string[];
  recommendations: {
    nextSkills: string[];
    recoveryPlan?: string;
  };
  provider: "huggingface" | "local-fallback" | "veda-ai";
};
