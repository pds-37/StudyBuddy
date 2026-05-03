import type { JobListing } from "@studybuddy/shared";

export type EnrichedJobListing = JobListing & {
  source?: string;
  sources?: string[];
  provider?: string;
  postedAt?: string;
  employmentType?: string;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description?: string;
};

export type JobsUserProfile = {
  currentSkills: string[];
  targetRole?: string;
  targetRoles?: string[];
  preferences?: Record<string, unknown>;
} | null;
