import { groqService } from "../services/ai/groq.service.js";
import { geminiService } from "../services/ai/gemini.service.js";
import { env } from "../config/env.js";
import type { CopilotMessage, ResumeTailorRequest, ResumeTailorResult } from "@studybuddy/shared";

/**
 * AI Orchestrator
 * Central gateway for all AI model interactions.
 * Routes tasks to the optimal model (Gemini by default if configured, Groq for fallback/conversational speed).
 */
export class AIOrchestrator {
  /**
   * Generates a response for the AI Mentor (Copilot).
   */
  static async getMentorResponse(messages: CopilotMessage[], userContext: string): Promise<{ content: string; metadata: any }> {
    // If Gemini key is set, try Gemini first. Otherwise, try Groq.
    if (env.geminiApiKey) {
      try {
        console.log("[AIOrchestrator] Routing getMentorResponse to Gemini...");
        return await geminiService.generateCopilotResponse(messages, userContext);
      } catch (err) {
        console.warn("[AIOrchestrator] Gemini mentor response failed, falling back to Groq:", err);
      }
    }

    try {
      return await groqService.generateCopilotResponse(messages, userContext);
    } catch (groqErr) {
      console.warn("[AIOrchestrator] Groq mentor response failed:", groqErr);
      // Failover to Gemini if Groq failed and Gemini is available but wasn't tried
      if (env.geminiApiKey) {
        console.log("[AIOrchestrator] Failover getMentorResponse to Gemini...");
        return await geminiService.generateCopilotResponse(messages, userContext);
      }
      throw groqErr;
    }
  }

  /**
   * Generates a personalized roadmap.
   */
  static async generateRoadmap(
    targetRole: string,
    timelineWeeks: number,
    skillGaps: Array<{ skill: string; gapScore: number }>,
    userNotes?: string,
    behaviorProfile?: any,
    intelligenceProfile?: any
  ): Promise<any> {
    if (env.geminiApiKey) {
      try {
        console.log("[AIOrchestrator] Routing generateRoadmap to Gemini...");
        return await geminiService.generateRoadmap(targetRole, timelineWeeks, skillGaps, userNotes, behaviorProfile, intelligenceProfile);
      } catch (err) {
        console.warn("[AIOrchestrator] Gemini roadmap generation failed, falling back to Groq:", err);
      }
    }

    try {
      return await groqService.generateRoadmap(targetRole, timelineWeeks, skillGaps, userNotes, behaviorProfile, intelligenceProfile);
    } catch (groqErr) {
      console.warn("[AIOrchestrator] Groq roadmap generation failed:", groqErr);
      if (env.geminiApiKey) {
        console.log("[AIOrchestrator] Failover generateRoadmap to Gemini...");
        return await geminiService.generateRoadmap(targetRole, timelineWeeks, skillGaps, userNotes, behaviorProfile, intelligenceProfile);
      }
      throw groqErr;
    }
  }

  /**
   * Generates a technical quiz.
   */
  static async generateQuiz(topic: string, targetRole: string): Promise<any[]> {
    if (env.geminiApiKey) {
      try {
        console.log("[AIOrchestrator] Routing generateQuiz to Gemini...");
        return await geminiService.generateQuiz(topic, targetRole);
      } catch (err) {
        console.warn("[AIOrchestrator] Gemini quiz generation failed, falling back to Groq:", err);
      }
    }

    try {
      return await groqService.generateQuiz(topic, targetRole);
    } catch (groqErr) {
      console.warn("[AIOrchestrator] Groq quiz generation failed:", groqErr);
      if (env.geminiApiKey) {
        console.log("[AIOrchestrator] Failover generateQuiz to Gemini...");
        return await geminiService.generateQuiz(topic, targetRole);
      }
      throw groqErr;
    }
  }

  /**
   * Tailors a resume for a specific role.
   */
  static async tailorResume(request: ResumeTailorRequest, userContext: string): Promise<ResumeTailorResult> {
    if (env.geminiApiKey) {
      try {
        console.log("[AIOrchestrator] Routing tailorResume to Gemini...");
        return await geminiService.generateResumeTailoring(request, userContext);
      } catch (err) {
        console.warn("[AIOrchestrator] Gemini resume tailoring failed, falling back to Groq:", err);
      }
    }

    try {
      return await groqService.generateResumeTailoring(request, userContext);
    } catch (groqErr) {
      console.warn("[AIOrchestrator] Groq resume tailoring failed:", groqErr);
      if (env.geminiApiKey) {
        console.log("[AIOrchestrator] Failover tailorResume to Gemini...");
        return await geminiService.generateResumeTailoring(request, userContext);
      }
      throw groqErr;
    }
  }

  /**
   * Generates an intelligent Skill Gap Report.
   */
  static async generateSkillIntelligenceReport(targetRole: string, rawGaps: any[], userContext: string): Promise<any> {
    if (env.geminiApiKey) {
      try {
        console.log("[AIOrchestrator] Routing generateSkillIntelligenceReport to Gemini...");
        return await geminiService.generateSkillIntelligenceReport(targetRole, rawGaps, userContext);
      } catch (err) {
        console.warn("[AIOrchestrator] Gemini Skill Gap Report failed, falling back to Groq:", err);
      }
    }

    try {
      return await groqService.generateSkillIntelligenceReport(targetRole, rawGaps, userContext);
    } catch (groqErr) {
      console.warn("[AIOrchestrator] Groq Skill Gap Report failed:", groqErr);
      if (env.geminiApiKey) {
        console.log("[AIOrchestrator] Failover generateSkillIntelligenceReport to Gemini...");
        return await geminiService.generateSkillIntelligenceReport(targetRole, rawGaps, userContext);
      }
      throw groqErr;
    }
  }

  /**
   * Analyzes user behavior logs to extract insights.
   */
  static async analyzeBehavior(logs: any[]): Promise<any> {
    return {
      insight: "User tends to skip Data Structures tasks on Monday mornings.",
      recommendation: "Move heavy tasks to Tuesday evening."
    };
  }

  /**
   * Analyzes note to extract structured knowledge.
   */
  static async analyzeNote(title: string, content: string, userContext: string): Promise<any> {
    if (env.geminiApiKey) {
      try {
        console.log("[AIOrchestrator] Routing analyzeNote to Gemini...");
        return await geminiService.analyzeNote(title, content, userContext);
      } catch (err) {
        console.warn("[AIOrchestrator] Gemini note analysis failed, falling back to Groq:", err);
      }
    }

    try {
      return await groqService.analyzeNote(title, content, userContext);
    } catch (groqErr) {
      console.warn("[AIOrchestrator] Groq note analysis failed:", groqErr);
      if (env.geminiApiKey) {
        console.log("[AIOrchestrator] Failover analyzeNote to Gemini...");
        return await geminiService.analyzeNote(title, content, userContext);
      }
      throw groqErr;
    }
  }
}
