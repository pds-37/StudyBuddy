import { InterviewModel, type InterviewDocument } from "./interview.model.js";
import { UserModel } from "../users/user.model.js";
import { NoteModel } from "../notes/note.model.js";
import { RoadmapModel } from "../roadmaps/roadmap.model.js";
import { groqService } from "../../services/ai/groq.service.js";
import { ApiError } from "../../utils/api-error.js";
import type { InterviewSession, InterviewQuestion, InterviewScore } from "@studybuddy/shared";

function toSession(doc: InterviewDocument): InterviewSession {
  return doc.toJSON() as unknown as InterviewSession;
}

/** Computes adaptive level from student portfolio details if not selected. */
async function detectAdaptiveLevel(userId: string, targetRole: string): Promise<"beginner" | "intermediate" | "advanced"> {
  try {
    const [user, notesCount] = await Promise.all([
      UserModel.findById(userId),
      NoteModel.countDocuments({ userId, deleted: { $ne: true } })
    ]);

    if (!user) return "intermediate";

    // Combine manual settings, notes volume, and skills
    if (user.experienceLevel === "advanced" || notesCount > 40 || user.currentSkills.length > 12) {
      return "advanced";
    }

    if (user.experienceLevel === "beginner" || (notesCount < 5 && user.currentSkills.length < 4)) {
      return "beginner";
    }

    return "intermediate";
  } catch (error) {
    return "intermediate";
  }
}

interface StartSessionOptions {
  mode?: "technical" | "scenario" | "behavioral" | "company" | "mock";
  difficulty?: "beginner" | "intermediate" | "advanced" | "adaptive";
  interviewerPersonality?: "friendly" | "strict" | "founder" | "architect" | "recruiter";
  pressureMode?: boolean;
  timeLimitMinutes?: number;
  targetCompany?: string;
}

/** Starts a next-generation SDE mock interview session. */
async function startSession(userId: string, options: StartSessionOptions = {}): Promise<InterviewSession> {
  const user = await UserModel.findById(userId);
  if (!user || user.targetRoles.length === 0) {
    throw new ApiError(400, "User must have a target role to start an interview");
  }

  const role = user.targetRoles[0];

  // Resolve options & adaptive parameters
  const mode = options.mode || "technical";
  const rawDiff = options.difficulty || "intermediate";
  const difficulty = rawDiff === "adaptive" 
    ? await detectAdaptiveLevel(userId, role) 
    : rawDiff;

  const interviewerPersonality = options.interviewerPersonality || "friendly";
  const pressureMode = options.pressureMode || false;
  const targetCompany = options.targetCompany || "";
  
  // Default timer based on question types (10m default for SDE scenario/debugging)
  const timeLimitMinutes = options.timeLimitMinutes || (pressureMode ? 10 : 0);

  // Generate highly personalized questions based on mode, target company, and options
  const questionsPrompt = `You are Veda, an elite SDE Technical Recruiter and Engineering Mentor.
Generate exactly 3 highly customized interview questions for a candidate targeting the role of "${role}".
Candidate's Current Skills: ${user.currentSkills.join(", ")}.
Selected Options:
- Mode: ${mode} (technical, scenario-based, behavioral, company-prep, or mock interview)
- Difficulty: ${difficulty} (beginner, intermediate, advanced)
- Interviewer Personality: ${interviewerPersonality} (friendly mentor, strict FAANG, startup founder, tech architect, or recruiter)
- Target Company: ${targetCompany || "General Tech Company"}

OBJECTIVES FOR MODES:
1. "scenario": Generate high-value, real-world production incidents, scaling disasters, cache spikes, DB deadlocks, or frontend memory leaks. Test engineering reasoning and debugging method, NOT memorized answers.
2. "technical": Deep algorithms, data structure operations, framework internals, system architecture tradeoffs.
3. "behavioral": Culture fit, pressure handling, team disputes, and STAR framework probes.
4. "company": Mimic the specific interview styles of ${targetCompany || "major tech firms (e.g. Amazon leadership, Google complexity, Stripe code cleanliness)"}.
5. "mock": Formulate progressive rounds of an SDE interview.

Return ONLY a valid JSON array of exactly 3 objects. Do not include markdown fences or comments. The JSON array must have these exact keys for each object:
- "question" (string): The interview question text.
- "category" (string): Must be "technical", "scenario", "behavioral", "system_design", or "general".
- "hint" (string): An encouraging SDE hint tailored to the interviewer's personality.
- "idealAnswer" (string): An extensive, interview-ready model answer summarizing key concepts, structures, and tradeoffs for comparison.

ONLY output valid JSON.`;

  const aiQuestionsJson = await groqService.generateStructuredResponse(questionsPrompt);
  
  let generatedQuestions;
  try {
    const cleanedJson = aiQuestionsJson.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    generatedQuestions = JSON.parse(cleanedJson);
  } catch (e) {
    console.error("Failed to parse SDE questions from AI, fallback active:", aiQuestionsJson);
    generatedQuestions = [
      { 
        question: `Explain how you would debug and optimize a slow query in a production relational database relevant to a ${role}.`, 
        category: "technical",
        hint: "Think about explain plans, indexing structures, and caching strategies.",
        idealAnswer: "Identify query performance using EXPLAIN, analyze indexes, introduce covered indexes, partition large tables, or implement a caching layer like Redis."
      },
      { 
        question: `Describe a production failure or database crash you faced in your projects, and how you recovered the application.`, 
        category: "scenario",
        hint: "Outline the Situation, Task, Action, and ultimate SDE Result (STAR format).",
        idealAnswer: "State the incident (Situation), outline the recovery mission (Task), details on logs/caching adjustments (Action), and list metrics like MTTR or latency drops (Result)."
      },
      { 
        question: `If your SDE team conflicts over choosing a framework (e.g. Next.js vs SPA), how would you structure the decision?`, 
        category: "behavioral",
        hint: "Focus on metrics, objective SDE prototypes, team cohesion, and customer impact.",
        idealAnswer: "Build miniature SDE prototypes, compile objective pros/cons grids, align on core customer goals, and support a unified team decision."
      }
    ];
  }

  const questions: InterviewQuestion[] = generatedQuestions.map((q: any, i: number) => ({
    id: `q-${Date.now()}-${i}`,
    question: q.question,
    category: q.category || "technical",
    hint: q.hint || "Analyze algorithmic requirements, performance tradeoffs, and SDE edge cases.",
    idealAnswer: q.idealAnswer || "Provide a clean structural explanation, time/space complexity, and deployment details.",
    isFlagged: false
  }));

  const session = await InterviewModel.create({
    userId,
    targetRole: role,
    status: "in_progress",
    questions,
    mode,
    difficulty,
    interviewerPersonality,
    pressureMode,
    timeLimitMinutes,
    targetCompany
  });

  return toSession(session);
}

