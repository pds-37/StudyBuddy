import { JobModel, ApplicationModel, type JobDocument } from "./job.model.js";
import { UserModel, type UserDocument } from "../users/user.model.js";
import { RoadmapModel } from "../roadmaps/roadmap.model.js";
import { studentIntelligenceService } from "../intelligence/student-intelligence.service.js";
import { ApiError } from "../../utils/api-error.js";
import { env } from "../../config/env.js";
import { fetchLiveJobs } from "./jobs.live.js";
import type { EnrichedJobListing } from "./jobs.types.js";

const CURATED_JOBS: EnrichedJobListing[] = [
  {
    id: "curated-frontend-intern",
    title: "Frontend Developer Intern",
    company: "Turing Launchpad",
    location: "Remote, India",
    requiredSkills: ["React", "JavaScript", "CSS", "Git"],
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=frontend%20developer%20intern&location=India",
    source: "LinkedIn search",
    sources: ["LinkedIn search"],
    provider: "curated",
    postedAt: new Date().toISOString(),
    employmentType: "Internship",
    isRemote: true,
    description: "Frontend internship openings suitable for students building React, JavaScript, and UI engineering proof."
  },
  {
    id: "curated-software-engineer-intern",
    title: "Software Engineer Intern",
    company: "Early Career Network",
    location: "India",
    requiredSkills: ["Data Structures", "Algorithms", "JavaScript", "Git"],
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern&location=India",
    source: "LinkedIn search",
    sources: ["LinkedIn search"],
    provider: "curated",
    postedAt: new Date().toISOString(),
    employmentType: "Internship",
    isRemote: false,
    description: "Student-friendly software engineering internships focused on coding fundamentals, projects, and interview readiness."
  },
  {
    id: "curated-fullstack-junior",
    title: "Junior Full Stack Developer",
    company: "Startup Hiring Feed",
    location: "Remote / Hybrid",
    requiredSkills: ["React", "Node.js", "APIs", "MongoDB"],
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=junior%20full%20stack%20developer&location=India",
    source: "LinkedIn search",
    sources: ["LinkedIn search"],
    provider: "curated",
    postedAt: new Date().toISOString(),
    employmentType: "Full-time",
    isRemote: true,
    description: "Junior full-stack roles for students with portfolio projects, API integration experience, and frontend confidence."
  },
  {
    id: "curated-ai-engineer-intern",
    title: "AI Engineer Intern",
    company: "Applied AI Roles",
    location: "Remote, India",
    requiredSkills: ["Python", "Machine Learning", "APIs", "Prompt Engineering"],
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=ai%20engineer%20intern&location=India",
    source: "LinkedIn search",
    sources: ["LinkedIn search"],
    provider: "curated",
    postedAt: new Date().toISOString(),
    employmentType: "Internship",
    isRemote: true,
    description: "AI internship search feed for students turning projects, notes, and model/API experience into career proof."
  }
];

function toJobListing(job: JobDocument): EnrichedJobListing {
  return {
    id: String(job._id),
    title: job.title,
    company: job.company,
    location: job.location,
    requiredSkills: job.requiredSkills ?? [],
    applyUrl: job.applyUrl,
    source: job.source,
    sources: job.source ? [job.source] : [],
    provider: "database",
    postedAt: job.postedAt?.toISOString(),
    employmentType: job.type,
    isRemote: job.type === "remote" || job.location.toLowerCase().includes("remote"),
    description: job.description
  };
}

function userTargetQuery(user: UserDocument | null) {
  const targetRoles = [
    ...(user?.targetRoles ?? []),
    ...(user?.careerProfile?.targetRoles ?? [])
  ].filter(Boolean);

  return targetRoles[0] ?? env.jobSearchFallbackQuery;
}

function scoreJob(job: EnrichedJobListing, user: UserDocument) {
  const currentSkills = new Set((user.currentSkills ?? []).map((skill) => skill.toLowerCase()));
  const requiredSkills = job.requiredSkills ?? [];
  const matchedSkills = requiredSkills.filter((skill) => currentSkills.has(skill.toLowerCase())).length;
  const skillScore = requiredSkills.length > 0 ? (matchedSkills / requiredSkills.length) * 55 : 20;
  const targetRoles = [...(user.targetRoles ?? []), ...(user.careerProfile?.targetRoles ?? [])].join(" ").toLowerCase();
  const roleText = `${job.title} ${job.description ?? ""}`.toLowerCase();
  const roleScore = targetRoles && roleText.includes(targetRoles.split(/[,\s]+/)[0]) ? 20 : 10;
  const consistencyScore = Math.min(15, (user.behaviorProfile?.consistencyScore ?? 40) / 7);
  const sourceScore = job.provider === "curated" ? 5 : 10;

  return Math.max(25, Math.min(98, Math.round(skillScore + roleScore + consistencyScore + sourceScore)));
}

