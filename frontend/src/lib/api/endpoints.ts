/** Centralizes frontend API route names before feature modules are wired. */
export const endpoints = {
  health: "/health",
  auth: "/auth",
  users: "/users",
  notes: "/notes",
  roadmaps: "/roadmaps",
  jobs: "/jobs",
  skills: "/skills",
  copilot: "/copilot"
} as const;
