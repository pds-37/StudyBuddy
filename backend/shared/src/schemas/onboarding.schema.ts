import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2),
  targetRole: z.string().min(2),
  currentSkills: z.array(z.string().min(1)),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"])
});