/** Gets a session by ID. */
async function getSession(sessionId: string, userId: string): Promise<InterviewSession> {
  const session = await InterviewModel.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Interview session not found");
  return toSession(session);
}

/** Gets all sessions for a user. */
async function getUserSessions(userId: string): Promise<InterviewSession[]> {
  const sessions = await InterviewModel.find({ userId }).sort({ createdAt: -1 });
  return sessions.map(toSession);
}

/** Toggle question flagged state. */
async function toggleFlag(sessionId: string, userId: string, questionId: string): Promise<InterviewSession> {
  const session = await InterviewModel.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Session not found");
  
  const question = session.questions.find((q: any) => q.id === questionId);
  if (!question) throw new ApiError(404, "Question not found");

  question.isFlagged = !question.isFlagged;
  await session.save();
  return toSession(session);
}

/** Retrieve hint for a question. */
async function getHint(sessionId: string, userId: string, questionId: string): Promise<string> {
  const session = await InterviewModel.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Session not found");
  
  const question = session.questions.find((q: any) => q.id === questionId);
  if (!question) throw new ApiError(404, "Question not found");

  return question.hint || "Consider performance benchmarks, language specifications, and structural tradeoffs.";
}

/** Saves draft answers for active writing autosave. */
async function saveDraft(sessionId: string, userId: string, questionId: string, draftAnswer: string): Promise<InterviewSession> {
  const session = await InterviewModel.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Session not found");

  const question = session.questions.find((q: any) => q.id === questionId);
  if (!question) throw new ApiError(404, "Question not found");

  question.draftAnswer = draftAnswer;
  await session.save();
  return toSession(session);
}

/** Skips a question and inserts a default low score to proceed. */
async function skipQuestion(sessionId: string, userId: string, questionId: string): Promise<InterviewSession> {
  return await submitAnswer(sessionId, userId, questionId, "Skipped", true);
}

