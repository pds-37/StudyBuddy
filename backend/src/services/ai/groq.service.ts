import axios from "axios";
import { env } from "../../config/env.js";
import type { CopilotMessage, ResumeTailorRequest, ResumeTailorResult } from "@studybuddy/shared";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Sends a chat-completions request to Groq's OpenAI-compatible API. */
async function requestGroq(messages: GroqMessage[], maxTokens: number, model: string = "llama-3.1-8b-instant") {
  if (!env.groqApiKey) {
    throw new Error("Groq API key is not configured.");
  }

  const response = await axios.post<GroqChatResponse>(
    GROQ_CHAT_COMPLETIONS_URL,
    {
      model,
      temperature: 0.7,
      max_tokens: maxTokens,
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${env.groqApiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    }
  );

  const content = response.data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("No response from Groq API");
  }

  return content;
}

/** Extracts a raw JSON block even when the model wraps it in markdown fences or commentary. */
function extractJsonPayload(content: string) {
  // First attempt: Markdown blocks
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  // Second attempt: Find the outer-most structural markers
  const firstBrace = content.indexOf('{');
  const firstBracket = content.indexOf('[');
  const lastBrace = content.lastIndexOf('}');
  const lastBracket = content.lastIndexOf(']');

  // We want the start to be the earliest of { or [
  let start = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    start = Math.min(firstBrace, firstBracket);
  } else {
    start = firstBrace !== -1 ? firstBrace : firstBracket;
  }

  // We want the end to be the latest of } or ]
  let end = -1;
  if (lastBrace !== -1 && lastBracket !== -1) {
    end = Math.max(lastBrace, lastBracket);
  } else {
    end = lastBrace !== -1 ? lastBrace : lastBracket;
  }

  if (start !== -1 && end !== -1 && end > start) {
    return content.slice(start, end + 1).trim();
  }

  return content.trim();
}

/** Generates a personalized career roadmap using Groq Llama3. */
async function generateRoadmap(
  targetRole: string,
  timelineWeeks: number,
  skillGaps: Array<{ skill: string; gapScore: number }>,
  userNotes?: string,
  behaviorProfile?: any,
  learningStyle?: string
): Promise<{
  title: string;
  readinessScore: number;
  consistencyScore: number;
  currentPhaseId: string;
  nextMilestone: string;
  phases: any[];
  insights: any[];
}> {
  const skillGapsText = skillGaps
    .sort((a, b) => b.gapScore - a.gapScore)
    .slice(0, 10)
    .map(gap => `- ${gap.skill} (gap: ${gap.gapScore}%)`)
    .join("\n");

  const notesContext = userNotes ? `\n\nUser's learning notes and context:\n${userNotes}` : "";

  const prompt = `You are Veda, an advanced AI Mentor. Your task is to generate a highly adaptive "Career Learning Mission" for a student targeting the role of "${targetRole}".

CONTEXT:
- Target Role: ${targetRole}
- Timeline: ${timelineWeeks} weeks
- Skill Gaps:
${skillGapsText}${notesContext}
${behaviorProfile ? `- Consistency Score: ${behaviorProfile.consistencyScore}%
- Skip Rate: ${behaviorProfile.skipRate}%
- Learning Style: ${learningStyle || "Adaptive"}` : ""}

PHILOSOPHY:
Do NOT generate a static roadmap. Generate a living execution engine.
- Divide the journey into 4-6 Strategic Phases.
- Each phase must contain Weekly Missions.
- Each mission must contain Daily Execution Tasks (highly actionable).
- Integrate "Memory + Recall" tasks automatically.

RESPONSE STRUCTURE (JSON):
{
  "title": "A cinematic mission title",
  "readinessScore": 15, // initial estimation 0-100
  "consistencyScore": ${behaviorProfile?.consistencyScore || 50},
  "currentPhaseId": "phase-1",
  "nextMilestone": "Short title of the first major checkpoint",
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase Title (e.g., Foundations)",
      "description": "Strategic overview",
      "status": "unlocked",
      "estimatedWeeks": 4,
      "difficulty": "beginner",
      "checkpoints": ["Milestone 1", "Milestone 2"],
      "missions": [
        {
          "id": "mission-w1",
          "weekNumber": 1,
          "title": "Weekly Mission Title",
          "description": "What we achieve this week",
          "whyItMatters": "Contextual importance",
          "outcome": "Measurable result",
          "commonMistakes": ["Mistake 1"],
          "status": "not_started",
          "tasks": [
            {
              "id": "t1",
              "title": "Actionable daily task (e.g., Implement BFS)",
              "type": "learn", // learn | practice | revise | project
              "durationMinutes": 90,
              "difficulty": "easy", // easy | medium | hard
              "aiHint": "Mentor tip for this specific task"
            }
          ]
        }
      ]
    }
  ],
  "insights": [
    {
      "type": "behavior", // behavior | performance | recommendation
      "message": "AI-driven personal insight (e.g., 'You perform better with visual content.')",
      "actionLabel": "Quick Action",
      "actionUrl": "/dashboard"
    }
  ]
}

RULES:
1. Ensure tasks are granular. Instead of "Learn React", use "Implement a counter with useState".
2. Mix task types: 40% Learn, 40% Practice, 20% Revise.
3. Be behavior-aware: ${behaviorProfile?.consistencyScore < 40 ? "User struggles with consistency. Keep tasks under 45 mins and add more 'Revision' to build confidence." : "User is high-performing. Make tasks 90-120 mins and project-heavy."}
4. Use cinematic, encouraging language.
5. Provide ONLY valid JSON.`;

  const response = await requestGroq([{ role: "user", content: prompt }], 3000, "llama-3.3-70b-versatile");


  try {
    const parsed = JSON.parse(extractJsonPayload(response));
    return parsed;
  } catch (error) {
    console.error("Failed to parse Groq response:", response);
    throw new Error("Invalid response format from AI service");
  }
}

