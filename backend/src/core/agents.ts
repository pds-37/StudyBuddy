import type { CopilotMessage, ResumeTailorRequest, ResumeTailorResult } from "@studybuddy/shared";
import { VedaBlackboardMaster } from "./blackboard-master.js";
import { AIOrchestrator } from "./ai-orchestrator.js";

export interface ICooperativeAgent {
  name: string;
  roleDescription: string;
  systemPromptFactory(blackboard: any): string;
}

import { BehaviorEngine } from "../engines/behavior.engine.js";

/**
 * 1. MentorAgent (The Empathetic Career Coach)
 */
export class MentorAgent implements ICooperativeAgent {
  name = "MentorAgent";
  roleDescription = "Conversational study coach, daily priority manager, and morale builder.";

  systemPromptFactory(blackboard: any, isOverwhelmed: boolean = false, tone: string = "neutral"): string {
    const prioritiesText = (blackboard.dailyIntelligence?.priorities ?? [])
      .map((p: any) => `- ${p.title} (${p.reason})`)
      .join("\n") || "No immediate priorities enqueued.";

    const persona = blackboard.preferences?.persona || "student";

    let toneDirective = tone === "motivational" 
      ? "- Highly motivating, inspiring, encouraging. Use phrases that build self-efficacy and confidence."
      : "- Neutral, objective, and supportive without being overly enthusiastic.";

    let overwhelmDirective = isOverwhelmed
      ? "THE STUDENT IS CURRENTLY OVERWHELMED. Stop pushing for progress. Focus entirely on mental well-being, suggest a break, or break down their next task into a 5-minute micro-step. Do not list a large backlog."
      : "Provide immediate, structured SDE milestones.";

    return `You are Veda, an elite SDE Career Mentor and "Mentor Dost" (Mentor + Best Friend). 
    Since the user is currently interacting with you, act as their master coordinator.
    
    BLACKBOARD STATE MEMORY:
    - Target Roles: ${(blackboard.targetRoles ?? []).join(", ") || "General Software Engineering"}
    - Persona: ${persona}
    - Cognitive Load: ${blackboard.cognitiveLoad ?? 0}%
    - Burnout Risk: ${blackboard.burnoutRisk ?? 0}%
    - Motivation / Emotional State: ${blackboard.emotionalState || "steady"}
    - Adaptive Difficulty Mode: ${blackboard.adaptiveDifficulty || "balanced"}
    - Current Daily Priorities:
    ${prioritiesText}

    TONE & STYLE:
    - Empathic, warm, slightly casual, yet technically elite (proud older sibling persona).
    ${toneDirective}
    - Tailor your advice to their persona (${persona}).
    
    BEHAVIORAL DIRECTIVE:
    ${overwhelmDirective}`;
  }

  async execute(userId: string, messages: CopilotMessage[]): Promise<{ content: string; metadata: any }> {
    const blackboard = await VedaBlackboardMaster.getBlackboardState(userId);
    
    // A/B Testing & Overwhelm Detection
    const nudgeStrategy = BehaviorEngine.getNudgeStrategy(userId);
    const isOverwhelmed = await BehaviorEngine.checkOverwhelmState(userId);

    const systemPrompt = this.systemPromptFactory(blackboard, isOverwhelmed, nudgeStrategy.tone);

    // Call Zookeeper Master to route to the chosen model
    const response = await AIOrchestrator.getMentorResponse(messages, systemPrompt);
    
    // Report this conversation session to the Blackboard to recalculate study state
    await VedaBlackboardMaster.recordAgentFindings(userId, {
      type: "MENTOR_INTERACTION",
      source: "mentor",
      payload: { messageCount: messages.length, tone: nudgeStrategy.tone, overwhelmed: isOverwhelmed }
    });

    return response;
  }
}

/**
 * 2. RoadmapSpecialistAgent (The Curriculum Architect)
 */
export class RoadmapSpecialistAgent implements ICooperativeAgent {
  name = "RoadmapSpecialistAgent";
  roleDescription = "Dynamic learning trajectory architect and syllabus builder.";

