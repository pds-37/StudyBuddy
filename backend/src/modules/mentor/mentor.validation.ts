import { z } from "zod";

export const mentorTaskParamSchema = z.object({
  taskId: z.string().min(1)
});

export const mentorTaskStatusSchema = z.object({
  status: z.enum(["completed", "skipped", "pending", "in_progress"]).default("completed")
});