/** Generates a personalized mentor response for copilot chat. */
async function generateCopilotResponse(
  messages: CopilotMessage[],
  userContext: string,
  model: string = "llama-3.3-70b-versatile"
): Promise<{
  content: string;
  metadata: any;
}> {
  // Convert messages to Groq format
  const groqMessages: GroqMessage[] = messages.map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : msg.role === "system" ? "system" : "user",
    content: msg.content
  }));

  const systemPrompt = `You are Veda, an elite AI Career Mentor and adaptive execution coach. You represent the "Learning Operating System" for the student.

CORE PHILOSOPHY:
- Be proactive, not just reactive.
- Deeply analyze behavioral signals from the user context.
- Explain WHY you are giving a recommendation.
- Always provide immediate next actions.

USER CONTEXT:
${userContext}

RESPONSE STRUCTURE (JSON):
You must respond with a JSON object that follows this structure:
{
  "content": "A concise, empathetic, and expert natural language response. Avoid generic fluff. Use markdown for lists or bolding.",
  "metadata": {
    "behaviorAnalysis": "Insight into the user's current state (e.g., 'Consistency is dropping', 'Strong recall on React', 'High burnout risk').",
    "cards": [
      {
        "type": "insight" | "mission" | "focus_sprint" | "recall_challenge" | "warning" | "analysis" | "recovery",
        "title": "Short catchy title",
        "description": "Contextual detail",
        "actionLabel": "Button text",
        "actionUrl": "/optional-link",
        "data": {} // Type specific details
      }
    ],
    "nextBestAction": {
      "label": "Brief actionable label",
      "description": "Why they should do this now",
      "type": "learn" | "revise" | "practice" | "rest" | "project"
    }
  }
}

CARD TYPES:
- insight: Behavioral or progress insights.
- mission: Specific roadmap-linked missions.
- focus_sprint: 20-60 min focused study session.
- recall_challenge: A quick active recall question or quiz.
- warning: Burnout or consistency drop alerts.
- analysis: "Why am I stuck?" diagnosis.
- recovery: Plan to get back on track after a break.

RULES:
1. Don't use plain text. Use the JSON structure.
2. Be extremely specific. Instead of "Practice more", say "Solve 2 BFS problems on LeetCode".
3. Use the student's name if available in context.
4. Keep the 'content' field as the primary conversational part.
5. Provide ONLY valid JSON.`;

  // Update or add system message
  const systemMsgIdx = groqMessages.findIndex(m => m.role === "system");
  if (systemMsgIdx !== -1) {
    groqMessages[systemMsgIdx].content = systemPrompt;
  } else {
    groqMessages.unshift({ role: "system", content: systemPrompt });
  }

  const response = await requestGroq(groqMessages, 2500, model);

  try {
    const parsed = JSON.parse(extractJsonPayload(response));
    return {
      content: parsed.content || "I'm processing your request.",
      metadata: parsed.metadata || {}
    };
  } catch (error) {
    console.error("Failed to parse Veda Copilot response:", response);
    return {
      content: response, // Fallback to raw response if JSON fails
      metadata: {}
    };
  }
}


