import { ProjectModel, type ProjectDocument } from "./project.model.js";
import { UserModel } from "../users/user.model.js";
import { AIOrchestrator } from "../../core/ai-orchestrator.js";
import { ApiError } from "../../utils/api-error.js";
import { studentIntelligenceService } from "../intelligence/student-intelligence.service.js";
import type { ProjectMatch, CapstoneProject } from "@studybuddy/shared";
import { randomUUID } from "crypto";

function toMatch(doc: ProjectDocument): ProjectMatch {
  return doc.toJSON() as unknown as ProjectMatch;
}

/** Analyzes user profile to dynamically generate tailored capstone projects. */
async function findMatches(userId: string): Promise<ProjectMatch[]> {
  const user = await UserModel.findById(userId);
  if (!user || user.targetRoles.length === 0) {
    throw new ApiError(400, "User must have a target role to find projects");
  }

  const existingMatches = await ProjectModel.find({ userId });
  if (existingMatches.length > 0) {
    return existingMatches.map(toMatch);
  }

  const prompt = `You are an expert tech career advisor and senior engineering manager.
Candidate Target Role: ${user.targetRoles[0]}
Candidate Skills: ${user.currentSkills.join(", ")}

Generate 3 unique, realistic, and highly impactful capstone projects tailored specifically for this candidate to help them land a job in their target role. The projects should be impressive enough for a portfolio.
Do not use generic tutorial projects. Make them sound like real industry features (e.g., "Build a scalable e-commerce API", "Design a real-time collaborative editor").

Return ONLY valid JSON in this exact structure:
[
  {
    "project": {
      "title": "Project Title",
      "company": "Fictional Tech Company",
      "industry": "Industry Name",
      "description": "2-sentence compelling description of what the project is.",
      "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
      "difficulty": "beginner" | "intermediate" | "advanced",
      "estimatedHours": 30,
      "implementationPlan": ["Step 1...", "Step 2...", "Step 3...", "Step 4...", "Step 5..."]
    },
    "matchScore": 95,
    "matchReasons": ["Specific reason 1", "Specific reason 2"]
  }
]`;

  const aiMatchJson = await AIOrchestrator.generateStructuredResponse(prompt, "project");
  
  let matchResults: Array<{ project: Omit<CapstoneProject, "id">; matchScore: number; matchReasons: string[] }>;
  try {
    matchResults = JSON.parse(aiMatchJson);
  } catch (e) {
    // Fallback if AI parsing fails
    matchResults = [
      {
        project: {
          title: "Build a scalable microservices architecture",
          company: "Tech Startups",
          industry: "Technology",
          description: "Design and implement a scalable microservices architecture for an e-commerce platform.",
          requiredSkills: user.currentSkills.slice(0, 3),
          difficulty: "intermediate",
          estimatedHours: 40,
          implementationPlan: ["Define API", "Setup DB", "Implement Auth", "Add Caching", "Dockerize"]
        },
        matchScore: 85,
        matchReasons: ["Matches your target role perfectly.", "Uses your current skills in a practical scenario."]
      }
    ];
  }

  const createdMatches = [];
  for (const result of matchResults) {
    const projectWithId: CapstoneProject = {
      id: randomUUID(),
      ...result.project
    };

    const match = await ProjectModel.create({
      userId,
      projectId: projectWithId.id,
      project: projectWithId,
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

  await studentIntelligenceService.emitEvent(userId, {
    type: status === "completed" ? "PROJECT_COMPLETED" : "PROJECT_STARTED",
    source: "projects",
    entityId: match._id.toString(),
    payload: {
      projectTitle: match.project.title,
      requiredSkills: match.project.requiredSkills,
      difficulty: match.project.difficulty,
      matchScore: match.matchScore
    }
  }).catch(error => console.error("Student intelligence event failed:", error));

  return toMatch(match);
}

async function generateCustomProject(userId: string, ideaPrompt: string): Promise<ProjectMatch> {
  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const prompt = `You are an expert technical product manager and engineering mentor.
The user wants to build a custom project based on this idea: "${ideaPrompt}"
User's Skills: ${user.currentSkills.join(", ")}
Target Role: ${user.targetRoles[0] || "Software Engineer"}

Generate a detailed, realistic capstone project specification that fulfills this idea while maximizing its value for the user's target role and skills.
Return ONLY valid JSON in this exact structure:
{
  "project": {
    "title": "Professional Project Title",
    "company": "Personal Project",
    "industry": "Relevant Industry",
    "description": "2-sentence compelling description of the project.",
    "requiredSkills": ["Skill 1", "Skill 2"],
    "difficulty": "intermediate",
    "estimatedHours": 20,
    "implementationPlan": ["Step 1", "Step 2", "Step 3"]
  },
  "matchScore": 95,
  "matchReasons": ["Why this is a great custom project", "How it helps their portfolio"]
}`;

  const aiMatchJson = await AIOrchestrator.generateStructuredResponse(prompt, "project");
  
  let result;
  try {
    result = JSON.parse(aiMatchJson);
  } catch (e) {
    throw new ApiError(500, "Failed to parse AI generated project");
  }

  const projectWithId: CapstoneProject = {
    id: randomUUID(),
    ...result.project
  };

  const match = await ProjectModel.create({
    userId,
    projectId: projectWithId.id,
    project: projectWithId,
    matchScore: result.matchScore,
    matchReasons: result.matchReasons,
    status: "recommended"
  });

  return toMatch(match);
}

export type ProjectMentorInsights = {
  encouragement: string;
  focusArea: { title: string; description: string; action: string };
  stats: { total: number; completed: number; inProgress: number; planning: number; streak: number };
};

async function getMentorInsights(userId: string): Promise<ProjectMentorInsights> {
  const user = await UserModel.findById(userId);
  const matches = await ProjectModel.find({ userId });
  
  const completed = matches.filter(m => m.status === "completed").length;
  const inProgress = matches.filter(m => m.status === "in_progress").length;
  const recommended = matches.filter(m => m.status === "recommended").length;
  
  const prompt = `You are an AI Project Mentor for a software engineer.
User Target Role: ${user?.targetRoles[0] || "Software Engineer"}
User Skills: ${user?.currentSkills.join(", ")}
Projects Completed: ${completed}
Projects In Progress: ${inProgress}
Projects Recommended: ${recommended}

Analyze their progress and generate brief mentor insights.
Return ONLY valid JSON in this exact structure:
{
  "encouragement": "Short 1 sentence motivational message. (e.g. You're doing great! 🔥)",
  "focusArea": {
    "title": "Short Focus Title",
    "description": "2-sentence advice on what they should focus on next based on their project status and skills.",
    "action": "Short action button label (e.g. Find Backend Projects)"
  }
}`;

  let insights: Omit<ProjectMentorInsights, "stats"> = {
    encouragement: "Keep up the great work! 🚀",
    focusArea: {
      title: "Build your portfolio",
      description: "Start a recommended project to build your practical experience.",
      action: "Start a Project"
    }
  };

  try {
    const aiJson = await AIOrchestrator.generateStructuredResponse(prompt, "project");
    insights = JSON.parse(aiJson);
  } catch (e) {
    console.error("Failed to parse mentor insights", e);
  }

  return {
    ...insights,
    stats: {
      total: matches.length,
      completed,
      inProgress,
      planning: recommended,
      streak: user?.behaviorProfile?.consistencyScore ? Math.floor(user.behaviorProfile.consistencyScore / 10) : 1
    }
  };
}

export const projectService = {
  findMatches,
  updateProjectStatus,
  generateCustomProject,
  getMentorInsights
};
