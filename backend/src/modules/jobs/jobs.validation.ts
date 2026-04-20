import { z } from "zod";
import { jobSchema } from "@studybuddy/shared";

export const createJobSchema = jobSchema;

export const jobsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20)
});
