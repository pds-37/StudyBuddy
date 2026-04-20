import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  targetRole: z.string().trim().min(2, "Target role is required."),
  currentSkills: z.array(z.string().trim().min(1)).min(1, "Add at least one current skill."),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"])
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
