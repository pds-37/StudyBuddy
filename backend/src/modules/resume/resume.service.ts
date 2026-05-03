import { groqService } from "../../services/ai/groq.service.js";
import { ApiError } from "../../utils/api-error.js";
import { UserModel } from "../users/user.model.js";
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

/** Tailors a resume to a target job role using the configured AI provider. */
async function tailorResume(userId: string, request: ResumeTailorRequest): Promise<ResumeTailorResult> {
  const userContext = await buildResumeContext(userId);
  return groqService.generateResumeTailoring(request, userContext);
}

export const resumeService = {
  tailorResume
};
