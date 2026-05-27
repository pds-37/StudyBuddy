import { groqService } from "../services/ai/groq.service.js";
import { geminiService } from "../services/ai/gemini.service.js";
import { huggingFaceService } from "../services/ai/huggingface.service.js";
import { env } from "../config/env.js";
import { requestContextStorage } from "./context.js";
import type { CopilotMessage, ResumeTailorRequest, ResumeTailorResult } from "@studybuddy/shared";

type ProviderType = "gemini" | "groq" | "huggingface";

interface ProviderStatus {
  active: boolean;
  failures: number;
  lastFailureTime: number;
}

// Global Zookeeper Registry for AI provider health and status
const providerRegistry: Record<ProviderType, ProviderStatus> = {
  gemini: { active: true, failures: 0, lastFailureTime: 0 },
  groq: { active: true, failures: 0, lastFailureTime: 0 },
  huggingface: { active: true, failures: 0, lastFailureTime: 0 }
};

const QUARANTINE_DURATION_MS = 60000; // Quarantine a failing provider for 60 seconds
const FAILURE_THRESHOLD = 2; // Quarantine a provider after 2 consecutive failures

/** Checks whether a provider is healthy, resolving any expired quarantine locks. */
function isProviderHealthy(provider: ProviderType): boolean {
  const status = providerRegistry[provider];
  const store = requestContextStorage.getStore();
  
  if (provider === "gemini" && !env.geminiApiKey) return false;
  if (provider === "groq" && !env.groqApiKey) return false;
  if (provider === "huggingface" && !env.huggingFaceApiKey) return false;

  if (!status.active) {
    const elapsed = Date.now() - status.lastFailureTime;
    if (elapsed > QUARANTINE_DURATION_MS) {
      status.active = true;
      status.failures = 0;
      console.log(`[Zookeeper] Provider ${provider} quarantine expired. Re-activating...`);
      return true;
    }
    return false;
  }
  return true;
}

/** Resets the consecutive failure counter upon a successful AI interaction. */
function reportSuccess(provider: ProviderType) {
  const status = providerRegistry[provider];
  status.failures = 0;
  status.active = true;
}

/** Handles consecutive failures and quarantines degraded nodes to protect API keys. */
function reportFailure(provider: ProviderType, error: any) {
  const status = providerRegistry[provider];
  status.failures += 1;
  status.lastFailureTime = Date.now();
  
  console.warn(`[Zookeeper] Failure reported for ${provider} (Consecutive failures: ${status.failures}). Error:`, error?.message || error);

  if (status.failures >= FAILURE_THRESHOLD) {
    status.active = false;
    console.error(`[Zookeeper] QUARANTINED provider ${provider} due to consecutive failures. Failovers active.`);
  }
}

