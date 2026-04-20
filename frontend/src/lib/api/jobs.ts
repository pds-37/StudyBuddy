import { apiClient } from "./client";
import type { JobListing } from "@studybuddy/shared";

type JobsResponse = {
  jobs: JobListing[];
};

type JobResponse = {
  job: JobListing;
};

/** Retrieves jobs with optional user-specific matching. */
export async function getJobs(limit?: number): Promise<JobListing[]> {
  const response = await apiClient.get<JobsResponse>("/jobs", { params: { limit } });
  return response.data.jobs;
}

/** Retrieves a single job by ID. */
export async function getJob(id: string): Promise<JobListing> {
  const response = await apiClient.get<JobResponse>(`/jobs/${id}`);
  return response.data.job;
}

/** Creates a new job listing. */
export async function createJob(data: {
  title: string;
  company: string;
  location: string;
  requiredSkills: string[];
  applyUrl?: string;
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
}): Promise<JobListing> {
  const response = await apiClient.post<JobResponse>("/jobs", data);
  return response.data.job;
}