  systemPromptFactory(blackboard: any): string {
    return `You are Veda's Curriculum Architect. Your sole job is to design highly actionable, multi-phase SDE learning plans.
    
    BLACKBOARD STATE MEMORY:
    - Adaptive Pacing Mode: ${blackboard.adaptiveDifficulty || "balanced"} (If "recovery", keep tasks simple & short. If "stretch", introduce deeper algorithmic challenges).
    - Cognitive Load: ${blackboard.cognitiveLoad ?? 0}%
    - Burnout Risk: ${blackboard.burnoutRisk ?? 0}%
    - Inconsistent Study Windows: ${blackboard.behavioralPatterns?.skipRate > 0.3 ? "YES (Keep daily steps highly granular, under 30 mins)" : "NO"}`;
  }

  async execute(
    userId: string,
    targetRole: string,
    timelineWeeks: number,
    skillGaps: Array<{ skill: string; gapScore: number }>,
    userNotes?: string
  ): Promise<any> {
    const blackboard = await VedaBlackboardMaster.getBlackboardState(userId);
    
    // Inject dynamic curriculum boundaries based on Blackboard burnout/pacing risk
    const dynamicTimeline = blackboard.burnoutRisk >= 70 ? Math.max(timelineWeeks, 8) : timelineWeeks;

    const result = await AIOrchestrator.generateRoadmap(
      targetRole,
      dynamicTimeline,
      skillGaps,
      userNotes,
      blackboard.behavioralPatterns,
      blackboard
    );

    // Report curriculum update to the Blackboard
    await VedaBlackboardMaster.recordAgentFindings(userId, {
      type: "ROADMAP_RECALIBRATED",
      source: "roadmap",
      payload: { targetRole, timelineWeeks: dynamicTimeline, phaseCount: result?.phases?.length }
    });

    return result;
  }
}

/**
 * 3. QuizArchitectAgent (The Active Recall Instructor)
 */
export class QuizArchitectAgent implements ICooperativeAgent {
  name = "QuizArchitectAgent";
  roleDescription = "Conceptual drill master enqueuing customized challenges on weak topics.";

  systemPromptFactory(blackboard: any): string {
    const weakConceptsList = (blackboard.weakConcepts ?? [])
      .slice(0, 6)
      .join(", ") || "General computer science fundamentals";

    return `You are Veda's Memory Consolidation Specialist. You generate highly targeted Active Recall quizzes.
    
    BLACKBOARD STATE MEMORY:
    - User's Weak Conceptual Gaps: ${weakConceptsList}
    - Preferred Learning Style: ${blackboard.preferredLearningStyle || "adaptive"}
    
    Prioritize asking questions about the user's actual weak concepts to reinforce long-term memory.`;
  }

  async execute(userId: string, topic: string, targetRole: string): Promise<any[]> {
    const blackboard = await VedaBlackboardMaster.getBlackboardState(userId);
    
    // If no topic is passed, dynamically pull from the Blackboard's weak concept pool!
    const targetTopic = topic || (blackboard.weakConcepts?.[0]) || "Data Structures";
    
    const result = await AIOrchestrator.generateQuiz(targetTopic, targetRole);

    return result;
  }
}

/**
 * 4. InterviewExaminerAgent (Veda - The Elite SDE Interviewer)
 */
export class InterviewExaminerAgent implements ICooperativeAgent {
  name = "InterviewExaminerAgent";
  roleDescription = "Rigorous technical interviewer grading algorithmic tradeoffs.";

  systemPromptFactory(blackboard: any, isOverwhelmed: boolean = false): string {
    const overwhelmDirective = isOverwhelmed
      ? "THE STUDENT IS CURRENTLY ANXIOUS / OVERWHELMED. Initiate 'Confidence-Builder Mode'. Start with easier conceptual questions related to their verified strong concepts before ramping up difficulty."
      : "Conduct a standard, rigorous technical interview (Leetcode Med/Hard + System Design).";

    return `You are Veda, an elite SDE Technical Interviewer. You run professional whiteboard and coding interview rounds.
    
    BLACKBOARD STATE MEMORY:
    - Career Target Roles: ${(blackboard.targetRoles ?? []).join(", ") || "Backend Engineer"}
    - Holistic Interview Readiness: ${blackboard.interviewReadiness ?? 0}%
    - Verified Strong Concepts: ${(blackboard.strongConcepts ?? []).slice(0, 4).join(", ")}
    
    BEHAVIORAL DIRECTIVE:
    ${overwhelmDirective}`;
  }

