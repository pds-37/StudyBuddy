import { JobModel, type JobDocument } from "./job.model.js";
import { UserModel } from "../users/user.model.js";
import { embeddingsService } from "../../services/ai/embeddings.service.js";
import { ApiError } from "../../utils/api-error.js";
import { env } from "../../config/env.js";
import { fetchLiveJobs } from "./jobs.live.js";
import type { JobListing } from "@studybuddy/shared";
import type { EnrichedJobListing, JobsUserProfile } from "./jobs.types.js";

type JobMatch = {
  job: EnrichedJobListing;
  score: number;
  matchedSkills: string[];
};

/** Converts a stored job document to the public API shape. */
function toJobListing(job: JobDocument, matchScore?: number): EnrichedJobListing {
  return {
    id: String(job._id),
    title: job.title,
    company: job.company,
    location: job.location,
    requiredSkills: job.requiredSkills,
    applyUrl: job.applyUrl ?? undefined,
    source: job.source ?? undefined,
    sources: job.source ? [job.source] : undefined,
    provider: job.source ?? undefined,
    matchScore
  };
}

/** Derives a job-search context from the user's profile or a safe fallback. */
function buildSearchContext(user: JobsUserProfile, limit: number) {
  const skills = user?.currentSkills ?? [];
  const role = user?.targetRoles?.join(" ") || user?.targetRole || skills.slice(0, 2).join(" ") || "software engineer";
  const preferences = user?.preferences ?? {};
  const preferredLocation =
    typeof preferences.jobSearchLocation === "string"
      ? preferences.jobSearchLocation
      : typeof preferences.location === "string"
        ? preferences.location
        : env.jobSearchLocation;

  return {
    query: role,
    location: preferredLocation,
    limit
  };
}

/** Loads manually curated jobs from MongoDB and ignores old mock fixtures. */
async function getStoredJobs(limit: number) {
  const jobs = await JobModel.find({ source: { $ne: "mock" } }).sort({ createdAt: -1 }).limit(limit);
  return jobs.map((job) => toJobListing(job));
}

/** Calculates a fit score between the user's skills and one job listing. */
async function calculateJobMatch(userSkills: string[], job: EnrichedJobListing): Promise<JobMatch> {
  let totalScore = 0;
  let matchedCount = 0;
  const matchedSkills: string[] = [];

  for (const jobSkill of job.requiredSkills) {
    const match = await embeddingsService.findBestSkillMatch(jobSkill, userSkills);
    if (match.similarity > 0.7) {
      totalScore += match.similarity;
      matchedCount += 1;
      matchedSkills.push(jobSkill);
    }
  }

  const averageScore = matchedCount > 0 ? totalScore / job.requiredSkills.length : 0;
  return {
    job,
    score: Math.round(averageScore * 100),
    matchedSkills
  };
}

/** Retrieves live jobs first, then falls back to any manual jobs stored in MongoDB. */
async function getJobs(userId?: string, limit: number = 20): Promise<JobListing[]> {
  const user = userId ? await UserModel.findById(userId).lean<JobsUserProfile>() : null;
  const liveJobs = await fetchLiveJobs(buildSearchContext(user, limit));
  const jobs = liveJobs.length > 0 ? liveJobs : await getStoredJobs(limit);

  if (jobs.length === 0) {
    const hasConfig = Boolean(env.jsearchApiKey || (env.adzunaAppId && env.adzunaAppKey));
    
    if (!hasConfig) {
      throw new ApiError(
        503,
        "No live jobs provider is configured. Add JSEARCH_API_KEY or ADZUNA_APP_ID / ADZUNA_APP_KEY to load current market jobs."
      );
    }

    throw new ApiError(
      404,
      `No live jobs found for "${buildSearchContext(user, limit).query}" in ${buildSearchContext(user, limit).location}. Try updating your profile or location.`
    );
  }

  if (!user || user.currentSkills.length === 0) {
    return jobs;
  }

  const jobsWithScores = await Promise.all(
    jobs.map((job) => calculateJobMatch(user.currentSkills, job))
  );

  jobsWithScores.sort((left, right) => right.score - left.score);
  return jobsWithScores.map((match) => ({
    ...match.job,
    matchScore: match.score
  }));
}

/** Retrieves a single stored job by ID. */
async function getJob(jobId: string): Promise<JobListing> {
  const job = await JobModel.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found.");
  }

  return toJobListing(job);
}

/** Creates a manual job listing (useful for admin backfills or custom feeds). */
async function createJob(data: {
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
}): Promise<EnrichedJobListing> {
  const job = await JobModel.create({
    title: data.title,
    company: data.company,
    location: data.location,
    requiredSkills: data.requiredSkills,
    applyUrl: data.applyUrl,
    source: "manual"
  });

  return {
    ...toJobListing(job),
    source: data.source ?? "Manual",
    sources: data.sources ?? (data.source ? [data.source] : ["Manual"]),
    provider: data.provider ?? "manual",
    postedAt: data.postedAt,
    employmentType: data.employmentType,
    isRemote: data.isRemote,
    salaryMin: data.salaryMin,
    salaryMax: data.salaryMax,
    salaryCurrency: data.salaryCurrency,
    description: data.description
  };
}

export const jobsService = {
  getJobs,
  getJobsForUser: (userId: string) => getJobs(userId),
  getJob,
  createJob
};
