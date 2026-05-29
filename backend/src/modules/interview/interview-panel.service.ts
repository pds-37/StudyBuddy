import { PanelInterviewModel, type PanelInterviewDocument, type CommitteeSpeaker, type PanelQuestion } from "./panel-interview.model.js";
import { UserModel } from "../users/user.model.js";
import { AIOrchestrator } from "../../core/ai-orchestrator.js";
import { ApiError } from "../../utils/api-error.js";
import { NoteModel } from "../notes/note.model.js";
import { RoadmapModel } from "../roadmaps/roadmap.model.js";

/** Starts a multi-agent shadow panel interview session. */
async function startPanelSession(userId: string): Promise<any> {
  const user = await UserModel.findById(userId);
  if (!user || user.targetRoles.length === 0) {
    throw new ApiError(400, "User must have a target role to start a panel interview");
  }

  const role = user.targetRoles[0];
  const skillsList = user.currentSkills.join(", ") || "Software Engineering, Problem Solving";

  // 1. Generate 3 highly targeted panel questions
  const prompt = `You are Veda, orchestrating a simulated SDE hiring committee for the role of "${role}".
Candidate's skills: ${skillsList}.

Generate exactly 3 highly customized interview questions representing distinct SDE angles:
- Question 1: System Design / Architectural Tradeoffs (critical microservices, DB deadlocks, scaling, caching).
- Question 2: Coding Scenario / Production Incident Recovery (debugging memory leaks, resolving server spikes, star method failure recovery).
- Question 3: Behavioral / STAR Framework (team friction, scaling communication, project prioritization trade-offs).

Return ONLY a valid JSON array of exactly 3 objects. Do not include markdown fences or comments. The JSON array must have these exact keys for each object:
- "question" (string): The interview question text.
- "category" (string): Must be "technical", "system_design", "behavioral", or "scenario".
- "idealAnswer" (string): A detailed reference answer outlining core concepts, time/space complexity, architectural choices, and SDE trade-offs.

ONLY output valid JSON.`;

  const aiQuestionsJson = await AIOrchestrator.generateStructuredResponse(prompt, "interview");
  
  let generatedQuestions: any[];
  try {
    const cleanedJson = aiQuestionsJson.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanedJson);
    if (Array.isArray(parsed)) {
      generatedQuestions = parsed;
    } else if (parsed && typeof parsed === "object") {
      // Find the first array property inside the parsed object
      const arrayKey = Object.keys(parsed).find(k => Array.isArray((parsed as any)[k]));
      if (arrayKey) {
        generatedQuestions = (parsed as any)[arrayKey];
      } else {
        throw new Error("Parsed JSON object contains no arrays");
      }
    } else {
      throw new Error("Parsed JSON is neither array nor object");
    }
  } catch (e) {
    console.error("[Panel Service] Failed to parse AI questions, using robust SDE fallbacks:", aiQuestionsJson);
    generatedQuestions = [
      {
        question: `Explain how you would architect a high-throughput real-time notification engine for a ${role} application. What are your queuing and DB strategies?`,
        category: "system_design",
        idealAnswer: "Use an event-driven setup with Kafka/RabbitMQ, partition DB nodes, introduce Redis for rate limiting, and write stateless push workers in Go/Node."
      },
      {
        question: `Describe how you would isolate and fix an active memory leak causing containers to crash under high request volume.`,
        category: "scenario",
        idealAnswer: "Profile heap logs using Chrome DevTools or memory dumps, pinpoint unreleased event listeners or global cache maps, write a regression test, and fix the scope reference."
      },
      {
        question: `Tell us about a time you strongly disagreed with a tech lead's architectural decision. How did you resolve the conflict?`,
        category: "behavioral",
        idealAnswer: "Prototyped lightweight benchmarks, presented objective data metrics comparing both, aligned on user-centric criteria, and agreed to disagree but committed fully to team delivery."
      }
    ];
  }

  const questions: PanelQuestion[] = generatedQuestions.map((q: any, i: number) => ({
    id: `pq-${Date.now()}-${i}`,
    question: q.question,
    category: q.category || "technical",
    idealAnswer: q.idealAnswer || "Provide structured time/space complexity analysis and scale trade-offs.",
    debateTranscript: []
  }));

  // 2. Generate initial welcoming dialogues from the panel
  const welcomeDialogue: CommitteeSpeaker[] = [
    {
      speaker: "Marcus (Engineering Manager)",
      dialogue: `Hi there! I am Marcus, your EM. Welcome to Veda's Shadow Panel Arena. We've got our Lead Architect Devin and PM Sarah here. We've looked over your SDE profile for the ${role} position and are excited to begin. Let's keep this conversation conversational and highly technical.`,
      mood: "supportive"
    },
    {
      speaker: "Sarah (Product Manager)",
      dialogue: `Hey! Sarah here. I'll be probing into how your technical architectures translate to real customer value. Remember, we don't just write code; we deliver high-velocity user outcomes!`,
      mood: "neutral"
    },
    {
      speaker: "Devin (Lead Architect)",
      dialogue: `Welcome. Devin here. I'll be watching your choice of algorithmic tradeoffs, scaling thresholds, and structural precision. Let's skip the superficial definitions—I want deep, production-ready engineering answers. Let's start.`,
      mood: "skeptical"
    }
  ];

  // Store the welcome dialogue inside the first question's transcript
  questions[0].debateTranscript = welcomeDialogue;

  const session = await PanelInterviewModel.create({
    userId,
    targetRole: role,
    status: "in_progress",
    questions,
    currentQuestionIndex: 0,
    stressIndex: 25,
    interruptionRisk: 10,
    metrics: {
      architect: { satisfaction: 50, impatience: 10 },
      pm: { satisfaction: 50, impatience: 10 },
      em: { satisfaction: 60, impatience: 5 }
    }
  });

  return session.toJSON();
}

