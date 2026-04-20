import { z } from "zod";

export const skillSearchQuerySchema = z.object({
  q: z.string().trim().optional().default(""),
  limit: z.coerce.number().int().min(1).max(25).optional().default(10)
});
