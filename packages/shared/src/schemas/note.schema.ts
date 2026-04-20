import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  linkedSkills: z.array(z.string()).default([]),
  sourceUrl: z.string().url().optional()
});