/** Normalizes the model's resume tailoring JSON into the public response shape. */
function normalizeResumeTailorResult(value: unknown): ResumeTailorResult {
  const payload = value as Partial<ResumeTailorResult>;

  return {
    roleFitSummary: String(payload.roleFitSummary ?? ""),
    targetHeadline: String(payload.targetHeadline ?? ""),
    tailoredSummary: String(payload.tailoredSummary ?? ""),
    keywordAdditions: Array.isArray(payload.keywordAdditions) ? payload.keywordAdditions.map(String).slice(0, 16) : [],
    bulletRewrites: Array.isArray(payload.bulletRewrites)
      ? payload.bulletRewrites.slice(0, 6).map((item) => {
          const rewrite = item as Partial<ResumeTailorResult["bulletRewrites"][number]>;

          return {
            before: String(rewrite.before ?? ""),
            after: String(rewrite.after ?? ""),
            reason: String(rewrite.reason ?? "")
          };
        })
      : [],
    missingProofPoints: Array.isArray(payload.missingProofPoints) ? payload.missingProofPoints.map(String).slice(0, 8) : [],
    atsWarnings: Array.isArray(payload.atsWarnings) ? payload.atsWarnings.map(String).slice(0, 8) : [],
    nextActions: Array.isArray(payload.nextActions) ? payload.nextActions.map(String).slice(0, 6) : []
  };
}

/** Generates role-specific resume edits and ATS guidance. */
async function generateResumeTailoring(
  request: ResumeTailorRequest,
  userContext: string
): Promise<ResumeTailorResult> {
  const prompt = `You are an expert technical recruiter and resume editor. Tailor the user's resume for the target role while staying truthful. Do not invent experience, employers, dates, metrics, degrees, certifications, or tools that are not supported by the resume/user context.

Target role:
${request.targetRole}

Job description or role notes:
${request.jobDescription || "No job description provided. Use common expectations for this role."}

User profile context:
${userContext}

Current resume:
${request.currentResume}

Preferred writing tone: ${request.tone ?? "impact"}

Return ONLY valid JSON with this exact shape:
{
  "roleFitSummary": "2-3 sentence fit analysis",
  "targetHeadline": "short resume headline for this role",
  "tailoredSummary": "3-4 line resume summary tailored to the role",
  "keywordAdditions": ["keyword or phrase"],
  "bulletRewrites": [
    {
      "before": "original or summarized weak bullet",
      "after": "stronger truthful bullet with action, scope, tools, and outcome",
      "reason": "why this improves relevance"
    }
  ],
  "missingProofPoints": ["specific proof point user should add if true"],
  "atsWarnings": ["ATS or recruiter risk to fix"],
  "nextActions": ["concrete edit step"]
}

Rules:
- Prefer concise, measurable bullets, but use placeholders like "[add metric]" only when the metric is not present.
- If the resume lacks evidence for the target role, say what proof point to add instead of fabricating it.
- Include 8-14 keyword additions relevant to the role.
- Include 3-6 bullet rewrites.
- Keep all output suitable to paste into a resume.`;

  const response = await requestGroq(
    [
      {
        role: "system",
        content: "You return strict JSON for resume tailoring. Never include markdown fences or commentary."
      },
      { role: "user", content: prompt }
    ],
    2400
  );

  try {
    return normalizeResumeTailorResult(JSON.parse(extractJsonPayload(response)));
  } catch (error) {
    console.error("Failed to parse resume tailoring response:", response);
    throw new Error("Invalid response format from AI service");
  }
}

/** Simple wrapper to get a structured JSON response from an arbitrary prompt. */
async function generateStructuredResponse(prompt: string): Promise<string> {
  const response = await requestGroq([{ role: "user", content: prompt }], 2000);
  return extractJsonPayload(response);
}

/** Generates a 5-question multiple choice quiz based on a specific topic. */
async function generateQuiz(topic: string, targetRole: string): Promise<Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}>> {
  const prompt = `You are an expert technical interviewer and teacher. Create a 5-question multiple-choice quiz about "${topic}" tailored for someone studying to be a "${targetRole}". 

Return ONLY valid JSON with this exact shape:
[
  {
    "question": "Clear, concise technical question",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "1-2 sentence explanation of why the answer is correct."
  }
]

Make the questions practical and focus on active recall. Do not wrap the JSON in any text or markdown fences. DO NOT include any comments like // in the JSON output.`;

  const response = await requestGroq([{ role: "user", content: prompt }], 1500);

  try {
    const parsed = JSON.parse(extractJsonPayload(response));
    return parsed;
  } catch (error) {
    console.error("Failed to parse Groq quiz response:", response);
    throw new Error("Invalid response format from AI service");
  }
}

