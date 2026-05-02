export type ResumeTailorTone = "concise" | "impact" | "technical";

export type ResumeTailorRequest = {
  targetRole: string;
  jobDescription?: string;
  currentResume: string;
  tone?: ResumeTailorTone;
};

export type ResumeBulletRewrite = {
  before: string;
  after: string;
  reason: string;
};

export type ResumeTailorResult = {
  roleFitSummary: string;
  targetHeadline: string;
  tailoredSummary: string;
  keywordAdditions: string[];
  bulletRewrites: ResumeBulletRewrite[];
  missingProofPoints: string[];
  atsWarnings: string[];
  nextActions: string[];
};