/** Executes an SDE task routing request via Zookeeper rules. */
async function executeWithRouting<T>(
  taskName: string,
  primary: ProviderType,
  taskGemini: () => Promise<T>,
  taskGroq: () => Promise<T>,
  taskHuggingFace: () => Promise<T>
): Promise<T> {
  const order: ProviderType[] = [primary];
  const others: ProviderType[] = ["groq", "gemini", "huggingface"];
  for (const provider of others) {
    if (provider !== primary) {
      order.push(provider);
    }
  }
  
  const errors: any[] = [];
  
  for (const provider of order) {
    if (isProviderHealthy(provider)) {
      try {
        console.log(`[Zookeeper] Routing SDE task [${taskName}] to provider [${provider}]...`);
        const task = provider === "gemini" ? taskGemini : (provider === "groq" ? taskGroq : taskHuggingFace);
        const result = await task();
        reportSuccess(provider);
        return result;
      } catch (err) {
        reportFailure(provider, err);
        errors.push(err);
      }
    } else {
      console.log(`[Zookeeper] Skipping provider [${provider}] as it is currently unhealthy/unconfigured.`);
    }
  }

  // Last Resort Fallback (attempt primary again even if quarantined)
  console.warn(`[Zookeeper] CRITICAL: All providers are unhealthy or failed for [${taskName}]! Retrying primary [${primary}] as last-resort recovery...`);
  try {
    const task = primary === "gemini" ? taskGemini : (primary === "groq" ? taskGroq : taskHuggingFace);
    const result = await task();
    reportSuccess(primary);
    return result;
  } catch (err) {
    throw new Error(`[Zookeeper Complete Outage] All providers [${order.join(", ")}] are down. Primary retry failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * AI Orchestrator (Zookeeper Master)
 * Central gateway for all AI model interactions.
 * Delegates and load balances SDE task execution to optimal worker bee nodes.
 */
export class AIOrchestrator {
  /**
   * Generates a response for the AI Mentor (Copilot).
   */
  static async getMentorResponse(messages: CopilotMessage[], userContext: string): Promise<{ content: string; metadata: any }> {
    const context = requestContextStorage.getStore();
    const primary = (context?.aiRoutes?.mentor || "groq") as ProviderType;
    return executeWithRouting(
      "mentor_response",
      primary,
      () => geminiService.generateCopilotResponse(messages, userContext),
      () => groqService.generateCopilotResponse(messages, userContext),
      () => huggingFaceService.generateCopilotResponse(messages, userContext)
    );
  }

  /**
   * Generates a personalized learning roadmap.
   */
  static async generateRoadmap(
    targetRole: string,
    timelineWeeks: number,
    skillGaps: Array<{ skill: string; gapScore: number }>,
    userNotes?: string,
    behaviorProfile?: any,
    intelligenceProfile?: any
  ): Promise<any> {
    const context = requestContextStorage.getStore();
    const primary = (context?.aiRoutes?.roadmap || "gemini") as ProviderType;
    return executeWithRouting(
      "generate_roadmap",
      primary,
      () => geminiService.generateRoadmap(targetRole, timelineWeeks, skillGaps, userNotes, behaviorProfile, intelligenceProfile),
      () => groqService.generateRoadmap(targetRole, timelineWeeks, skillGaps, userNotes, behaviorProfile, intelligenceProfile),
      () => huggingFaceService.generateRoadmap(targetRole, timelineWeeks, skillGaps, userNotes, behaviorProfile, intelligenceProfile)
    );
  }

  /**
   * Generates a technical active recall quiz.
   */
  static async generateQuiz(topic: string, targetRole: string): Promise<any[]> {
    const context = requestContextStorage.getStore();
    const primary = (context?.aiRoutes?.quiz || "groq") as ProviderType;
    return executeWithRouting(
      "generate_quiz",
      primary,
      () => geminiService.generateQuiz(topic, targetRole),
      () => groqService.generateQuiz(topic, targetRole),
      () => huggingFaceService.generateQuiz(topic, targetRole)
    );
  }

  /**
   * Tailors a resume for a specific role.
   */
  static async tailorResume(request: ResumeTailorRequest, userContext: string): Promise<ResumeTailorResult> {
    const context = requestContextStorage.getStore();
    const primary = (context?.aiRoutes?.resume || "gemini") as ProviderType;
    return executeWithRouting(
      "tailor_resume",
      primary,
      () => geminiService.generateResumeTailoring(request, userContext),
      () => groqService.generateResumeTailoring(request, userContext),
      () => huggingFaceService.generateResumeTailoring(request, userContext)
    );
  }

  /**
   * Generates an intelligent Skill Gap Report.
   */
  static async generateSkillIntelligenceReport(targetRole: string, rawGaps: any[], userContext: string): Promise<any> {
    const context = requestContextStorage.getStore();
    const primary = (context?.aiRoutes?.skills || "gemini") as ProviderType;
    return executeWithRouting(
      "skill_gap_report",
      primary,
      () => geminiService.generateSkillIntelligenceReport(targetRole, rawGaps, userContext),
      () => groqService.generateSkillIntelligenceReport(targetRole, rawGaps, userContext),
      () => huggingFaceService.generateSkillIntelligenceReport(targetRole, rawGaps, userContext)
    );
  }

  /**
   * Thin analysis mockup for student consistency behavior.
   */
  static async analyzeBehavior(logs: any[]): Promise<any> {
    return {
      insight: "User tends to skip Data Structures tasks on Monday mornings.",
      recommendation: "Move heavy tasks to Tuesday evening."
    };
  }

  /**
   * Analyzes a note to extract structured knowledge.
   */
  static async analyzeNote(title: string, content: string, userContext: string): Promise<any> {
    const context = requestContextStorage.getStore();
    const primary = (context?.aiRoutes?.note || "gemini") as ProviderType;
    return executeWithRouting(
      "analyze_note",
      primary,
      () => geminiService.analyzeNote(title, content, userContext),
      () => groqService.analyzeNote(title, content, userContext),
      () => huggingFaceService.analyzeNote(title, content, userContext)
    );
  }

  /**
   * Centralized gateway for any structured JSON response tasks.
   * Prompters can specify the task/category to route to the optimal model.
   */
  static async generateStructuredResponse(prompt: string, taskCategory: string = "general"): Promise<string> {
    const context = requestContextStorage.getStore();
    let primaryProvider: ProviderType = taskCategory === "interview" ? "groq" : "gemini";

    // Dynamic user-specified routing override
    if (context?.aiRoutes) {
      if (taskCategory === "interview" && context.aiRoutes.interview) {
        primaryProvider = context.aiRoutes.interview as ProviderType;
      } else if (taskCategory === "mentorship" && context.aiRoutes.mentorship) {
        primaryProvider = context.aiRoutes.mentorship as ProviderType;
      } else if (taskCategory === "project" && context.aiRoutes.project) {
        primaryProvider = context.aiRoutes.project as ProviderType;
      } else if (context.aiRoutes[taskCategory as keyof typeof context.aiRoutes]) {
        primaryProvider = context.aiRoutes[taskCategory as keyof typeof context.aiRoutes] as ProviderType;
      }
    }

    return executeWithRouting(
      `structured_response_${taskCategory}`,
      primaryProvider,
      () => geminiService.generateStructuredResponse(prompt),
      () => groqService.generateStructuredResponse(prompt),
      () => huggingFaceService.generateStructuredResponse(prompt)
    );
  }
}