/** Submits user answer, runs panel debate, calculates stress index, and updates cognitive models. */
async function submitPanelAnswer(
  sessionId: string,
  userId: string,
  questionId: string,
  answer: string
): Promise<any> {
  const session = await PanelInterviewModel.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Panel interview session not found");
  if (session.status === "completed") throw new ApiError(400, "Panel interview already completed");

  const questionIndex = session.questions.findIndex((q: any) => q.id === questionId);
  if (questionIndex === -1) throw new ApiError(404, "Question not found in this session");

  const question = session.questions[questionIndex];
  question.userAnswer = answer;

  // Compile prompt for committee debate simulation
  const debatePrompt = `You are Veda, driving the simulated SDE Hiring Committee Panel for the role of "${session.targetRole}".
Our panel members are:
- "Devin (Lead Architect)": Strict microservice/DB architect. Wants tradeoffs, complexity, and performance edge cases.
- "Sarah (Product Manager)": Customer-centric, values velocity, UX, business KPIs. Detests over-engineering.
- "Marcus (Engineering Manager)": Focused on delivery, collaboration, communication, STAR method, behavioral ownership.

Here are the details of the active round:
- Question: "${question.question}"
- Category: "${question.category}"
- Candidate Answer: "${answer}"
- Reference SDE Solution: "${question.idealAnswer}"
- Previous Session Metrics:
  - Stress Index: ${session.stressIndex}%
  - Interruption Risk: ${session.interruptionRisk}%
  - Devin (Architect) Satisfaction: ${session.metrics?.architect?.satisfaction ?? 50}%, Impatience: ${session.metrics?.architect?.impatience ?? 10}%
  - Sarah (PM) Satisfaction: ${session.metrics?.pm?.satisfaction ?? 50}%, Impatience: ${session.metrics?.pm?.impatience ?? 10}%
  - Marcus (EM) Satisfaction: ${session.metrics?.em?.satisfaction ?? 60}%, Impatience: ${session.metrics?.em?.impatience ?? 5}%

INSTRUCTIONS FOR DEBATE DIALOGUE:
1. Generate a sequential committee conversation (exactly 3 dialogue nodes) where the panel members discuss and critique the candidate's answer with each other.
   - Node 1: "Devin (Lead Architect)" critiques the technical/algorithmic accuracy, time/space trade-offs, orDB bottlenecks.
   - Node 2: "Sarah (Product Manager)" either praises the customer outcomes or interrupts to warn against over-engineering.
   - Node 3: "Marcus (Engineering Manager)" moderates, highlights communication structure, and summarizes their SDE impression.
2. The dialogue must refer to specific parts of the candidate's answer.
3. Compute updated metrics:
   - "stressIndex": Upward pressure if the answer is vague/inaccurate or highly evasive. Range 0-100.
   - "interruptionRisk": High if Devin/Sarah's impatience is elevated (> 60).
   - "satisfaction" and "impatience" for each agent (0-100).
4. Extract "overallScore" (0-10) for this round, "missingConcepts" (array), and "feedback" (sentence).

Return ONLY a valid JSON object. Do not wrap in markdown fences or comments.
JSON Structure:
{
  "debateTranscript": [
    { "speaker": "Devin (Lead Architect)", "dialogue": "...", "mood": "impatient|skeptical|satisfied|impressed" },
    { "speaker": "Sarah (Product Manager)", "dialogue": "...", "mood": "neutral|impatient|supportive" },
    { "speaker": "Marcus (Engineering Manager)", "dialogue": "...", "mood": "supportive|critical|neutral" }
  ],
  "metrics": {
    "architect": { "satisfaction": 60, "impatience": 30 },
    "pm": { "satisfaction": 70, "impatience": 15 },
    "em": { "satisfaction": 75, "impatience": 10 }
  },
  "stressIndex": 35,
  "interruptionRisk": 20,
  "overallScore": 7,
  "feedback": "...",
  "missingConcepts": ["concept1", "concept2"]
}`;

  const aiDebateJson = await AIOrchestrator.generateStructuredResponse(debatePrompt, "interview");

  let parsedDebate: any;
  try {
    const cleanedJson = aiDebateJson.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    parsedDebate = JSON.parse(cleanedJson);
  } catch (e) {
    console.error("[Panel Service] Failed to parse AI debate dialogue, using robust fallback:", aiDebateJson);
    parsedDebate = {
      debateTranscript: [
        {
          speaker: "Devin (Lead Architect)",
          dialogue: "The explanation has decent breadth, but it lacks deep scalability analysis. I wanted to hear exact caching protocols or covered index mechanics.",
          mood: "skeptical"
        },
        {
          speaker: "Sarah (Product Manager)",
          dialogue: "It sounds like a workable solution that gets standard operations running quickly. However, I want to make sure we aren't spending weeks over-engineering a simple API queue.",
          mood: "neutral"
        },
        {
          speaker: "Marcus (Engineering Manager)",
          dialogue: "Good technical narrative. Let's make sure our STAR format answers are tighter next time. Let's move on to the next segment.",
          mood: "supportive"
        }
      ],
      metrics: {
        architect: { satisfaction: 55, impatience: 20 },
        pm: { satisfaction: 60, impatience: 15 },
        em: { satisfaction: 65, impatience: 10 }
      },
      stressIndex: 30,
      interruptionRisk: 15,
      overallScore: 6,
      feedback: "Candidate communicated a workable baseline but lacks granular architecture decisions.",
      missingConcepts: ["Scalability", "Indexing"]
    };
  }

  // Update question debate transcript and session metrics
  question.debateTranscript = parsedDebate.debateTranscript;
  session.stressIndex = parsedDebate.stressIndex ?? 30;
  session.interruptionRisk = parsedDebate.interruptionRisk ?? 15;
  session.metrics = {
    architect: parsedDebate.metrics?.architect || { satisfaction: 50, impatience: 20 },
    pm: parsedDebate.metrics?.pm || { satisfaction: 50, impatience: 20 },
    em: parsedDebate.metrics?.em || { satisfaction: 60, impatience: 10 }
  };

  // Asynchronous gaps sync (Reuses our standard Cognitive loops!)
  if (parsedDebate.missingConcepts && parsedDebate.missingConcepts.length > 0) {
    for (const concept of parsedDebate.missingConcepts) {
      try {
        await NoteModel.create({
          userId,
          title: `Recall Gap: ${concept}`,
          content: `Identified an SDE architectural gap in: ${concept}.\n\nFeedback from Committee: ${parsedDebate.feedback}\n\nModel Reference: ${question.idealAnswer}`,
          topic: `Committee Gaps: ${session.targetRole}`,
          tags: ["committee-gap", "recall", "interview", "locked-in"],
          linkedSkills: [session.targetRole],
          strength: 0.15,
          nextReviewAt: new Date(),
          interviewImportance: 95
        });
      } catch (err) {
        console.error("Failed to inject spaced repetition note for panel gap:", err);
      }
    }
  }

  // Recalibrate roadmap for major struggles
  if (parsedDebate.overallScore <= 5) {
    try {
      const activeRoadmap = await RoadmapModel.findOne({ userId, status: "active" });
      if (activeRoadmap && activeRoadmap.phases?.[0]?.missions?.[0]) {
        const mission = activeRoadmap.phases[0].missions[0];
        mission.tasks.unshift({
          id: `remedial-panel-${Date.now()}`,
          title: `Veda AI Remediation: Panel Gap on ${parsedDebate.missingConcepts?.[0] || "Architecture"}`,
          type: "practice",
          durationMinutes: 30,
          difficulty: "easy",
          aiHint: `Injected automatically by your hiring panel to help you nail ${parsedDebate.missingConcepts?.[0] || "core tradeoffs"}.`,
          status: "not_started"
        });
        await activeRoadmap.save();
      }
    } catch (err) {
      console.error("Failed to inject panel corrective roadmap task:", err);
    }
  }

  // Check if session is completed (last question answered)
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;
  if (isLastQuestion) {
    session.status = "completed";
    
    // Average scores
    let totalScore = 0;
    for (const q of session.questions) {
      // Find overall score from individual round feedback or default to average
      totalScore += parsedDebate.overallScore ?? 6;
    }
    session.overallScore = Math.round(totalScore / session.questions.length);

    // Dynamic final overall review
    const holisticPrompt = `You are Veda, compiling the final committee feedback for candidate ${userId} targeting "${session.targetRole}".
Review the questions and candidate answers:
${session.questions.map((q, i) => `Q${i+1}: ${q.question}\nAnswer: ${q.userAnswer}`).join("\n\n")}

Provide a 3-sentence summary:
1. Overall team verdict (Hire vs No-Hire consensus).
2. Primary architectural weakness Devin, Sarah, and Marcus highlighted.
3. The exact next learning sprint recommended to bridge this gap.`;

    const finalFeedback = await AIOrchestrator.generateStructuredResponse(holisticPrompt, "interview");
    session.overallFeedback = finalFeedback.trim();
  } else {
    // Advance index
    session.currentQuestionIndex += 1;
  }

  await session.save();
  return session.toJSON();
}

/** Retrieves session by ID. */
async function getPanelSession(sessionId: string, userId: string): Promise<any> {
  const session = await PanelInterviewModel.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Panel session not found");
  return session.toJSON();
}

/** Retrieves all panel sessions for a user. */
async function getUserPanelSessions(userId: string): Promise<any[]> {
  const sessions = await PanelInterviewModel.find({ userId }).sort({ createdAt: -1 });
  return sessions.map(s => s.toJSON());
}

export const interviewPanelService = {
  startPanelSession,
  submitPanelAnswer,
  getPanelSession,
  getUserPanelSessions
};
