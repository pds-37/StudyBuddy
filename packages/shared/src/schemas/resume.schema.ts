import { z } from "zod";

export const resumeTailorRequestSchema = z.object({
  targetRole: z.string().trim().min(2).max(120),
  jobDescription: z.string().trim().max(6000).optional().default(""),
  currentResume: z.string().trim().min(80).max(12000),
  tone: z.enum(["concise", "impact", "technical"]).default("impact")
});

