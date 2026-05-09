export type ResumeTailorTone = "concise" | "impact" | "technical";

export type ResumeMode = "startup" | "faang" | "internship" | "technical" | "minimal" | "ats_optimized";

export type ResumeTailorRequest = {
  targetRole: string;
  jobDescription?: string;
  currentResume: string;
  tone?: ResumeTailorTone;
  mode?: ResumeMode;
};

export type ResumeBulletRewrite = {
  before: string;
  after: string;
  reason: string;
  impactScore: number; // 0-100
  technicalDepthScore: number; // 0-100
};

export type ResumeProjectAnalysis = {
  projectName: string;
  originalDescription: string;
  strategicFraming: string;
  impactMetricsSuggested: string[];
  engineeringStorytelling: string;
};

export type AtsIntelligence = {
  score: number;
  missingKeywords: string[];
  formattingSafety: {
    status: "safe" | "warning" | "risk";
    issues: string[];
  };
  recruiterScanOptimization: string;
};

export type InterviewAlignment = {
  likelyQuestions: string[];
  weakDiscussionAreas: string[];
  projectExplanationGaps: string[];
};

export type ResumeTailorResult = {
  roleFitSummary: string;
  targetHeadline: string;
  tailoredSummary: string;
  keywordAdditions: string[];
  bulletRewrites: ResumeBulletRewrite[];
  projectAnalysis: ResumeProjectAnalysis[];
  atsIntelligence: AtsIntelligence;
  interviewAlignment: InterviewAlignment;
  missingProofPoints: string[];
  nextActions: string[];
};

export type ResumeVersion = {
  id: string;
  roleName: string;
  versionName: string; // e.g., "Frontend Resume", "Startup Version"
  createdAt: string;
  targetRole: string;
  content: string; // The full resume content or the result
  result?: ResumeTailorResult;
};
