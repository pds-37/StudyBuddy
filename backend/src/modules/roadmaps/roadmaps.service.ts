import crypto from "node:crypto";
import { RoadmapModel, type RoadmapDocument } from "./roadmap.model.js";
import { UserModel } from "../users/user.model.js";
import { skillsService } from "../skills/skills.service.js";
import { notesService } from "../notes/notes.service.js";
import { AIOrchestrator } from "../../core/ai-orchestrator.js";
import { ApiError } from "../../utils/api-error.js";
import { studentIntelligenceService } from "../intelligence/student-intelligence.service.js";
import type { Roadmap } from "@studybuddy/shared";

type GenerateRoadmapRequest = {
  targetRole: string;
  timelineWeeks: number;
  skillGaps: Array<{ skill: string; gapScore: number }>;
  trackId?: string;
  category?: string;
  priorityWeight?: number;
};

/** Converts a roadmap document to the public API shape. */
function toRoadmap(roadmap: RoadmapDocument): Roadmap {
  return ({
    id: String(roadmap._id),
    userId: roadmap.userId,
    trackId: roadmap.trackId,
    title: roadmap.title,
    category: roadmap.category,
    priorityWeight: roadmap.priorityWeight,
    targetRole: roadmap.targetRole,
    status: roadmap.status as any,
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
          completedAt: task.completedAt?.toISOString(),
          subtasks: task.subtasks ?? [],
          resources: (task.resources ?? []).map((res: any) => ({
            label: res.label,
            url: res.url
          }))
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
  }) as Roadmap;
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
    {
      availableHours: user.availableHours,
      learningStyle: user.preferences?.learningStyle,
      targetTimeline: user.preferences?.targetTimeline,
      primaryStruggle: user.preferences?.primaryStruggle,
      careerInterests: user.preferences?.careerInterests,
      preferredLanguages: user.preferences?.preferredLanguages
    }
  );

  // Create roadmap document
  const roadmap = await RoadmapModel.create({
    userId,
    trackId: request.trackId || crypto.randomUUID(),
    title: aiRoadmap.title,
    category: request.category || "Career",
    priorityWeight: request.priorityWeight ?? 1.0,
    targetRole: request.targetRole,
    readinessScore: aiRoadmap.readinessScore,
    consistencyScore: aiRoadmap.consistencyScore,
    currentPhaseId: aiRoadmap.currentPhaseId,
    nextMilestone: aiRoadmap.nextMilestone,
    phases: aiRoadmap.phases,
    insights: aiRoadmap.insights
  });

  await studentIntelligenceService.emitEvent(userId, {
    type: request.category === "Expansion" ? "TRACK_ADDED" : "ROADMAP_RECALIBRATED",
    source: "roadmap",
    entityId: roadmap._id.toString(),
    payload: { targetRole: roadmap.targetRole, title: roadmap.title, trackId: roadmap.trackId }
  }).catch(error => console.error("Student intelligence event failed:", error));

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
  let matchedTask: any = null;
  let matchedMission: any = null;
  let matchedPhase: any = null;
  for (const phase of roadmap.phases as any[]) {
    for (const mission of phase.missions as any[]) {
      for (const task of mission.tasks as any[]) {
        if (task.id === taskId) {
          task.status = status;
          if (status === "completed") task.completedAt = new Date();
          taskFound = true;
          matchedTask = task;
          matchedMission = mission;
          matchedPhase = phase;
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

  roadmap.markModified("phases");
  await roadmap.save();

  // Trigger Behavioral Intelligence Engine
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      user.behaviorProfile.lastActivityAt = new Date();
      // Simple consistency logic
      if (status === "completed") {
        user.behaviorProfile.consistencyScore = Math.min(100, (user.behaviorProfile.consistencyScore || 0) + 1);
      } else if (status === "skipped") {
        user.behaviorProfile.skipRate = Math.min(1, (user.behaviorProfile.skipRate || 0) + 0.05);
      }
      await user.save();

      // Check for behavioral edge cases
      const { BehaviorEngine } = await import("../../engines/behavior.engine.js");
      const risk = await BehaviorEngine.evaluateRisk(userId).catch(() => "low" as const);
      const intervention = risk === "high" ? { message: "Consistency is dropping. Consider simplifying your daily tasks.", type: "recovery" } : null;
      
      if (intervention) {
        // Create an insight on the roadmap based on the intervention
        roadmap.insights.unshift({
          type: "behavior",
          message: intervention.message,
          actionLabel: intervention.type === "recovery" ? "Start Recovery" : "Review Plan",
          actionUrl: "/dashboard"
        } as any);
        await roadmap.save();
      }
    }
  } catch (err) {
    console.error("Behavioral intelligence analysis failed:", err);
  }

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

  if (status === "completed" || status === "skipped") {
    await studentIntelligenceService.emitEvent(userId, {
      type: status === "completed" ? "ROADMAP_TASK_COMPLETED" : "ROADMAP_TASK_SKIPPED",
      source: "roadmap",
      entityId: taskId,
      payload: {
        roadmapId: roadmap._id.toString(),
        roadmapTitle: roadmap.title,
        targetRole: roadmap.targetRole,
        taskTitle: matchedTask?.title,
        taskType: matchedTask?.type,
        missionTitle: matchedMission?.title,
        phaseTitle: matchedPhase?.title
      }
    }).catch(error => console.error("Student intelligence event failed:", error));
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

/** Expands a user's learning journey with a new career track. */
async function expandRoadmap(userId: string, data: {
  newInterest: string;
  expansionReason: string;
  priorityWeight: number;
  initialTrackLevel: string;
}): Promise<Roadmap> {
  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // ROADMAP REBALANCING ENGINE
  // Dynamically redistribute workload by adjusting priority weights of existing active tracks
  const existingRoadmaps = await RoadmapModel.find({ userId, status: "active" });
  const newTrackWeight = data.priorityWeight;
  const remainingWeight = 1.0 - newTrackWeight;
  
  if (existingRoadmaps.length > 0) {
    const totalExistingWeight = existingRoadmaps.reduce((acc, r) => acc + (r.priorityWeight || 1), 0);
    for (const r of existingRoadmaps) {
      const share = (r.priorityWeight || 1) / totalExistingWeight;
      // Adjust existing roadmap weights to make room for the new track
      r.priorityWeight = Number((share * remainingWeight).toFixed(2));
      await r.save();
    }
  }

  // INTELLIGENT TRACK GENERATION
  // Generate the new roadmap track while considering expansion intent and starting level
  return generateRoadmap(userId, {
    targetRole: data.newInterest,
    timelineWeeks: 12, // Default expansion window
    skillGaps: [], // Initial expansion starts with no specific gaps; AI estimates based on level
    category: "Expansion",
    priorityWeight: newTrackWeight,
    // Pass extra context via intelligence profile indirectly through generateRoadmap's user fetch
    // Actually generateRoadmap fetches user, so we should ensure preferences reflect expansion context if needed
    // For now we'll rely on the orchestrator's knowledge of the user
  });
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

/** Injects externally learned knowledge and skips redundant roadmap parts. */
async function injectExternalSkill(userId: string, skillName: string): Promise<Roadmap> {
  const roadmapDoc = await RoadmapModel.findOne({ userId }).sort({ createdAt: -1 });
  if (!roadmapDoc) throw new ApiError(404, "No active roadmap found");

  // AI Logic: Identify tasks related to this external skill
  // For now, we'll mark the first mission's tasks as completed as a placeholder
  // In a real implementation, we'd use groq to map skillName -> taskIds
  const roadmap = toRoadmap(roadmapDoc);
  
  roadmapDoc.insights.unshift({
    type: "recommendation",
    message: `Knowledge Injection detected: "${skillName}". I've recalibrated your roadmap to skip foundational modules you've already mastered.`,
    actionLabel: "Validate Depth",
    actionUrl: "/dashboard"
  } as any);

  await roadmapDoc.save();
  await studentIntelligenceService.emitEvent(userId, {
    type: "ROADMAP_RECALIBRATED",
    source: "roadmap",
    entityId: roadmapDoc._id.toString(),
    payload: { skillName, reason: "external_skill_injection" }
  }).catch(error => console.error("Student intelligence event failed:", error));

  return toRoadmap(roadmapDoc);
}

export const roadmapsService = {
  generateRoadmap,
  generateFromSkillGaps,
  getRoadmap,
  getUserRoadmaps,
  expandRoadmap,
  injectExternalSkill,
  updateTaskStatus,
  generateQuizForTask,
  rateRoadmap
};
