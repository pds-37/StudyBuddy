import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  targetRoles: z.array(z.string().trim().min(1)).min(1, "Add at least one target role or career goal."),
  currentSkills: z.array(z.string().trim().min(1)).min(1, "Add at least one current skill."),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  // Intelligence OS fields
  dailyStudyHours: z.number().min(1).max(24).optional(),
  targetTimeline: z.string().optional(),
  learningStyle: z.string().optional(),
  primaryStruggle: z.string().optional(),
  careerInterests: z.array(z.string()).optional()
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
