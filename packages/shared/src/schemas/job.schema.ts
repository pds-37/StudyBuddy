import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  requiredSkills: z.array(z.string()).default([]),
  applyUrl: z.string().url().optional(),
  source: z.string().min(1).optional(),
  sources: z.array(z.string()).optional(),
  provider: z.string().min(1).optional(),
  postedAt: z.string().optional(),
  employmentType: z.string().optional(),
  isRemote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().optional(),
  description: z.string().optional()
});
