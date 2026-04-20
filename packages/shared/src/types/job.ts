export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  requiredSkills: string[];
  applyUrl?: string;
  matchScore?: number;
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
