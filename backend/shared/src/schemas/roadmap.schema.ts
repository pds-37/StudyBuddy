import { z } from "zod";

export const roadmapRequestSchema = z.object({
  targetRole: z.string().min(2),
  timelineWeeks: z.number().int().min(1).max(104),
  skillGaps: z.array(
    z.object({
      skill: z.string().min(1),
      gapScore: z.number().min(0).max(100)
    })
  )
});
