export type CapstoneProject = {
  id: string;
  title: string;
  company: string;
  industry: string;
  description: string;
  requiredSkills: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
};

export type ProjectMatch = {
  id: string;
  userId: string;
  projectId: string;
  project: CapstoneProject;
  matchScore: number;
  matchReasons: string[];
  status: "recommended" | "in_progress" | "completed";
  createdAt: string;
};
