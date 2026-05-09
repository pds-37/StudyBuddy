import { AIOrchestrator } from "../../core/ai-orchestrator.js";
import { ApiError } from "../../utils/api-error.js";
import { UserModel } from "../users/user.model.js";
import { ResumeModel } from "./resume.model.js";
import type { ResumeTailorRequest, ResumeTailorResult } from "@studybuddy/shared";

/** Builds compact user context for truthful resume tailoring. */
async function buildResumeContext(userId: string) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return [
    `Name: ${user.name}`,
    `Current target role: ${user.targetRoles.length > 0 ? user.targetRoles.join(", ") : "Not provided"}`,
    `Experience level: ${user.experienceLevel}`,
    `Current skills: ${user.currentSkills.length > 0 ? user.currentSkills.join(", ") : "Not provided"}`,
    `Profile notes: ${JSON.stringify(user.profile ?? {})}`
  ].join("\n");
}

/** Tailors a resume to a target job role using the configured AI provider and saves a version. */
async function tailorResume(userId: string, request: ResumeTailorRequest): Promise<any> {
  const userContext = await buildResumeContext(userId);
  const result = await AIOrchestrator.tailorResume(request, userContext);

  // Save as a new version
  const resumeVersion = new ResumeModel({
    userId,
    roleName: request.targetRole,
    versionName: `${request.targetRole} (${request.mode || "Standard"})`,
    targetRole: request.targetRole,
    jobDescription: request.jobDescription,
    originalResume: request.currentResume,
    result
  });

  await resumeVersion.save();

  return {
    versionId: resumeVersion._id,
    result
  };
}

/** Gets all resume versions for a user. */
async function getVersions(userId: string) {
  return ResumeModel.find({ userId }).sort({ createdAt: -1 });
}

/** Gets a specific resume version. */
async function getVersion(userId: string, versionId: string) {
  const version = await ResumeModel.findOne({ _id: versionId, userId });
  if (!version) throw new ApiError(404, "Version not found.");
  return version;
}

/** Deletes a resume version. */
async function deleteVersion(userId: string, versionId: string): Promise<any> {
  return ResumeModel.deleteOne({ _id: versionId, userId });
}

export const resumeService = {
  tailorResume,
  getVersions,
  getVersion,
  deleteVersion
};
