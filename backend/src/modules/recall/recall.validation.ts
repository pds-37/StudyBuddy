import { z } from "zod";

export const recallQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(25).default(10),
  noteId: z.string().min(1).optional()
});

export const recallReviewSchema = z.object({
  noteId: z.string().min(1),
  answer: z.string().min(1),
  grade: z.enum(["good", "weak", "wrong"]).optional()
});
