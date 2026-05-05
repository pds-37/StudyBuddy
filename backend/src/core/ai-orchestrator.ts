import { groqService } from "../services/ai/groq.service.js";
import { geminiService } from "../services/ai/gemini.service.js";
import type { CopilotMessage, ResumeTailorRequest, ResumeTailorResult } from "@studybuddy/shared";

/**
 * AI Orchestrator
 * Central gateway for all AI model interactions.
 * Routes tasks to the optimal model (Groq for speed, Gemini for complex context).
 */
export class AIOrchestrator {
  /**
   * Generates a response for the AI Mentor (Copilot).
   * Typically uses Groq for low-latency conversational experience.
   */
  static async getMentorResponse(messages: CopilotMessage[], userContext: string): Promise<string> {
    return groqService.generateCopilotResponse(messages, userContext);
  }

  /**
   * Generates a personalized roadmap.
   * Can be routed to Gemini for better long-term planning and resource verification.
   */
  static async generateRoadmap(
    targetRole: string,
    timelineWeeks: number,
    skillGaps: Array<{ skill: string; gapScore: number }>,
    userNotes?: string,
    behaviorProfile?: any
  ) {
    // Logic to switch between models based on context size or user tier
    return groqService.generateRoadmap(targetRole, timelineWeeks, skillGaps, userNotes, behaviorProfile);
  }

  /**
   * Generates a technical quiz.
   */
  static async generateQuiz(topic: string, targetRole: string) {
    return groqService.generateQuiz(topic, targetRole);
  }

  /**
   * Tailors a resume for a specific role.
   */
  static async tailorResume(request: ResumeTailorRequest, userContext: string): Promise<ResumeTailorResult> {
    return groqService.generateResumeTailoring(request, userContext);
  }

  /**
   * Analyzes user behavior logs to extract insights.
   * (Phase 3 feature)
   */
  static async analyzeBehavior(logs: any[]) {
    // This would likely go to a larger model for pattern recognition
    return {
      insight: "User tends to skip Data Structures tasks on Monday mornings.",
      recommendation: "Move heavy tasks to Tuesday evening."
    };
  }
}
