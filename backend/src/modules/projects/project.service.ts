import { ProjectModel, type ProjectDocument } from "./project.model.js";
import { UserModel } from "../users/user.model.js";
import { groqService } from "../../services/ai/groq.service.js";
import { ApiError } from "../../utils/api-error.js";
import type { ProjectMatch, CapstoneProject } from "@studybuddy/shared";

// Mock database of capstone projects
const MOCK_PROJECTS: CapstoneProject[] = [
  { 
    id: "p1", 
    title: "Build a scalable e-commerce API", 
    company: "Stripe", 
    industry: "FinTech", 
    description: "Design and implement a scalable microservices architecture for an e-commerce platform.", 
    requiredSkills: ["Node.js", "System Design", "PostgreSQL"], 
    difficulty: "advanced", 
    estimatedHours: 40,
    implementationPlan: [
      "Define API contract using OpenAPI/Swagger.",
      "Set up PostgreSQL with Prisma for data modeling.",
      "Implement core services: Auth, Catalog, and Orders.",
      "Integrate Redis for caching frequent product queries.",
      "Add Docker support for containerized deployment."
    ]
  },
  { 
    id: "p2", 
    title: "Design a real-time collaborative editor", 
    company: "Figma", 
    industry: "SaaS", 
    description: "Create a React-based collaborative text editor using WebSockets and CRDTs.", 
    requiredSkills: ["React", "TypeScript", "WebSockets"], 
    difficulty: "intermediate", 
    estimatedHours: 30,
    implementationPlan: [
      "Initialize React app with TypeScript and TipTap/Lexical.",
      "Set up WebSocket server using Socket.io.",
      "Implement Yjs (CRDT) for conflict-free merging.",
      "Add user presence indicators (avatars/cursors).",
      "Sync document state to local storage for offline support."
    ]
  },
  { 
    id: "p3", 
    title: "Develop a churn prediction model", 
    company: "Netflix", 
    industry: "Entertainment", 
    description: "Use machine learning to predict user churn based on viewing history.", 
    requiredSkills: ["Python", "Machine Learning", "Pandas"], 
    difficulty: "intermediate", 
    estimatedHours: 35,
    implementationPlan: [
      "Preprocess the viewing history dataset using Pandas.",
      "Perform exploratory data analysis (EDA) for trends.",
      "Train a Random Forest or XGBoost classification model.",
      "Evaluate using Precision-Recall curves and F1-score.",
      "Create a simple Flask/FastAPI endpoint for predictions."
    ]
  },
  { 
    id: "p4", 
    title: "Create a responsive portfolio website", 
    company: "Open Source", 
    industry: "Technology", 
    description: "Build a fully responsive and accessible personal portfolio website.", 
    requiredSkills: ["HTML", "CSS", "JavaScript"], 
    difficulty: "beginner", 
    estimatedHours: 15,
    implementationPlan: [
      "Wireframe the layout for Mobile and Desktop.",
      "Write semantic HTML structure with ARIA roles.",
      "Apply responsive CSS using Grid and Flexbox.",
      "Add scroll-into-view animations with Intersection Observer.",
      "Optimize assets and deploy via Vercel/GitHub Pages."
    ]
  }
];


function toMatch(doc: ProjectDocument): ProjectMatch {
  return doc.toJSON() as unknown as ProjectMatch;
}

/** Analyzes user profile to find the best projects. */
async function findMatches(userId: string): Promise<ProjectMatch[]> {
  const user = await UserModel.findById(userId);
  if (!user || user.targetRoles.length === 0) {
    throw new ApiError(400, "User must have a target role to find projects");
  }

  const existingMatches = await ProjectModel.find({ userId });
  if (existingMatches.length > 0) {
    return existingMatches.map(toMatch);
  }

  const prompt = `You are an expert tech career advisor. 
Candidate Target Role: ${user.targetRoles[0]}
Candidate Skills: ${user.currentSkills.join(", ")}

Available Projects:
${JSON.stringify(MOCK_PROJECTS, null, 2)}

Match the candidate with the 2 most relevant projects that will help build their portfolio for the target role. For each match, provide a matchScore (0-100) and 2 specific matchReasons why this project is a good fit.
Return ONLY valid JSON in this exact structure:
[
  { "projectId": "p1", "matchScore": 90, "matchReasons": ["reason 1", "reason 2"] }
]`;

  const aiMatchJson = await groqService.generateStructuredResponse(prompt);
  
  let matchResults;
  try {
    matchResults = JSON.parse(aiMatchJson);
  } catch (e) {
    matchResults = [
      { projectId: "p2", matchScore: 85, matchReasons: ["Helps build React portfolio", "Good for frontend roles"] }
    ];
  }

  const createdMatches = [];
  for (const result of matchResults) {
    const project = MOCK_PROJECTS.find(p => p.id === result.projectId);
    if (!project) continue;

    const match = await ProjectModel.create({
      userId,
      projectId: project.id,
      project,
      matchScore: result.matchScore,
      matchReasons: result.matchReasons,
      status: "recommended"
    });
    createdMatches.push(match);
  }

  return createdMatches.map(toMatch);
}

/** Updates project status. */
async function updateProjectStatus(userId: string, matchId: string, status: "in_progress" | "completed"): Promise<ProjectMatch> {
  const match = await ProjectModel.findOneAndUpdate(
    { _id: matchId, userId },
    { status },
    { new: true }
  );
  if (!match) throw new ApiError(404, "Project match not found");
  return toMatch(match);
}

export const projectService = {
  findMatches,
  updateProjectStatus
};