async function loadMarketJobs(userId: string, limit = 20) {
  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const query = userTargetQuery(user);
  const [databaseJobs, liveJobs] = await Promise.all([
    JobModel.find().sort({ postedAt: -1 }).limit(limit),
    fetchLiveJobs({
      query,
      location: env.jobSearchLocation,
      limit
    }).catch((error) => {
      console.warn("Live jobs fetch failed:", error);
      return [];
    })
  ]);

  const jobs = [...liveJobs, ...databaseJobs.map(toJobListing), ...CURATED_JOBS];
  const seen = new Set<string>();

  return jobs
    .filter((job) => {
      const key = `${job.title}|${job.company}|${job.location}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((job) => ({
      ...job,
      matchScore: scoreJob(job, user)
    }))
    .sort((left, right) => (right.matchScore ?? 0) - (left.matchScore ?? 0))
    .slice(0, limit);
}

/**
 * Career Opportunity Intelligence Engine
 * Predicts job readiness, performs matching, and generates preparation paths.
 */
export class CareerService {
  /**
   * Recalculates the user's career readiness profile based on current progress.
   */
  static async updateReadinessProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const activeRoadmaps = await RoadmapModel.find({ userId, status: "active" });
    
    // Calculate readiness scores based on roadmap completion %
    let frontend = 0, backend = 0, ai = 0;
    
    for (const r of activeRoadmaps) {
      const completion = r.readinessScore || 0;
      if (r.category === "Career" || r.category === "Expansion") {
        const role = r.targetRole.toLowerCase();
        if (role.includes("frontend")) frontend = Math.max(frontend, completion);
        if (role.includes("backend")) backend = Math.max(backend, completion);
        if (role.includes("ai")) ai = Math.max(ai, completion);
      }
    }

    user.careerProfile.readiness = { 
      frontend,
      backend,
      ai,
      interview: user.careerProfile.readiness.interview 
    };

    await user.save();
    return user.careerProfile;
  }

  /**
   * Performs AI Matching between a student and a specific job.
   */
  static async matchJob(userId: string, jobId: string) {
    const user = await UserModel.findById(userId);
    const job = await JobModel.findById(jobId);
    if (!user || !job) throw new ApiError(404, "User or Job not found");

    const readiness = user.careerProfile.readiness[job.category as keyof typeof user.careerProfile.readiness] || 0;
    const matchScore = Math.min(100, readiness + (user.behaviorProfile.consistencyScore / 10));
    
    const application = await ApplicationModel.findOneAndUpdate(
      { userId, jobId },
      { 
        $set: { 
          matchScore,
          aiReadinessAnalysis: {
            strengthAreas: job.requiredSkills.filter(s => user.currentSkills.includes(s)),
            weakAreas: job.requiredSkills.filter(s => !user.currentSkills.includes(s))
          }
        } 
      },
      { upsert: true, new: true }
    );

    await studentIntelligenceService.emitEvent(userId, {
      type: "JOB_TARGETED",
      source: "jobs",
      entityId: job._id.toString(),
      payload: {
        jobTitle: job.title,
        company: job.company,
        category: job.category,
        requiredSkills: job.requiredSkills,
        matchScore
      }
    }).catch(error => console.error("Student intelligence event failed:", error));

    return application;
  }

  /**
   * Recommends top 5 highly relevant opportunities.
   */
  static async getRecommendations(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const jobs = await loadMarketJobs(userId, 20);
    const recommendations = jobs.map((job) => ({
      job,
      matchScore: job.matchScore ?? scoreJob(job, user)
    }));

    return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }

  static async getJobs(userId: string) {
    return loadMarketJobs(userId, 20);
  }

  static async getJob(jobId: string) {
    return JobModel.findById(jobId);
  }
}

export const jobsService = {
  getRecommendations: CareerService.getRecommendations,
  getReadiness: CareerService.updateReadinessProfile,
  matchJob: CareerService.matchJob,
  getJobs: CareerService.getJobs,
  getJob: CareerService.getJob
};
