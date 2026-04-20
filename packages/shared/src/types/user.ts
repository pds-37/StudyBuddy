export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type UserProfile = {
  id: string;
  userId: string;
  name: string;
  targetRole: string;
  currentSkills: string[];
  experienceLevel: ExperienceLevel;
};
