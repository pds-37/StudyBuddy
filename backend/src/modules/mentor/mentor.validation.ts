import { z } from "zod";

export const mentorTaskParamSchema = z.object({
  taskId: z.string().min(1)
});

export const mentorTaskStatusSchema = z.object({
  status: z.enum(["completed", "skipped", "pending", "in_progress"]).default("completed")
});

export const mentorTaskFeedbackSchema = z.object({
  type: z.enum(["start", "stuck", "confidence"]),
  confidenceScore: z.number().int().min(1).max(5).optional(),
  note: z.string().trim().max(600).optional()
});

export const mentorStrategySchema = z.object({
  targetRole: z.string().trim().min(1).optional(),
  recoveryPlan: z.string().trim().min(10),
  nextSkills: z.array(z.string().trim().min(1)).default([]),
  gaps: z
    .array(
      z.object({
        skill: z.string().trim().min(1),
        gapScore: z.number().min(0).max(100).optional(),
        userScore: z.number().min(0).max(100).optional()
      })
    )
    .default([])
});
