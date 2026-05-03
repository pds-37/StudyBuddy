import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  topic: z.string().min(1).optional(),
  tags: z.array(z.string()).default([]),
  linkedSkills: z.array(z.string()).default([]),
  sourceUrl: z.string().url().optional(),
  strength: z.number().min(0).max(1).optional(),
  nextReviewAt: z.string().datetime().optional()
});
