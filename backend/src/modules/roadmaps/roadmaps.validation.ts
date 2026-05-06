import { z } from "zod";
import { roadmapRequestSchema } from "@studybuddy/shared";

export const generateRoadmapSchema = roadmapRequestSchema;

export const updateMilestoneSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed"])
});

export const milestoneIdParamSchema = z.object({
  milestoneId: z.string().min(1)
});

export const generateFromGapsSchema = z.object({
  timelineWeeks: z.coerce.number().int().min(1).max(104).default(12)
});

export const roadmapIdParamSchema = z.object({
  roadmapId: z.string().min(1)
});

export const rateRoadmapSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().optional()
});
