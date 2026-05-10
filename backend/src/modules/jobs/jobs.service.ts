import { JobModel, ApplicationModel, type JobDocument } from "./job.model.js";
import { UserModel } from "../users/user.model.js";
import { RoadmapModel } from "../roadmaps/roadmap.model.js";
import { studentIntelligenceService } from "../intelligence/student-intelligence.service.js";
import { ApiError } from "../../utils/api-error.js";

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

    // Get jobs that match target roles
    const jobs = await JobModel.find({
      category: { $in: user.careerProfile.targetRoles.map(r => r.toLowerCase() as any) }
    }).limit(20);

    const recommendations = jobs.map(job => {
      const readiness = user.careerProfile.readiness[job.category as keyof typeof user.careerProfile.readiness] || 0;
      const score = Math.min(100, readiness + (user.behaviorProfile.consistencyScore / 10));
      return { job, matchScore: score };
    });

    return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }

  static async getJobs(userId: string) {
    return JobModel.find().sort({ postedAt: -1 }).limit(20);
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