/** Analyzes a note to extract structured knowledge and memory reinforcements. */
async function analyzeNote(
  title: string,
  content: string,
  userContext: string
): Promise<{
  topic: string;
  summary: string;
  concepts: string[];
  flashcards: Array<{ question: string; answer: string }>;
  interviewRelevance: {
    frequency: "low" | "medium" | "high";
    importance: number;
    usageContext: string;
  };
  tags: string[];
}> {
  const prompt = `You are Veda, an AI Knowledge Engineer. Your task is to transform a raw learning note into structured knowledge for a student's "Second Brain".
  
NOTE TITLE: ${title}
NOTE CONTENT:
${content}

USER CONTEXT:
${userContext}

RESPONSE STRUCTURE (JSON):
{
  "topic": "Main high-level topic (e.g., 'Data Structures', 'React Hooks')",
  "summary": "A concise, high-impact summary of the key concepts.",
  "concepts": ["Concept 1", "Concept 2"],
  "flashcards": [
    { "question": "Active recall question", "answer": "Concise answer" }
  ],
  "interviewRelevance": {
    "frequency": "low" | "medium" | "high",
    "importance": 85, // 0-100 score
    "usageContext": "How this is usually asked in technical interviews"
  },
  "tags": ["Tag1", "Tag2"]
}

RULES:
1. Generate 3-5 high-quality flashcards for active recall.
2. Ensure the summary is helpful for quick review.
3. Tags should be consistent and professional.
4. Provide ONLY valid JSON.`;

  const response = await requestGroq([{ role: "user", content: prompt }], 2000, "llama-3.3-70b-versatile");

  try {
    return JSON.parse(extractJsonPayload(response));
  } catch (error) {
    console.error("Failed to parse note analysis response:", response);
    throw new Error("Invalid response format from AI note analysis");
  }
}

/** Generates a comprehensive AI Skill Intelligence Report. */
async function generateSkillIntelligenceReport(
  targetRole: string,
  rawGaps: Array<any>,
  userContext: string
): Promise<any> {
  const prompt = `You are Veda, an AI Career Intelligence Engine. Analyze the student's skills, learning behavior, and memory retention to generate a realistic "Career Readiness Report" for the role of ${targetRole}.

USER CONTEXT (Behavior, Notes, Roadmap, Recall):
${userContext}

RAW GAP DATA (Baselines):
${JSON.stringify(rawGaps, null, 2)}

RESPONSE STRUCTURE (JSON):
{
  "targetRole": "${targetRole}",
  "overallScore": 65, // 0-100 holistic readiness
  "readiness": {
    "learningFoundation": "Medium", // Weak, Medium, Strong
    "problemSolving": "Weak",
    "projectDepth": "Medium",
    "interviewConfidence": "Weak"
  },
  "roleMatches": [
    {
      "role": "Startup Intern",
      "matchPercentage": 75,
      "strengths": ["React", "Git"],
      "blockers": ["System Design"],
      "estimatedTimelineMonths": 2
    }
  ],
  "gaps": [
    {
      "skill": "Dynamic Programming",
      "category": "Algorithms",
      "status": "weak", // strong, partial, weak
      "dimensions": {
        "confidence": 40,
        "retention": 30,
        "interviewReady": 20,
        "practical": 10,
        "momentum": "declining" // stagnating, improving, declining
      },
      "gapScore": 80,
      "userScore": 20
    }
  ],
  "blockers": ["You struggle to retain Dynamic Programming concepts due to inconsistent revision."],
  "careerTrajectory": "At your current pace, you will be internship-ready in ~4 months.",
  "predictiveInsights": ["If consistency drops further, DSA retention will decay rapidly next week."],
  "recommendations": {
    "nextSkills": ["Dynamic Programming", "System Design"],
    "recoveryPlan": "Focus heavily on spaced repetition for DSA before learning new frameworks."
  },
  "provider": "veda-ai"
}

RULES:
1. Provide deep, honest analysis. Do not just say 100% ready.
2. Ensure dimensions (confidence, retention, etc.) reflect the USER CONTEXT provided. If they skip tasks, retention/momentum should be lower.
3. Provide ONLY valid JSON matching the exact structure.`;

  const response = await requestGroq([{ role: "user", content: prompt }], 3000, "llama-3.3-70b-versatile");

  try {
    return JSON.parse(extractJsonPayload(response));
  } catch (error) {
    console.error("Failed to parse AI skill intelligence response:", response);
    throw new Error("Invalid response format from AI skill analysis");
  }
}

export const groqService = {
  generateRoadmap,
  generateCopilotResponse,
  generateResumeTailoring,
  generateStructuredResponse,
  generateQuiz,
  analyzeNote,
  generateSkillIntelligenceReport
};


