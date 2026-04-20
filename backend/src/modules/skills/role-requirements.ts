export type RoleRequirement = {
  role: string;
  skills: string[];
};

export const ROLE_REQUIREMENTS: RoleRequirement[] = [
  {
    role: "Frontend Developer",
    skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "REST APIs", "Git", "Communication"]
  },
  {
    role: "Backend Developer",
    skills: ["Node.js", "REST APIs", "MongoDB", "SQL", "System Design", "Git", "Docker", "Problem Solving"]
  },
  {
    role: "Full Stack Developer",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "REST APIs", "MongoDB", "Git", "System Design"]
  },
  {
    role: "Data Analyst",
    skills: ["SQL", "Python", "Data Visualization", "Statistics", "Problem Solving", "Communication", "Excel"]
  },
  {
    role: "AI Engineer",
    skills: ["Python", "Machine Learning", "Prompt Engineering", "Data Structures", "REST APIs", "Problem Solving", "Git"]
  },
  {
    role: "Machine Learning Engineer",
    skills: ["Python", "Machine Learning", "Algorithms", "SQL", "Docker", "System Design", "Problem Solving"]
  },
  {
    role: "DevOps Engineer",
    skills: ["Linux", "Docker", "Kubernetes", "AWS", "Git", "System Design", "Problem Solving"]
  },
  {
    role: "Cloud Engineer",
    skills: ["AWS", "Docker", "Kubernetes", "Linux", "Networking", "System Design", "Communication"]
  },
  {
    role: "Software Engineer",
    skills: ["Data Structures", "Algorithms", "JavaScript", "Python", "Git", "System Design", "Problem Solving"]
  },
  {
    role: "Cybersecurity Analyst",
    skills: ["Linux", "Networking", "Security Monitoring", "Incident Response", "Python", "Communication", "Problem Solving"]
  }
];
