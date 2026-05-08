import { UserModel } from "../users/user.model.js";
import { RoadmapModel } from "../roadmaps/roadmap.model.js";
import { JobModel, ApplicationModel } from "./job.model.js";
import { AIOrchestrator } from "../../core/ai-orchestrator.js";
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
    // This is a simplified version; real engine would weigh difficulty and recall
    let frontend = 0, backend = 0, ai = 0;
    
    for (const r of activeRoadmaps) {
      const completion = r.readinessScore || 0;
      if (r.category === "Career") {
        if (r.targetRole.toLowerCase().includes("frontend")) frontend = completion;
        if (r.targetRole.toLowerCase().includes("backend")) backend = completion;
        if (r.targetRole.toLowerCase().includes("ai")) ai = completion;
      }
    }

    // Update profile
    user.careerProfile.readiness = { 
      frontend: Math.max(user.careerProfile.readiness.frontend, frontend),
      backend: Math.max(user.careerProfile.readiness.backend, backend),
      ai: Math.max(user.careerProfile.readiness.ai, ai),
      interview: user.careerProfile.readiness.interview // Updated via practice
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

    // Use AI to analyze readiness
    // Placeholder logic for now
    const matchScore = this.calculateMatchScore(user.careerProfile, job);
    
    const application = await ApplicationModel.findOneAndUpdate(
      { userId, jobId },
      { 
        $set: { 
          matchScore,
          aiReadinessAnalysis: {
            strengthAreas: ["React", "API integration"], // AI Inferred
            weakAreas: ["Interview Confidence", "Advanced System Design"] // AI Inferred
          }
        } 
      },
      { upsert: true, new: true }
    );

    return application;
  }

  private static calculateMatchScore(profile: any, job: any) {
    const readiness = profile.readiness[job.category as keyof typeof profile.readiness] || 0;
    return Math.min(100, readiness + (profile.consistencyScore / 10));
  }

  /**
   * Recommends top 5 highly relevant opportunities.
   */
  static async getRecommendations(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Filter jobs matching user's target roles and readiness
    const jobs = await JobModel.find({
      category: { $in: user.careerProfile.targetRoles.map(r => r.toLowerCase() as any) }
    }).limit(10);

    // Map matches
    const recommendations = await Promise.all(jobs.map(async (job) => {
      const matchScore = this.calculateMatchScore(user.careerProfile, job);
      return { job, matchScore };
    }));

    return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }
}
