import { z } from "zod";

export const resumeTailorRequestSchema = z.object({
  targetRole: z.string().min(2),
  jobDescription: z.string().optional(),
  currentResume: z.string().min(50),
  tone: z.enum(["concise", "impact", "technical"]).optional(),
  mode: z.enum(["startup", "faang", "internship", "technical", "minimal", "ats_optimized"]).optional()
});
