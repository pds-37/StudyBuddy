import { RoadmapModel, type RoadmapDocument } from "./roadmap.model.js";
import { UserModel } from "../users/user.model.js";
import { skillsService } from "../skills/skills.service.js";
import { notesService } from "../notes/notes.service.js";
import { AIOrchestrator } from "../../core/ai-orchestrator.js";
import { ApiError } from "../../utils/api-error.js";
import type { Roadmap, RoadmapMilestone } from "@studybuddy/shared";

type GenerateRoadmapRequest = {
  targetRole: string;
  timelineWeeks: number;
  skillGaps: Array<{ skill: string; gapScore: number }>;
};

/** Converts a roadmap document to the public API shape. */
function toRoadmap(roadmap: RoadmapDocument): Roadmap {
  return {
    id: String(roadmap._id),
    userId: roadmap.userId,
    title: roadmap.title,
    targetRole: roadmap.targetRole,
    timelineWeeks: roadmap.timelineWeeks,
    rationale: roadmap.rationale ?? undefined,
    milestones: roadmap.milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      skillTags: milestone.skillTags,
      status: milestone.status as RoadmapMilestone["status"],
      rationale: milestone.rationale ?? undefined,
      order: milestone.order,
      targetDate: milestone.targetDate ?? undefined
    }))
  };
}

/** Generates a personalized roadmap using AI and user data. */
async function generateRoadmap(userId: string, request: GenerateRoadmapRequest): Promise<Roadmap> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get user's notes for context
  let userNotes = "";
  try {
    const notesResult = await notesService.listNotes(userId, { limit: 20, offset: 0 });
    userNotes = notesResult.notes
      .slice(0, 5) // Limit to most recent 5 notes
      .map(note => `${note.title}: ${note.content}`)
      .join("\n\n");
  } catch (error) {
    console.warn("Could not fetch user notes for roadmap generation:", error);
  }

  // Generate roadmap using AI
  const aiRoadmap = await AIOrchestrator.generateRoadmap(
    request.targetRole,
    request.timelineWeeks,
    request.skillGaps,
    userNotes,
    user.behaviorProfile
  );

  // Create roadmap document
  const roadmap = await RoadmapModel.create({
    userId,
    title: aiRoadmap.title,
    targetRole: request.targetRole,
    timelineWeeks: request.timelineWeeks,
    rationale: aiRoadmap.rationale,
    milestones: aiRoadmap.milestones.map((milestone, index) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      skillTags: milestone.skillTags,
      rationale: milestone.rationale,
      status: "not_started" as const,
      order: milestone.order,
      targetDate: calculateTargetDate(request.timelineWeeks, milestone.order, aiRoadmap.milestones.length)
    }))
  });

  return toRoadmap(roadmap);
}

/** Calculates target date for a milestone based on order and total timeline. */
function calculateTargetDate(totalWeeks: number, order: number, totalMilestones: number): string {
  const weeksPerMilestone = Math.ceil(totalWeeks / totalMilestones);
  const milestoneWeek = (order - 1) * weeksPerMilestone + Math.ceil(weeksPerMilestone / 2);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (milestoneWeek * 7));
  return targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
}

/** Retrieves the user's current roadmap. */
async function getRoadmap(userId: string): Promise<Roadmap | null> {
  const roadmap = await RoadmapModel.findOne({ userId }).sort({ createdAt: -1 });
  return roadmap ? toRoadmap(roadmap) : null;
}

/** Retrieves all saved roadmaps for a user, newest first. */
async function getUserRoadmaps(userId: string): Promise<Roadmap[]> {
  const roadmaps = await RoadmapModel.find({ userId }).sort({ createdAt: -1 });
  return roadmaps.map(toRoadmap);
}

/** Updates milestone status. */
async function updateMilestoneStatus(
  userId: string,
  milestoneId: string,
  status: RoadmapMilestone["status"]
): Promise<Roadmap> {
  const roadmap = await RoadmapModel.findOneAndUpdate(
    { userId, "milestones.id": milestoneId },
    { $set: { "milestones.$.status": status } },
    { new: true }
  );

  if (!roadmap) {
    throw new ApiError(404, "Roadmap or milestone not found");
  }

  if (status === "completed") {
    const { notificationService } = await import("../notifications/notification.service.js");
    await notificationService.createNotification(
      userId,
      "Milestone Completed! 🎉",
      "Great job completing a milestone! Your adaptive pathway has been updated.",
      "success",
      "/roadmap"
    );
  }

  return toRoadmap(roadmap);
}

/** Generates a roadmap based on user's current skill gaps. */
async function generateFromSkillGaps(userId: string, timelineWeeks: number = 12): Promise<Roadmap> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.targetRoles.length === 0 || user.currentSkills.length === 0) {
    throw new ApiError(400, "Complete onboarding with target role and current skills first");
  }

  // Get skill gaps
  const skillGapAnalysis = await skillsService.analyzeSkillGap(userId);
  const skillGapsFormatted = skillGapAnalysis.gaps.map((item) => ({
    skill: item.skill,
    gapScore: item.gapScore
  }));

  return generateRoadmap(userId, {
    targetRole: user.targetRoles[0],
    timelineWeeks,
    skillGaps: skillGapsFormatted
  });
}

/** Generates a quiz for a specific milestone. */
async function generateQuizForMilestone(userId: string, milestoneId: string) {
  const roadmap = await RoadmapModel.findOne({ userId, "milestones.id": milestoneId });
  if (!roadmap) {
    throw new ApiError(404, "Roadmap or milestone not found");
  }

  const milestone = roadmap.milestones.find(m => m.id === milestoneId);
  if (!milestone) {
    throw new ApiError(404, "Milestone not found");
  }

  const topic = milestone.title;
  const targetRole = roadmap.targetRole;

  return AIOrchestrator.generateQuiz(topic, targetRole);
}

export const roadmapsService = {
  generateRoadmap,
  generateFromSkillGaps,
  getRoadmap,
  getUserRoadmaps,
  updateMilestoneStatus,
  generateQuizForMilestone
};