  async execute(userId: string, prompt: string, taskCategory: string = "interview"): Promise<string> {
    const blackboard = await VedaBlackboardMaster.getBlackboardState(userId);
    const isOverwhelmed = await BehaviorEngine.checkOverwhelmState(userId);
    const systemContext = this.systemPromptFactory(blackboard, isOverwhelmed);
    
    // We append the system context dynamically to the prompt or pass to orchestrator
    // Assuming AIOrchestrator can take systemContext for interviews (if not, prepending it to prompt)
    const result = await AIOrchestrator.generateStructuredResponse(`[SYSTEM CONTEXT: ${systemContext}]\n\n${prompt}`, taskCategory);
    return result;
  }

  async gradeInterviewPerformance(userId: string, score: number, identifiedGaps: string[]): Promise<void> {
    // Report interview results directly to the Blackboard
    await VedaBlackboardMaster.recordAgentFindings(userId, {
      type: score >= 70 ? "INTERVIEW_PASSED" : "INTERVIEW_FAILED",
      source: "company-prep",
      payload: { score, identifiedGaps }
    });
  }
}

/**
 * 5. ResumeAnalystAgent (The ATS Alignment Specialist)
 */
export class ResumeAnalystAgent implements ICooperativeAgent {
  name = "ResumeAnalystAgent";
  roleDescription = "ATS strategy consultant scoring resume-to-job matches and framing achievements.";

  systemPromptFactory(blackboard: any, isOverwhelmed: boolean = false): string {
    const empathicDirective = isOverwhelmed
      ? "THE STUDENT IS CURRENTLY OVERWHELMED. Use 'Sandwich Feedback'—explicitly praise their strong skills and past wins FIRST, before offering any constructive criticism on ATS formatting."
      : "Provide direct, objective, and rigorous ATS feedback.";

    return `You are Veda's Resume Positioning Analyst. You evaluate candidate resumes against target job specs.
    
    BLACKBOARD STATE MEMORY:
    - User Target Roles: ${(blackboard.targetRoles ?? []).join(", ")}
    - Existing ATS Readiness Score: ${blackboard.ATSReadiness ?? 0}%
    
    BEHAVIORAL DIRECTIVE:
    ${empathicDirective}`;
  }

  async execute(userId: string, request: ResumeTailorRequest): Promise<ResumeTailorResult> {
    const blackboard = await VedaBlackboardMaster.getBlackboardState(userId);
    const isOverwhelmed = await BehaviorEngine.checkOverwhelmState(userId);
    const systemContext = this.systemPromptFactory(blackboard, isOverwhelmed);

    const result = await AIOrchestrator.tailorResume(request, systemContext);

    // Save ATS tailoring outcomes to the Blackboard
    await VedaBlackboardMaster.recordAgentFindings(userId, {
      type: "RESUME_UPDATED",
      source: "resume",
      payload: {
        targetRole: request.targetRole,
        atsScore: result.atsIntelligence?.score,
        missingKeywordsCount: result.atsIntelligence?.missingKeywords?.length
      }
    });

    return result;
  }
}

/**
 * 6. NoteIngestionAgent (The Knowledge Graph Custodian)
 */
export class NoteIngestionAgent implements ICooperativeAgent {
  name = "NoteIngestionAgent";
  roleDescription = "Semantic parser indexing study notes and formulating conceptual relationship links.";

  systemPromptFactory(blackboard: any): string {
    return `You are Veda's Knowledge Graph Custodian. You parse raw notes and organize them into structural concepts.
    
    BLACKBOARD STATE MEMORY:
    - Existing Conceptual Nodes: ${(blackboard.knowledgeGraph?.nodes ?? []).map((n: any) => n.label).join(", ") || "None yet"}`;
  }

  async execute(userId: string, title: string, content: string): Promise<any> {
    const blackboard = await VedaBlackboardMaster.getBlackboardState(userId);
    const systemContext = this.systemPromptFactory(blackboard);

    const result = await AIOrchestrator.analyzeNote(title, content, systemContext);

    // Report note indexing details back to the Blackboard
    await VedaBlackboardMaster.recordAgentFindings(userId, {
      type: "NOTE_CREATED",
      source: "notes",
      payload: {
        title,
        conceptCount: result.concepts?.length,
        difficulty: result.difficulty,
        flashcardCount: result.flashcards?.length
      }
    });

    return result;
  }
}

// Export single instantiated Agent Collective for easy import
export const mentorAgent = new MentorAgent();
export const roadmapAgent = new RoadmapSpecialistAgent();
export const quizAgent = new QuizArchitectAgent();
export const interviewAgent = new InterviewExaminerAgent();
export const resumeAgent = new ResumeAnalystAgent();
export const noteAgent = new NoteIngestionAgent();
