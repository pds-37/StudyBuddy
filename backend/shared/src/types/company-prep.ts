export type CompanyPrepDifficulty = "easy" | "medium" | "hard";

export type CompanyPrepQuestionStatus = "attempted" | "solved" | "bookmarked";

export type CompanyPrepRole =
  | "Software Engineer"
  | "Frontend"
  | "Backend"
  | "Full Stack"
  | "AI"
  | "DevOps"
  | "Data";

export type HiringProcedureStage = {
  order: number;
  name: string;
  format: string;
  duration: string;
  evaluationSignals: string[];
  preparationTips: string[];
  eliminationRisk: "low" | "medium" | "high";
};

export type CompanyTypeProfile = {
  id: string;
  name: string;
  summary: string;
  hiringFrequency: "very-high" | "high" | "medium" | "low";
  selectivity: "mass" | "balanced" | "selective" | "elite";
  difficulty: CompanyPrepDifficulty;
  roleTags: CompanyPrepRole[];
  focusAreas: string[];
  exampleCompanies: string[];
  procedure: HiringProcedureStage[];
  questionMix: Array<{ topic: string; weight: number }>;
  lastUpdated: string;
};

export type CompanyTypeCard = CompanyTypeProfile & {
  questionCount: number;
  matchScore: number;
  weakAreas: string[];
  strongAreas: string[];
  targeting: boolean;
};

export type CompanyQuestionTag = {
  companyTypeId: string;
  frequency: number;
  lastSeen: string;
  stage: string;
};

export type ApproachGuide = {
  pattern: string;
  signal: string;
  steps: string[];
  commonMistake: string;
  timeComplexity: string;
  spaceComplexity: string;
};

export type PrepQuestion = {
  id: string;
  title: string;
  difficulty: CompanyPrepDifficulty;
  topics: string[];
  roleTags: CompanyPrepRole[];
  companyTypes: CompanyQuestionTag[];
  approach: ApproachGuide;
  sourceRefs: Array<{ label: string; url?: string }>;
  userStatus?: CompanyPrepQuestionStatus;
  savedNoteId?: string;
};

export type CompanyPrepPlan = {
  companyTypeId: string;
  role: CompanyPrepRole;
  matchScore: number;
  weakAreas: string[];
  strongAreas: string[];
  questionIds: string[];
  nextQuestionIds: string[];
  generatedAt: string;
};

export type CompanyTypeDetail = CompanyTypeCard & {
  topPatterns: Array<{ pattern: string; count: number }>;
  questions: PrepQuestion[];
  prepPlan?: CompanyPrepPlan;
};

export type CompanyPrepQuestionQuery = {
  companyTypeId?: string;
  role?: CompanyPrepRole;
  topic?: string;
  difficulty?: CompanyPrepDifficulty;
  status?: CompanyPrepQuestionStatus | "unseen" | "all";
  sort?: "frequency" | "difficulty" | "title";
};
