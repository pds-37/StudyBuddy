import { apiClient } from "./client";
import type { JobListing } from "@studybuddy/shared";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  matchScore?: number;
  requiredSkills: string[];
  type: string;
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
}

export interface CareerRecommendation {
  job: Job;
  matchScore: number;
}

export interface ReadinessProfile {
  readiness: {
    frontend: number;
    backend: number;
    ai: number;
    interview: number;
  };
  projectDepth: number;
  consistencyScore: number;
}

/** Gets personalized job recommendations. */
export async function getRecommendations(): Promise<CareerRecommendation[]> {
  const response = await apiClient.get<{ recommendations: CareerRecommendation[] }>("/jobs/recommendations");
  return response.data.recommendations;
}

/** Gets live and curated job listings for the student. */
export async function getJobs(): Promise<JobListing[]> {
  const response = await apiClient.get<{ jobs: JobListing[] }>("/jobs");
  return response.data.jobs;
}

/** Gets the student's career readiness profile. */
export async function getReadiness(): Promise<ReadinessProfile> {
  const response = await apiClient.get<{ readiness: ReadinessProfile }>("/jobs/readiness");
  return response.data.readiness;
}

/** Matches a specific job to the student. */
export async function matchJob(jobId: string) {
  const response = await apiClient.post(`/jobs/match/${jobId}`);
  return response.data.match;
}
