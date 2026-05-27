import axios from "axios";
import { env } from "../../config/env.js";
import { requestContextStorage } from "../../core/context.js";
import type { CopilotMessage, ResumeTailorRequest, ResumeTailorResult } from "@studybuddy/shared";

type HuggingFaceFeatureResponse = number[] | number[][] | number[][][];

const HUGGINGFACE_BASE_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction";

/** Flattens HuggingFace feature extraction output into a single embedding vector. */
function normalizeFeatureResponse(output: HuggingFaceFeatureResponse): number[] {
  const rows: number[][] = [];

  /** Recursively collects numeric vectors from nested HuggingFace output. */
  function collectRows(value: HuggingFaceFeatureResponse | number[]) {
    if (!Array.isArray(value) || value.length === 0) {
      return;
    }

    if (typeof value[0] === "number") {
      rows.push(value as number[]);
      return;
    }

    for (const child of value as HuggingFaceFeatureResponse[]) {
      collectRows(child);
    }
  }

  collectRows(output);

  if (rows.length === 0) {
    return [];
  }

  const dimensions = Math.max(...rows.map((row) => row.length));

  return Array.from({ length: dimensions }, (_value, index) => {
    const total = rows.reduce((sum, row) => sum + (row[index] ?? 0), 0);
    return total / rows.length;
  });
}

/** Calls HuggingFace's free inference API for a text embedding. */
async function embedText(text: string) {
  const apiKey = env.huggingFaceApiKey;

  if (!apiKey) {
    throw new Error("HuggingFace API key is not configured.");
  }

  const response = await axios.post<HuggingFaceFeatureResponse>(
    `${HUGGINGFACE_BASE_URL}/${env.huggingFaceEmbeddingModel}`,
    {
      inputs: text,
      options: {
        wait_for_model: true
      }
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    }
  );

  return normalizeFeatureResponse(response.data);
}

type HuggingFaceMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** Extracts a raw JSON block even when the model wraps it in markdown fences or commentary. */
function extractJsonPayload(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  const firstBrace = content.indexOf('{');
  const firstBracket = content.indexOf('[');
  const lastBrace = content.lastIndexOf('}');
  const lastBracket = content.lastIndexOf(']');

  let start = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    start = Math.min(firstBrace, firstBracket);
  } else {
    start = firstBrace !== -1 ? firstBrace : firstBracket;
  }

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

/** Sends a chat-completions request to Hugging Face OpenAI-compatible Serverless API. */
async function requestHuggingFace(
  messages: HuggingFaceMessage[],
  maxTokens: number,
  model: string = "Qwen/Qwen2.5-72B-Instruct"
) {
  const apiKey = env.huggingFaceApiKey;

  if (!apiKey) {
    throw new Error("HuggingFace API key is not configured.");
  }

  const response = await axios.post(
    `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`,
    {
      model,
      temperature: 0.7,
      max_tokens: maxTokens,
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    }
  );

  const content = response.data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("No response from HuggingFace API");
  }

  return content;
}

/** Generates a personalized learning roadmap using Hugging Face. */
async function generateRoadmap(
  targetRole: string,
  timelineWeeks: number,
  skillGaps: Array<{ skill: string; gapScore: number }>,
  userNotes?: string,
  behaviorProfile?: any,
  intelligenceProfile?: any
): Promise<any> {
  const skillGapsText = skillGaps
    .sort((a, b) => b.gapScore - a.gapScore)
    .slice(0, 10)
    .map(gap => `- ${gap.skill} (gap: ${gap.gapScore}%)`)
    .join("\n");

  const notesContext = userNotes ? `\n\nUser's learning notes and context:\n${userNotes}` : "";

  const prompt = `You are Veda, an advanced AI Mentor. Generate a highly adaptive "Career Learning Mission" for a student targeting the role of "${targetRole}".
  CONTEXT:
  - Target Role: ${targetRole}
  - Timeline: ${timelineWeeks} weeks
  - Available Study Time: ${intelligenceProfile?.availableHours || 2} hours/day
  - Skill Gaps:
  ${skillGapsText || "None"}${notesContext}
  
  Generate a living execution engine in valid JSON format:
  {
    "title": "A cinematic mission title",
    "readinessScore": 15,
    "consistencyScore": 50,
    "currentPhaseId": "phase-1",
    "nextMilestone": "Short title of the first major checkpoint",
    "phases": [
      {
        "id": "phase-1",
        "title": "Phase Title",
        "description": "Strategic overview",
        "status": "unlocked",
        "estimatedWeeks": 4,
        "difficulty": "beginner",
        "checkpoints": ["Milestone 1"],
        "missions": [
          {
            "id": "mission-w1",
            "weekNumber": 1,
            "title": "Weekly Mission Title",
            "description": "What we achieve this week",
            "whyItMatters": "Context",
            "outcome": "Outcome",
            "commonMistakes": [],
            "status": "not_started",
            "tasks": [
              {
                "id": "t1",
                "title": "Actionable daily task",
                "type": "learn",
                "durationMinutes": 60,
                "difficulty": "easy",
                "aiHint": "Hint"
              }
            ]
          }
        ]
      }
    ],
    "insights": []
  }`;

  const response = await requestHuggingFace([{ role: "user", content: prompt }], 3000);
  return JSON.parse(extractJsonPayload(response));
}

