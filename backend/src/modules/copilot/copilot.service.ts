import { CopilotConversation } from "./copilot.model.js";
import { groqService } from "../../services/ai/groq.service.js";
import { notesService } from "../notes/notes.service.js";
import { skillsService } from "../skills/skills.service.js";
import { roadmapsService } from "../roadmaps/roadmaps.service.js";
import { jobsService } from "../jobs/jobs.service.js";
import { usersService } from "../users/users.service.js";
import type { CopilotMessage, JobListing, Roadmap } from "@studybuddy/shared";

/** Creates a new conversation for a user. */
async function createConversation(userId: string): Promise<string> {
  const conversation = new CopilotConversation({
    userId,
    messages: [{
      id: "system-1",
      role: "system",
      content: "You are an expert career coach and AI assistant. Help users with their career development, skill building, job search, and learning roadmaps. Be helpful, encouraging, and provide actionable advice.",
      createdAt: new Date().toISOString()
    }]
  });

  const saved = await conversation.save();
  return saved._id.toString();
}

/** Gets a conversation by ID. */
async function getConversation(conversationId: string, userId: string) {
  const conversation = await CopilotConversation.findOne({
    _id: conversationId,
    userId
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
}

/** Gets all conversations for a user. */
async function getUserConversations(userId: string) {
  return CopilotConversation.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(10);
}

/** Adds a message to a conversation and gets AI response. */
async function sendMessage(
  conversationId: string,
  userId: string,
  message: string
): Promise<CopilotMessage> {
  const conversation = await getConversation(conversationId, userId);

  // Add user message
  const userMessage: CopilotMessage = {
    id: `user-${Date.now()}`,
    role: "user",
    content: message,
    createdAt: new Date().toISOString()
  };

  conversation.messages.push(userMessage);

  // Get user context for better responses
  const userContext = await buildUserContext(userId, message);

  // Generate AI response
  const aiResponse = await groqService.generateCopilotResponse(
    conversation.messages,
    userContext
  );

  const assistantMessage: CopilotMessage = {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: aiResponse,
    createdAt: new Date().toISOString()
  };

  conversation.messages.push(assistantMessage);
  conversation.updatedAt = new Date();
  await conversation.save();

  return assistantMessage;
}

/** Builds comprehensive user context for AI responses. */
async function buildUserContext(userId: string, currentQuery?: string): Promise<string> {
  try {
    const [profile, skillGapAnalysis, notesResult, roadmap, jobs] = await Promise.all([
      usersService.getProfile(userId),
      skillsService.analyzeSkillGap(userId),
      notesService.listNotes(userId, { limit: 5, offset: 0 }),
      roadmapsService.getRoadmap(userId),
      jobsService.getJobs(userId, 5)
    ]);

    const notes = notesResult.notes;
    const context: string[] = [];

    // User profile
    if (profile) {
      context.push(`User Profile: ${profile.name || "Unknown"}, Target Role: ${profile.targetRole || "Not specified"}, Experience: ${profile.experienceLevel}`);
    }

    // Notes - use vector search if we have a query, otherwise use recent notes
    if (currentQuery) {
      const relevantNotes = await notesService.getNotesContextForQuery(userId, currentQuery, 2);
      if (relevantNotes) {
        context.push(relevantNotes);
      }
    } else if (notes && notes.length > 0) {
      const recentNotes = notes.slice(0, 3).map((note) => note.content.substring(0, 200)).join(" | ");
      context.push(`Recent Notes: ${recentNotes}`);
    }

    // Skill gap snapshot
    if (skillGapAnalysis.currentSkills.length > 0) {
      context.push(`Current Skills: ${skillGapAnalysis.currentSkills.join(", ")}`);
    }

    if (skillGapAnalysis.recommendations.nextSkills.length > 0) {
      context.push(`Priority Skills To Learn Next: ${skillGapAnalysis.recommendations.nextSkills.join(", ")}`);
    }

    // Active roadmap
    if (roadmap) {
      const milestones = roadmap.milestones
        .filter((milestone) => milestone.status !== "completed")
        .slice(0, 3)
        .map((milestone) => milestone.title)
        .join(", ");
      context.push(`Current Roadmap: ${roadmap.title}, Active Milestones: ${milestones}`);
    }

    // Job matches
    if (jobs && jobs.length > 0) {
      const topJobs = jobs
        .slice(0, 3)
        .map((job: JobListing) => `${job.title} at ${job.company}${job.matchScore ? ` (${job.matchScore}% match)` : ""}`)
        .join(", ");
      context.push(`Recommended Jobs: ${topJobs}`);
    }

    return context.join("\n\n");
  } catch (error) {
    console.error("Error building user context:", error);
    return "Limited user context available due to system error.";
  }
}

export const copilotService = {
  createConversation,
  getConversation,
  getUserConversations,
  sendMessage
};