/** Submits an answer, evaluates with Llama 3, and updates deep cognitive integration targets. */
async function submitAnswer(
  sessionId: string, 
  userId: string, 
  questionId: string, 
  answer: string,
  isSkipped = false
): Promise<InterviewSession> {
  const session = await InterviewModel.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Interview session not found");
  if (session.status === "completed") throw new ApiError(400, "Interview already completed");

  const question = session.questions.find((q: any) => q.id === questionId);
  if (!question) throw new ApiError(404, "Question not found in this session");

  question.userAnswer = answer;
  question.draftAnswer = ""; // Clear draft

  let score: InterviewScore;

  if (isSkipped) {
    score = {
      technicalAccuracy: 0,
      clarity: 0,
      scalabilityThinking: 0,
      debuggingApproach: 0,
      communication: 0,
      optimizationAwareness: 0,
      confidence: 0,
      relevance: 0,
      starMethod: 0,
      overall: 0,
      feedback: "Candidate skipped this question."
    };
    question.score = score;
    question.missingConcepts = ["Skipped Area"];
  } else {
    // Invoke high-fidelity LLM evaluator
    const scorePrompt = `You are Veda, an expert technical evaluator assessing SDE candidate answers.
Role Target: ${session.targetRole}
Interview Mode: ${session.mode}
Difficulty: ${session.difficulty}
Interviewer Personality Profile: ${session.interviewerPersonality}

Question: "${question.question}"
Candidate Answer: "${answer}"
Model Ideal SDE Reference Answer: "${question.idealAnswer || "Explain technical concepts clearly with complexity analysis."}"

Deeply analyze this candidate response. Rate strictly and constructively. Output scores out of 100.
Evaluate exactly these categories:
1. "technicalAccuracy" (0-100): Code correctness, algorithmic precision.
2. "clarity" (0-100): Structural layout, logical flow.
3. "scalabilityThinking" (0-100): Distributed systems, scaling structures, large data limits.
4. "debuggingApproach" (0-100): Error tracing, boundary conditions.
5. "communication" (0-100): Professional narration, brevity.
6. "optimizationAwareness" (0-100): Time/Space complexity, caching, execution profiling.
7. "confidence" (0-100): Tradeoff ownership, clear assertions.

Also provide:
- "overall" (number 0-10): Total SDE performance grade.
- "feedback" (string): 2-3 sentences of core recruiter feedback.
- "missingConcepts" (array of strings): Specific SDE keywords or technologies the candidate missed.
- "scalabilityGaps" (array of strings): Gaps in scale/throughput.
- "communicationTips" (array of strings): Actionable presentation tips.

Return ONLY a valid JSON object. Do not wrap in markdown fences or comments.
Shape: { "technicalAccuracy": 80, "clarity": 75, "scalabilityThinking": 60, "debuggingApproach": 70, "communication": 85, "optimizationAwareness": 65, "confidence": 75, "overall": 7, "feedback": "...", "missingConcepts": ["..."], "scalabilityGaps": ["..."], "communicationTips": ["..."] }`;

    const aiScoreJson = await groqService.generateStructuredResponse(scorePrompt);
    
    try {
      const cleanedScoreJson = aiScoreJson.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanedScoreJson);
      
      score = {
        technicalAccuracy: parsed.technicalAccuracy ?? 50,
        clarity: parsed.clarity ?? 50,
        scalabilityThinking: parsed.scalabilityThinking ?? 50,
        debuggingApproach: parsed.debuggingApproach ?? 50,
        communication: parsed.communication ?? 50,
        optimizationAwareness: parsed.optimizationAwareness ?? 50,
        confidence: parsed.confidence ?? 50,
        relevance: parsed.clarity ?? 50,
        starMethod: parsed.technicalAccuracy ?? 50,
        overall: parsed.overall ?? 5,
        feedback: parsed.feedback || "Good SDE effort."
      };
      
      question.score = score;
      question.missingConcepts = parsed.missingConcepts || [];
      question.scalabilityGaps = parsed.scalabilityGaps || [];
      question.communicationTips = parsed.communicationTips || [];
    } catch (e) {
      console.error("Failed to parse Llama 3 scoring feedback:", aiScoreJson);
      score = {
        technicalAccuracy: 60,
        clarity: 60,
        scalabilityThinking: 50,
        debuggingApproach: 60,
        communication: 70,
        optimizationAwareness: 50,
        confidence: 65,
        overall: 6,
        feedback: "Satisfactory attempt. Review time complexity metrics."
      };
      question.score = score;
      question.missingConcepts = ["Time Complexity", "Scalability"];
    }
  }

  // ==========================================
  // DEEP ACTIVE INTEGRATIONS (THE SYSTEM LOOP)
  // ==========================================

  // 1. RECALL SPACED REPETITION AUTOMATIC INJECTION
  if (question.missingConcepts && question.missingConcepts.length > 0) {
    for (const concept of question.missingConcepts) {
      try {
        const descriptionText = `This card was automatically generated by Veda AI after identifying an interview performance gap in topic "${concept}" during your SDE mock sessions.\n\nEvaluation Feedback: ${score.feedback}\n\nModel SDE Solution Reference: ${question.idealAnswer}`;
        
        // Schedule next review based on user decisions (Day 1, 3, 7, 14 pacing)
        // NoteModel will index this, making it immediately due and prioritised!
        await NoteModel.create({
          userId,
          title: `Recall Gap: ${concept}`,
          content: descriptionText,
          topic: `${session.targetRole} Interview Gaps`,
          tags: ["interview-gap", "recall", session.mode, "locked-in"],
          linkedSkills: [session.targetRole],
          difficulty: session.difficulty,
          revisionStrategy: "conceptual",
          strength: 0.1, // starts extremely weak to trigger prompt urgency
          nextReviewAt: new Date(), // due now
          interviewImportance: 90, // ensures priority ranking triggers
          metadata: {
            interviewRelevance: {
              importance: 95,
              commonQuestions: [
                `Define the core mechanics of ${concept} in modern software engineering.`,
                `How would you explain ${concept} tradeoffs under high throughput SDE setups?`
              ],
              realWorldUsage: [
                `Crucial during SDE ${session.targetRole} architectural assessments.`
              ]
            }
          }
        });
      } catch (recallError) {
        console.error("Failed to automatically inject Recall Spaced Repetition note:", recallError);
      }
    }
  }

  // 2. SKILL GAP / CAREER PROFILE INTELLIGENCE RECALIBRATION
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      // Moving average update for interview readiness
      const prevReadiness = user.careerProfile.readiness.interview || 0;
      const targetReadiness = score.overall * 10;
      user.careerProfile.readiness.interview = Math.round((prevReadiness * 3 + targetReadiness) / 4);

      // Psychological Confidence evaluation
      const prevConfidence = user.psychologicalProfile.confidence.interview || 50;
      const delta = score.overall >= 8 ? 4 : score.overall <= 4 ? -3 : 0;
      user.psychologicalProfile.confidence.interview = Math.max(10, Math.min(100, prevConfidence + delta));

      await user.save();
    }
  } catch (userError) {
    console.error("Failed to recalibrate candidate diagnostics:", userError);
  }

  // 3. CORRECTIVE ROADMAP NODE INTEGRATION
  if (score.overall <= 5) {
    try {
      const activeRoadmap = await RoadmapModel.findOne({ userId, status: "active" });
      if (activeRoadmap && activeRoadmap.phases && activeRoadmap.phases.length > 0) {
        const currentPhase = activeRoadmap.phases[0]; // focus on the initial active phase
        if (currentPhase.missions && currentPhase.missions.length > 0) {
          const activeMission = currentPhase.missions[0];
          
          // Generate a custom remedial task for the SDE gap
          const remediationTask = {
            id: `remedial-${Date.now()}`,
            title: `Veda AI Remediation: Revise ${question.missingConcepts?.[0] || "Placement Fundamentals"}`,
            type: "practice" as const,
            durationMinutes: 45,
            difficulty: "easy" as const,
            aiHint: `Automatically injected task based on your interview struggle with ${question.missingConcepts?.[0] || "core tradeoffs"}.`,
            status: "not_started"
          };

          // Prepend as top daily focus win
          activeMission.tasks.unshift(remediationTask);
          await activeRoadmap.save();
        }
      }
    } catch (roadmapError) {
      console.error("Failed to inject corrective SDE roadmap node:", roadmapError);
    }
  }

  // Check if all questions are completed in this round
  const allAnswered = session.questions.every((q: any) => q.userAnswer);
  if (allAnswered) {
    session.status = "completed";
    
    // Average scores
    let totalScore = 0;
    for (const q of session.questions) {
      if (q.score) {
        totalScore += q.score.overall;
      }
    }
    
    session.overallScore = Math.round(totalScore / session.questions.length);
    session.overallFeedback = await generateOverallFeedback(session.targetRole, session.questions);
  }

  await session.save();
  return toSession(session);
}

/** Generates dynamic holistic recruiter reviews at session completion. */
async function generateOverallFeedback(targetRole: string, questions: any[]): Promise<string> {
  const prompt = `You are Veda, an SDE Recruiter compiling a final review for a ${targetRole} candidate.
Review the following questions, candidate answers, and individual grades:

${questions.map((q, i) => `Q${i+1}: ${q.question}\nUser Answer: ${q.userAnswer}\nScore: ${q.score?.overall}/10\nEvaluation: ${q.score?.feedback}`).join("\n\n")}

Provide exactly a 3-sentence high-value engineering review summarizing:
1. Core technical strengths shown (SDE logic, communication).
2. Architectural or debugging gaps that will trigger rejections.
3. The exact roadmap recovery vector they must execute.

ONLY output plain text, no markup fences.`;
  
  const feedback = await groqService.generateStructuredResponse(prompt);
  return feedback.trim().replace(/^```text\s*/i, "").replace(/```$/, "").trim();
}

export const interviewService = {
  startSession,
  getSession,
  getUserSessions,
  toggleFlag,
  getHint,
  saveDraft,
  skipQuestion,
  submitAnswer
};
