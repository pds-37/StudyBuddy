import { RoadmapModel, type RoadmapDocument } from "./roadmap.model.js";
import { UserModel } from "../users/user.model.js";
import { skillsService } from "../skills/skills.service.js";
import { notesService } from "../notes/notes.service.js";
import { AIOrchestrator } from "../../core/ai-orchestrator.js";
import { ApiError } from "../../utils/api-error.js";
import type { Roadmap } from "@studybuddy/shared";

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
    readinessScore: roadmap.readinessScore,
    consistencyScore: roadmap.consistencyScore,
    currentPhaseId: roadmap.currentPhaseId ?? undefined,
    nextMilestone: roadmap.nextMilestone ?? undefined,
    phases: (roadmap.phases as any[]).map(phase => ({
      id: phase.id,
      title: phase.title,
      description: phase.description,
      status: phase.status,
      estimatedWeeks: phase.estimatedWeeks,
      difficulty: phase.difficulty,
      checkpoints: phase.checkpoints,
      missions: (phase.missions as any[]).map(mission => ({
        id: mission.id,
        weekNumber: mission.weekNumber,
        title: mission.title,
        description: mission.description,
        whyItMatters: mission.whyItMatters,
        outcome: mission.outcome,
        commonMistakes: mission.commonMistakes,
        status: mission.status,
        tasks: (mission.tasks as any[]).map(task => ({
          id: task.id,
          title: task.title,
          type: task.type,
          durationMinutes: task.durationMinutes,
          difficulty: task.difficulty,
          status: task.status,
          aiHint: task.aiHint,
          completedAt: task.completedAt?.toISOString()
        }))
      }))
    })),
    insights: (roadmap.insights as any[]).map(insight => ({
      type: insight.type,
      message: insight.message,
      actionLabel: insight.actionLabel,
      actionUrl: insight.actionUrl
    })),
    updatedAt: (roadmap as any).updatedAt.toISOString()
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
    const notesResult = await notesService.listNotes(userId, { limit: 10, offset: 0 });
    userNotes = notesResult.notes
      .map(note => `${note.title}: ${note.content}`)
      .join("\n\n");
  } catch (error) {
    console.warn("Could not fetch user notes for roadmap generation:", error);
  }

  // Generate adaptive mission using AI
  const aiRoadmap = await AIOrchestrator.generateRoadmap(
    request.targetRole,
    request.timelineWeeks,
    request.skillGaps,
    userNotes,
    user.behaviorProfile,
    user.preferences?.learningStyle
  );

  // Create roadmap document
  const roadmap = await RoadmapModel.create({
    userId,
    title: aiRoadmap.title,
    targetRole: request.targetRole,
    readinessScore: aiRoadmap.readinessScore,
    consistencyScore: aiRoadmap.consistencyScore,
    currentPhaseId: aiRoadmap.currentPhaseId,
    nextMilestone: aiRoadmap.nextMilestone,
    phases: aiRoadmap.phases,
    insights: aiRoadmap.insights
  });

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
  const skillGapsFormatted = skillGapAnalysis.gaps.map((item: any) => ({
    skill: item.skill,
    gapScore: item.gapScore
  }));

  return generateRoadmap(userId, {
    targetRole: user.targetRoles[0],
    timelineWeeks,
    skillGaps: skillGapsFormatted
  });
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

/** Updates task status within the roadmap hierarchy. */
async function updateTaskStatus(
  userId: string,
  taskId: string,
  status: "pending" | "completed" | "skipped"
): Promise<Roadmap> {
  const roadmap = await RoadmapModel.findOne({ userId });
  if (!roadmap) {
    throw new ApiError(404, "Roadmap not found");
  }

  let taskFound = false;
  for (const phase of roadmap.phases as any[]) {
    for (const mission of phase.missions as any[]) {
      for (const task of mission.tasks as any[]) {
        if (task.id === taskId) {
          task.status = status;
          if (status === "completed") task.completedAt = new Date();
          taskFound = true;
          break;
        }
      }
      if (taskFound) break;
    }
    if (taskFound) break;
  }

  if (!taskFound) {
    throw new ApiError(404, "Task not found in roadmap");
  }

  await roadmap.save();

  if (status === "completed") {
    const { notificationService } = await import("../notifications/notification.service.js");
    await notificationService.createNotification(
      userId,
      "Mission Progress! 🚀",
      "You've completed a daily task. Keep the momentum going!",
      "success",
      "/roadmap"
    );
  }

  return toRoadmap(roadmap);
}

/** Generates a quiz for a specific task. */
async function generateQuizForTask(userId: string, taskId: string) {
  const roadmap = await RoadmapModel.findOne({ userId });
  if (!roadmap) {
    throw new ApiError(404, "Roadmap not found");
  }

  let taskTitle = "";
  for (const phase of roadmap.phases as any[]) {
    for (const mission of phase.missions as any[]) {
      const task = (mission.tasks as any[]).find(t => t.id === taskId);
      if (task) {
        taskTitle = task.title;
        break;
      }
    }
    if (taskTitle) break;
  }

  if (!taskTitle) {
    throw new ApiError(404, "Task not found");
  }

  return AIOrchestrator.generateQuiz(taskTitle, roadmap.targetRole);
}

/** Submits a rating and feedback for a roadmap. */
async function rateRoadmap(userId: string, roadmapId: string, rating: number, feedback?: string) {
  const roadmap = await RoadmapModel.findOneAndUpdate(
    { _id: roadmapId, userId },
    { $set: { rating, feedback } },
    { new: true }
  );

  if (!roadmap) {
    throw new ApiError(404, "Roadmap not found.");
  }

  return toRoadmap(roadmap);
}

export const roadmapsService = {
  generateRoadmap,
  generateFromSkillGaps,
  getRoadmap,
  getUserRoadmaps,
  updateTaskStatus,
  generateQuizForTask,
  rateRoadmap
};

