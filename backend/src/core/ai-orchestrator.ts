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

function hasProviderKey(provider: ProviderType) {
  const apiKeys = requestContextStorage.getStore()?.apiKeys;

  if (provider === "gemini") return Boolean(apiKeys?.gemini || env.geminiApiKey);
  if (provider === "groq") return Boolean(apiKeys?.groq || env.groqApiKey);
  return Boolean(apiKeys?.huggingface || env.huggingFaceApiKey);
}

/** Checks whether a provider is healthy, resolving any expired quarantine locks. */
function isProviderHealthy(provider: ProviderType): boolean {
  const status = providerRegistry[provider];
  if (!hasProviderKey(provider)) return false;

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

function summarizeError(error: any) {
  return error?.response?.data?.error?.message || error?.message || error?.code || "Unknown provider error";
}

/** Handles consecutive failures and quarantines degraded nodes to protect API keys. */
function reportFailure(provider: ProviderType, error: any) {
  const status = providerRegistry[provider];
  status.failures += 1;
  status.lastFailureTime = Date.now();
  
  console.warn(`[Zookeeper] Failure reported for ${provider} (Consecutive failures: ${status.failures}). Error:`, summarizeError(error));

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
  taskHuggingFace: () => Promise<T>,
  fallback: () => T | Promise<T>
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

  console.warn(`[Zookeeper] All configured providers failed or are unavailable for [${taskName}]. Using local fallback.`);
  return fallback();
}

function latestUserMessage(messages: CopilotMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

function localMentorResponse(messages: CopilotMessage[], userContext: string) {
  const query = latestUserMessage(messages);
  const hasNotes = /MEMORY_MODE: notes-first/i.test(userContext);
  const focus = query.length > 0 ? query : "your next study step";

  return {
    content: [
      `> [!WARNING]\n> **Veda AI Offline Fallback Protocol Active**\n> All configured remote AI providers (Groq, Gemini, HuggingFace) failed to complete the request (usually due to a missing or invalid API Key). To experience Veda's full cognitive intelligence, SDE mentors, and custom interactive roadmaps, please verify that your keys are correctly defined inside your \`backend/.env\` file.`,
      `## Topic Analysis: ${focus}`,
      hasNotes
        ? "I found relevant notes in your workspace context, so I’ll use those as the starting point and add a little general structure around them."
        : "I do not have a live model key available, so this is a local structured fallback answer.",
      "### Key Idea",
      "Break the topic into a definition, why it matters, where it is used, and one tiny practice step.",
      "### Study Flow",
      "- Read or recall the concept in your own words.",
      "- Write one example without looking at notes.",
      "- Compare, correct, and save only the missing pieces.",
      "### Quick Practice",
      "Explain the concept in 5 lines, then build one tiny example that proves you understood it."
    ].join("\n\n"),
    metadata: {
      behaviorAnalysis: "Local fallback active because no configured AI provider completed the request.",
      cards: [
        {
          type: "focus_sprint",
          title: "25-minute recovery sprint",
          description: "Review the topic, answer from memory, then fix only the gaps.",
          actionLabel: "Start sprint",
          actionUrl: "/focus",
          data: { durationMinutes: 25 }
        }
      ],
      nextBestAction: {
        label: "Create one recall note",
        description: "A single tested note gives Veda useful memory even before remote AI is configured.",
        type: "revise"
      }
    }
  };
}

function localRoadmap(
  targetRole: string,
  timelineWeeks: number,
  skillGaps: Array<{ skill: string; gapScore: number }>
) {
  const topSkills = skillGaps.length > 0 ? skillGaps.slice(0, 4).map((gap) => gap.skill) : ["fundamentals", "projects", "interview practice"];
  const weeks = Math.max(1, Math.min(timelineWeeks || 4, 12));

  return {
    title: `${targetRole} execution plan`,
    readinessScore: 20,
    consistencyScore: 50,
    currentPhaseId: "phase-1",
    nextMilestone: `Ship a small ${targetRole} proof project`,
    phases: [
      {
        id: "phase-1",
        title: "Stabilize the core",
        description: `Build reliable daily momentum around ${topSkills.join(", ")}.`,
        status: "unlocked",
        estimatedWeeks: weeks,
        difficulty: "beginner",
        checkpoints: ["Complete daily recall", "Build one portfolio proof", "Run one mock interview"],
        missions: [
          {
            id: "mission-w1",
            weekNumber: 1,
            title: "First visible proof",
            description: `Turn ${topSkills[0]} into a small working artifact.`,
            whyItMatters: "Recruiters and interviews reward proof over vague study time.",
            outcome: "One demo, one explanation, and one review note.",
            commonMistakes: ["Studying passively", "Skipping recall", "Trying to build too much at once"],
            status: "not_started",
            tasks: [
              {
                id: "task-local-1",
                title: `Explain ${topSkills[0]} from memory in 10 lines`,
                type: "revise",
                durationMinutes: 25,
                difficulty: "easy",
                aiHint: "Close your notes first, then patch the missing pieces."
              },
              {
                id: "task-local-2",
                title: `Build one tiny feature using ${topSkills[0]}`,
                type: "practice",
                durationMinutes: 60,
                difficulty: "medium",
                aiHint: "Keep the scope small enough to finish today."
              }
            ]
          }
        ]
      }
    ],
    insights: [
      {
        type: "recommendation",
        message: "Local fallback generated this plan. Add a Groq, Gemini, or Hugging Face key in Settings for richer personalization.",
        actionLabel: "Open Settings",
        actionUrl: "/settings"
      }
    ]
  };
}

function localQuiz(topic: string, targetRole: string) {
  return [
    {
      question: `What is the core idea behind ${topic} for a ${targetRole}?`,
      options: ["Memorizing syntax only", "Understanding the problem, tradeoffs, and usage", "Avoiding practice", "Skipping review"],
      correctAnswer: 1,
      explanation: "Interview-ready learning means knowing when to use a concept and what tradeoffs it creates."
    },
    {
      question: `What should you do after learning ${topic}?`,
      options: ["Move on immediately", "Build a tiny example and recall it later", "Only reread notes", "Wait for a full project"],
      correctAnswer: 1,
      explanation: "Small implementation plus spaced recall makes the concept durable."
    }
  ];
}

function localResumeTailoring(request: ResumeTailorRequest): ResumeTailorResult {
  const skills = Array.from(new Set((request.currentResume.match(/[A-Za-z][A-Za-z0-9+#. -]{1,30}/g) ?? []).slice(0, 12)));

  return {
    roleFitSummary: `Local analysis: position the resume around evidence that matches ${request.targetRole}. Add a provider key for deeper JD-aware rewriting.`,
    targetHeadline: `${request.targetRole} candidate focused on practical delivery`,
    tailoredSummary: "Emphasize shipped projects, measurable outcomes, and role-relevant technical decisions. Keep every claim tied to real work you can discuss.",
    keywordAdditions: skills,
    bulletRewrites: [],
    projectAnalysis: [],
    atsIntelligence: {
      score: 55,
      missingKeywords: [],
      formattingSafety: { status: "safe", issues: [] },
      recruiterScanOptimization: "Lead each section with role-relevant skills, concrete project outcomes, and clear dates."
    },
    interviewAlignment: {
      likelyQuestions: [`Why are you targeting ${request.targetRole}?`, "Which project best proves your readiness?"],
      weakDiscussionAreas: ["Quantified impact", "System design tradeoffs"],
      projectExplanationGaps: ["Architecture decisions", "Testing and deployment details"]
    },
    missingProofPoints: ["Metrics", "Scale", "Ownership"],
    nextActions: ["Add measurable outcomes", "Move strongest project higher", "Mirror honest JD keywords"]
  };
}

function localNoteAnalysis(title: string, content: string) {
  const concepts = Array.from(new Set(content.split(/[^A-Za-z0-9+#.]+/).filter((word) => word.length > 3))).slice(0, 6);

  return {
    topic: title || concepts[0] || "General",
    summary: content.slice(0, 240) || "No note content provided.",
    concepts,
    difficulty: "beginner",
    knowledgeLayer: "understanding",
    conceptGraph: concepts.slice(1).map((concept) => ({ from: concepts[0], to: concept, relationship: "related_to" })),
    executionTasks: [
      { title: `Explain ${concepts[0] || title} without notes`, type: "explain", difficulty: "easy" }
    ],
    confusionSignals: ["Check whether you can explain the concept without rereading."],
    flashcards: concepts.slice(0, 3).map((concept) => ({ question: `What is ${concept}?`, answer: `Explain ${concept} in your own words and add one example.` })),
    interviewRelevance: {
      frequency: "medium",
      importance: 60,
      usageContext: "Useful as a foundation for technical explanations.",
      commonQuestions: [`Explain ${concepts[0] || title}.`],
      realWorldUsage: ["Apply it in a small implementation or debugging task."]
    },
    revisionStrategy: "conceptual",
    tags: concepts.slice(0, 5)
  };
}

function localSkillReport(targetRole: string, rawGaps: any[]) {
  return {
    targetRole,
    overallScore: 45,
    readiness: {
      learningFoundation: "Medium",
      problemSolving: "Weak",
      projectDepth: "Medium",
      interviewConfidence: "Weak"
    },
    roleMatches: [
      {
        role: `${targetRole} Intern`,
        matchPercentage: 55,
        strengths: rawGaps.slice(0, 2).map((gap) => gap.skill).filter(Boolean),
        blockers: rawGaps.slice(2, 5).map((gap) => gap.skill).filter(Boolean),
        estimatedTimelineMonths: 3
      }
    ],
    gaps: rawGaps,
    blockers: ["Add more active recall and project proof for the highest-gap skills."],
    careerTrajectory: "With consistent daily practice, you can improve readiness within the next few months.",
    predictiveInsights: ["Skipping review will weaken interview recall fastest."],
    recommendations: {
      nextSkills: rawGaps.slice(0, 3).map((gap) => gap.skill).filter(Boolean),
      recoveryPlan: "Pick one weak skill, revise for 25 minutes, then build one tiny example."
    },
    provider: "local-fallback"
  };
}

function localStructuredResponse(prompt: string, taskCategory: string) {
  if (taskCategory === "interview") {
    if (/overall|final review|3-sentence/i.test(prompt)) {
      return "You communicated a workable foundation. The next improvement is to make tradeoffs, complexity, and failure modes more explicit. Practice one focused remediation task, then repeat the answer with a tighter structure.";
    }

    if (/technicalAccuracy|missingConcepts|score/i.test(prompt)) {
      return JSON.stringify({
        technicalAccuracy: 60,
        clarity: 65,
        scalabilityThinking: 50,
        debuggingApproach: 60,
        communication: 70,
        optimizationAwareness: 55,
        confidence: 65,
        overall: 6,
        feedback: "Solid baseline answer. Add concrete complexity, edge cases, and one production tradeoff.",
        missingConcepts: ["Complexity analysis", "Edge cases"],
        scalabilityGaps: ["Throughput and caching tradeoffs"],
        communicationTips: ["Start with a short plan before details"]
      });
    }

    return JSON.stringify(localQuiz("core software engineering", "Software Engineer").map((item, index) => ({
      question: item.question,
      category: index === 0 ? "technical" : "scenario",
      hint: item.explanation,
      idealAnswer: "Explain the concept, name tradeoffs, discuss complexity, and include one practical example."
    })).concat({
      question: "Tell me about a project decision you would change after learning more.",
      category: "behavioral",
      hint: "Use situation, decision, result, and lesson learned.",
      idealAnswer: "Show ownership, reflection, and a clear improvement loop."
    }));
  }

  if (taskCategory === "mentorship") {
    return JSON.stringify([{ mentorId: "m1", matchScore: 82, matchReasons: ["Strong fit for frontend growth", "Can help with technical interview preparation"] }]);
  }

  if (taskCategory === "project") {
    if (/encouragement|focusArea/i.test(prompt)) {
      return JSON.stringify({
        encouragement: "Your portfolio grows fastest when you finish one small, polished project at a time.",
        focusArea: {
          title: "Ship one proof",
          description: "Pick a project that matches your target role and keep the first milestone narrow. A finished demo beats a huge unfinished idea.",
          action: "Start project"
        }
      });
    }

    return JSON.stringify([
      {
        project: {
          title: "Role-ready portfolio proof",
          company: "Personal Project",
          industry: "Technology",
          description: "Build a focused application that demonstrates authentication, data modeling, and one polished workflow. Document tradeoffs so it doubles as interview preparation.",
          requiredSkills: ["TypeScript", "APIs", "Testing"],
          difficulty: "intermediate",
          estimatedHours: 30,
          implementationPlan: ["Define one user workflow", "Model the data", "Build the API", "Create the UI", "Add tests and a README"]
        },
        matchScore: 85,
        matchReasons: ["Builds visible proof for your target role", "Uses practical engineering skills"]
      }
    ]);
  }

  return JSON.stringify({ message: "Local fallback generated a conservative response.", provider: "local-fallback" });
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
      () => huggingFaceService.generateCopilotResponse(messages, userContext),
      () => localMentorResponse(messages, userContext)
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
      () => huggingFaceService.generateRoadmap(targetRole, timelineWeeks, skillGaps, userNotes, behaviorProfile, intelligenceProfile),
      () => localRoadmap(targetRole, timelineWeeks, skillGaps)
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
      () => huggingFaceService.generateQuiz(topic, targetRole),
      () => localQuiz(topic, targetRole)
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
      () => huggingFaceService.generateResumeTailoring(request, userContext),
      () => localResumeTailoring(request)
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
      () => huggingFaceService.generateSkillIntelligenceReport(targetRole, rawGaps, userContext),
      () => localSkillReport(targetRole, rawGaps)
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
      () => huggingFaceService.analyzeNote(title, content, userContext),
      () => localNoteAnalysis(title, content)
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
      () => huggingFaceService.generateStructuredResponse(prompt),
      () => localStructuredResponse(prompt, taskCategory)
    );
  }
}
