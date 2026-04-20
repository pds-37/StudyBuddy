export type DefaultSkill = {
  name: string;
  category: string;
  aliases: string[];
  relatedRoles: string[];
};

export const DEFAULT_ONET_SKILLS: DefaultSkill[] = [
  { name: "JavaScript", category: "Programming", aliases: ["JS", "ECMAScript"], relatedRoles: ["Frontend Developer", "Full Stack Developer"] },
  { name: "TypeScript", category: "Programming", aliases: ["TS"], relatedRoles: ["Frontend Developer", "Full Stack Developer"] },
  { name: "React", category: "Frontend", aliases: ["React.js", "ReactJS"], relatedRoles: ["Frontend Developer", "Full Stack Developer"] },
  { name: "Node.js", category: "Backend", aliases: ["Node", "Express"], relatedRoles: ["Backend Developer", "Full Stack Developer"] },
  { name: "MongoDB", category: "Database", aliases: ["NoSQL", "Mongo"], relatedRoles: ["Backend Developer", "Full Stack Developer"] },
  { name: "SQL", category: "Database", aliases: ["Relational Databases"], relatedRoles: ["Data Analyst", "Backend Developer"] },
  { name: "Python", category: "Programming", aliases: ["Py"], relatedRoles: ["Data Scientist", "Machine Learning Engineer"] },
  { name: "Data Structures", category: "Computer Science", aliases: ["DSA", "Data Structures and Algorithms"], relatedRoles: ["Software Engineer"] },
  { name: "Algorithms", category: "Computer Science", aliases: ["Algorithm Design"], relatedRoles: ["Software Engineer"] },
  { name: "Git", category: "Developer Tools", aliases: ["Version Control"], relatedRoles: ["Software Engineer"] },
  { name: "REST APIs", category: "Backend", aliases: ["REST", "API Design"], relatedRoles: ["Backend Developer", "Full Stack Developer"] },
  { name: "Docker", category: "DevOps", aliases: ["Containers"], relatedRoles: ["DevOps Engineer", "Backend Developer"] },
  { name: "Kubernetes", category: "DevOps", aliases: ["K8s"], relatedRoles: ["DevOps Engineer", "Cloud Engineer"] },
  { name: "AWS", category: "Cloud", aliases: ["Amazon Web Services"], relatedRoles: ["Cloud Engineer", "DevOps Engineer"] },
  { name: "Machine Learning", category: "AI", aliases: ["ML"], relatedRoles: ["Machine Learning Engineer", "Data Scientist"] },
  { name: "Prompt Engineering", category: "AI", aliases: ["LLM Prompting"], relatedRoles: ["AI Engineer"] },
  { name: "System Design", category: "Architecture", aliases: ["Software Architecture"], relatedRoles: ["Software Engineer", "Backend Developer"] },
  { name: "Communication", category: "Professional", aliases: ["Written Communication", "Verbal Communication"], relatedRoles: ["All Roles"] },
  { name: "Problem Solving", category: "Professional", aliases: ["Analytical Thinking"], relatedRoles: ["All Roles"] },
  { name: "Resume Writing", category: "Career", aliases: ["CV Writing"], relatedRoles: ["All Roles"] },
  { name: "HTML", category: "Frontend", aliases: ["HyperText Markup Language"], relatedRoles: ["Frontend Developer", "Full Stack Developer"] },
  { name: "CSS", category: "Frontend", aliases: ["Cascading Style Sheets"], relatedRoles: ["Frontend Developer", "Full Stack Developer"] },
  { name: "Data Visualization", category: "Data", aliases: ["Charts", "Dashboards"], relatedRoles: ["Data Analyst"] },
  { name: "Statistics", category: "Data", aliases: ["Statistical Analysis"], relatedRoles: ["Data Analyst", "Machine Learning Engineer"] },
  { name: "Excel", category: "Data", aliases: ["Spreadsheets"], relatedRoles: ["Data Analyst"] },
  { name: "Linux", category: "Operating Systems", aliases: ["Unix"], relatedRoles: ["DevOps Engineer", "Cloud Engineer", "Cybersecurity Analyst"] },
  { name: "Networking", category: "Infrastructure", aliases: ["Computer Networks"], relatedRoles: ["Cloud Engineer", "Cybersecurity Analyst"] },
  { name: "Security Monitoring", category: "Cybersecurity", aliases: ["SOC Monitoring", "SIEM"], relatedRoles: ["Cybersecurity Analyst"] },
  { name: "Incident Response", category: "Cybersecurity", aliases: ["IR"], relatedRoles: ["Cybersecurity Analyst"] }
];
