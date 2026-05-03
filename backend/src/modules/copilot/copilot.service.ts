import { CopilotConversation } from "./copilot.model.js";
import { groqService } from "../../services/ai/groq.service.js";
import { notesService } from "../notes/notes.service.js";
import { mentorService } from "../mentor/mentor.service.js";
import { skillsService } from "../skills/skills.service.js";
import { roadmapsService } from "../roadmaps/roadmaps.service.js";
import { jobsService } from "../jobs/jobs.service.js";
import { usersService } from "../users/users.service.js";
import { UserModel } from "../users/user.model.js";
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

  const noteContext = await notesService.getNotesContextForQuery(userId, message, 3);

  // Get user context for better responses
  const userContext = await buildUserContext(userId, message, noteContext);

  // Generate AI response
  const aiResponse = await groqService.generateCopilotResponse(
    conversation.messages,
    userContext
  );

  if (!noteContext) {
    await notesService.createNote(userId, {
      title: `AI fallback: ${message.slice(0, 72)}`,
      content: aiResponse,
      topic: "ai-fallback",
      tags: ["ai-fallback", "needs-review"],
      linkedSkills: [],
      strength: 0.15
    });
  }

  const assistantMessage: CopilotMessage = {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: aiResponse,
    createdAt: new Date().toISOString()
  };

  conversation.messages.push(assistantMessage);
  conversation.updatedAt = new Date();
  await conversation.save();
  await incrementAiUsage(userId);

  return assistantMessage;
}

async function incrementAiUsage(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    return;
  }

  const month = new Date().toISOString().slice(0, 7);
  if (user.usage?.usageMonth !== month) {
    user.usage = {
      mentorPlansGenerated: user.usage?.mentorPlansGenerated ?? 0,
      aiMessagesThisMonth: 1,
      usageMonth: month
    };
  } else {
    user.usage = {
      mentorPlansGenerated: user.usage?.mentorPlansGenerated ?? 0,
      aiMessagesThisMonth: (user.usage?.aiMessagesThisMonth ?? 0) + 1,
      usageMonth: month
    };
  }

  await user.save();
}

/** Builds comprehensive user context for AI responses. */
async function buildUserContext(userId: string, currentQuery?: string, knownNoteContext?: string): Promise<string> {
  try {
    const [profile, skillGapAnalysis, notesResult, roadmap, jobs, mentorPlan] = await Promise.all([
      usersService.getProfile(userId).catch(() => null),
      skillsService.analyzeSkillGap(userId).catch(() => null),
      notesService.listNotes(userId, { limit: 5, offset: 0 }).catch(() => ({ notes: [], total: 0 })),
      roadmapsService.getRoadmap(userId).catch(() => null),
      jobsService.getJobs(userId, 5).catch(() => []),
      mentorService.getTodayPlan(userId).catch(() => null)
    ]);

    const notes = notesResult.notes;
    const context: string[] = [];

    // User profile
    if (profile) {
      context.push(`User Profile: ${profile.name || "Unknown"}, Target Roles: ${profile.targetRoles?.join(", ") || "Not specified"}, Experience: ${profile.experienceLevel}`);
    }

    if (mentorPlan) {
      const mentorTasks = mentorPlan.tasks
        .filter((task) => task.status !== "completed")
        .slice(0, 3)
        .map((task) => task.title)
        .join(", ");
      context.push(`Today's Mentor Plan: Focus: ${mentorPlan.focus}. Stage: ${mentorPlan.journeyStage}. Pending tasks: ${mentorTasks || "none"}.`);
    }

    // Notes are primary memory. Use the caller-provided search result to avoid duplicate vector work.
    if (currentQuery) {
      if (knownNoteContext) {
        context.push(`MEMORY_MODE: notes-first\n${knownNoteContext}`);
      } else {
        context.push("MEMORY_MODE: fallback\nNo sufficiently relevant user note was found. Answer from general knowledge, clearly mark it as new knowledge, and keep it suitable to save as a future review note.");
      }
    } else if (notes && notes.length > 0) {
      const recentNotes = notes.slice(0, 3).map((note) => note.content.substring(0, 200)).join(" | ");
      context.push(`Recent Notes: ${recentNotes}`);
    }

    // Skill gap snapshot
    if (skillGapAnalysis && skillGapAnalysis.currentSkills.length > 0) {
      context.push(`Current Skills: ${skillGapAnalysis.currentSkills.join(", ")}`);
    }

    if (skillGapAnalysis && skillGapAnalysis.recommendations.nextSkills.length > 0) {
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