/** Generates a personalized mentor response for copilot chat. */
async function generateCopilotResponse(
  messages: CopilotMessage[],
  userContext: string
): Promise<{ content: string; metadata: any }> {
  const hfMessages: HuggingFaceMessage[] = messages.map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : msg.role === "system" ? "system" : "user",
    content: msg.content
  }));

  const systemPrompt = `You are Veda, an elite AI Career Mentor (Mentor Dost). Talk like an encouraging, highly empathetic friend.
  USER CONTEXT:
  ${userContext}
  
  You must respond with a JSON object:
  {
    "content": "Empathetic natural language response in markdown.",
    "metadata": {
      "behaviorAnalysis": "Insight",
      "cards": [],
      "nextBestAction": { "label": "Action", "description": "Why", "type": "learn" }
    }
  }`;

  const systemMsgIdx = hfMessages.findIndex(m => m.role === "system");
  if (systemMsgIdx !== -1) {
    hfMessages[systemMsgIdx].content = systemPrompt;
  } else {
    hfMessages.unshift({ role: "system", content: systemPrompt });
  }

  const response = await requestHuggingFace(hfMessages, 2500);
  try {
    const parsed = JSON.parse(extractJsonPayload(response));
    return {
      content: parsed.content || "I'm processing your request.",
      metadata: parsed.metadata || {}
    };
  } catch {
    return { content: response, metadata: {} };
  }
}

/** Generates role-specific resume edits and ATS guidance. */
async function generateResumeTailoring(
  request: ResumeTailorRequest,
  userContext: string
): Promise<ResumeTailorResult> {
  const prompt = `You are Veda, an expert Technical Recruiter. Tailor this resume for "${request.targetRole}".
  RESUME: ${request.currentResume}
  JD: ${request.jobDescription}
  USER PROFILE: ${userContext}
  
  Return ONLY valid JSON matching this schema:
  {
    "roleFitSummary": "Summary",
    "targetHeadline": "Headline",
    "tailoredSummary": "Summary",
    "keywordAdditions": [],
    "bulletRewrites": [
      { "before": "", "after": "", "reason": "", "impactScore": 80, "technicalDepthScore": 80 }
    ],
    "projectAnalysis": [],
    "atsIntelligence": { "score": 80, "missingKeywords": [], "formattingSafety": { "status": "safe", "issues": [] }, "recruiterScanOptimization": "" },
    "interviewAlignment": { "likelyQuestions": [], "weakDiscussionAreas": [], "projectExplanationGaps": [] },
    "missingProofPoints": [],
    "nextActions": []
  }`;

  const response = await requestHuggingFace([{ role: "user", content: prompt }], 3000);
  return JSON.parse(extractJsonPayload(response)) as ResumeTailorResult;
}

/** Simple wrapper to get a structured JSON response from an arbitrary prompt. */
async function generateStructuredResponse(prompt: string): Promise<string> {
  const response = await requestHuggingFace([{ role: "user", content: prompt }], 2000);
  return extractJsonPayload(response);
}

/** Generates a 5-question multiple choice quiz. */
async function generateQuiz(topic: string, targetRole: string): Promise<any[]> {
  const prompt = `Create a 5-question multiple-choice quiz about "${topic}" for a "${targetRole}". 
  Return ONLY valid JSON:
  [
    {
      "question": "Question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation"
    }
  ]`;

  const response = await requestHuggingFace([{ role: "user", content: prompt }], 1500);
  return JSON.parse(extractJsonPayload(response));
}

/** Analyzes a note to extract structured knowledge. */
async function analyzeNote(
  title: string,
  content: string,
  userContext: string
): Promise<any> {
  const prompt = `Analyze this note and extract deep structured knowledge.
  TITLE: ${title}
  CONTENT: ${content}
  USER CONTEXT: ${userContext}
  
  Return ONLY valid JSON:
  {
    "topic": "Topic",
    "summary": "Summary",
    "concepts": [],
    "difficulty": "beginner",
    "knowledgeLayer": "surface",
    "conceptGraph": [],
    "executionTasks": [],
    "confusionSignals": [],
    "flashcards": [],
    "interviewRelevance": { "frequency": "medium", "importance": 80, "usageContext": "", "commonQuestions": [], "realWorldUsage": [] },
    "revisionStrategy": "conceptual",
    "tags": []
  }`;

  const response = await requestHuggingFace([{ role: "user", content: prompt }], 2500);
  return JSON.parse(extractJsonPayload(response));
}

/** Generates a comprehensive AI Skill Intelligence Report. */
async function generateSkillIntelligenceReport(
  targetRole: string,
  rawGaps: Array<any>,
  userContext: string
): Promise<any> {
  const prompt = `Generate a Skill Readiness Report for "${targetRole}".
  GAPS: ${JSON.stringify(rawGaps)}
  USER CONTEXT: ${userContext}
  
  Return ONLY valid JSON matching this schema:
  {
    "targetRole": "${targetRole}",
    "overallScore": 60,
    "readiness": { "learningFoundation": "Medium", "problemSolving": "Weak", "projectDepth": "Medium", "interviewConfidence": "Weak" },
    "roleMatches": [],
    "gaps": [],
    "blockers": [],
    "careerTrajectory": "",
    "predictiveInsights": [],
    "recommendations": { "nextSkills": [], "recoveryPlan": "" },
    "provider": "huggingface"
  }`;

  const response = await requestHuggingFace([{ role: "user", content: prompt }], 2500);
  return JSON.parse(extractJsonPayload(response));
}

export const huggingFaceService = {
  embedText,
  generateRoadmap,
  generateCopilotResponse,
  generateResumeTailoring,
  generateStructuredResponse,
  generateQuiz,
  analyzeNote,
  generateSkillIntelligenceReport
};
