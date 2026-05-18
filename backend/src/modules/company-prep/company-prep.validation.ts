import { z } from "zod";

export const companyPrepRoleSchema = z.enum([
  "Software Engineer",
  "Frontend",
  "Backend",
  "Full Stack",
  "AI",
  "DevOps",
  "Data"
]);

export const companyPrepDifficultySchema = z.enum(["easy", "medium", "hard"]);

export const companyPrepStatusSchema = z.enum(["attempted", "solved", "bookmarked"]);

export const companyTypeParamSchema = z.object({
  companyTypeId: z.string().min(1)
});

export const questionParamSchema = z.object({
  questionId: z.string().min(1)
});

export const companyPrepQuerySchema = z.object({
  role: companyPrepRoleSchema.optional()
});

export const questionQuerySchema = z.object({
  companyTypeId: z.string().optional(),
  role: companyPrepRoleSchema.optional(),
  topic: z.string().optional(),
  difficulty: companyPrepDifficultySchema.optional(),
  status: z.enum(["attempted", "solved", "bookmarked", "unseen", "all"]).optional(),
  sort: z.enum(["frequency", "difficulty", "title"]).default("frequency")
});

export const updateQuestionStatusSchema = z.object({
  status: companyPrepStatusSchema
});

export const startPrepSchema = z.object({
  role: companyPrepRoleSchema.default("Software Engineer"),
  targetDate: z.string().datetime().optional()
});
