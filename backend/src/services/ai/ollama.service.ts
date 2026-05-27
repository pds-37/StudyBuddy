import axios from "axios";
import { requestContextStorage } from "../../core/context.js";
import type { CopilotMessage, ResumeTailorRequest, ResumeTailorResult } from "@studybuddy/shared";

type OllamaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** Extracts a raw JSON block even when the model wraps it in markdown fences or commentary. */
function extractJsonPayload(content: string): string {
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

/** Sends a chat request to the local Ollama service. */
async function requestOllama(
  messages: OllamaMessage[],
  options: { model?: string; temperature?: number } = {}
): Promise<string> {
  const store = requestContextStorage.getStore();
  const url = store?.apiKeys?.ollamaUrl || "http://localhost:11434";
  const defaultModel = store?.apiKeys?.ollamaModel || "llama3.2";
  const model = options.model || defaultModel;

  const response = await axios.post(
    `${url}/api/chat`,
    {
      model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7
      }
    },
    {
      timeout: 60000 // Local inference can take time on CPU
    }
  );

  const content = response.data?.message?.content?.trim();
  if (!content) {
    throw new Error("No response from local Ollama service");
  }
  return content;
}

/** Check if Ollama is running and healthy on the host machine. */
async function isHealthy(customUrl?: string): Promise<boolean> {
  const store = requestContextStorage.getStore();
  const url = customUrl || store?.apiKeys?.ollamaUrl || "http://localhost:11434";
  try {
    const res = await axios.get(`${url}/api/tags`, { timeout: 1500 });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}

/** Offline fallback for Copilot Mentor chat. */
async function generateCopilotResponse(
  messages: CopilotMessage[],
  userContext: string,
  model?: string
): Promise<{ content: string; metadata: any }> {
  const systemPrompt = `You are Veda, an offline SDE Career Mentor. Since the user is offline/private, you are running locally.
  USER CONTEXT:
  ${userContext}
  
  Format your reply as a valid JSON object matching:
  {
    "content": "Your friendly, empathetic conversation, styled as a Mentor Dost.",
    "metadata": {
      "behaviorAnalysis": "Local offline state calibration.",
      "cards": [],
      "nextBestAction": { "label": "Revise notes", "description": "Local review", "type": "revise" }
    }
  }`;

  const ollamaMessages: OllamaMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" as const : (m.role === "system" ? "system" as const : "user" as const),
      content: msgContent(m.content)
    }))
  ];

  const response = await requestOllama(ollamaMessages, { model });
  try {
    const parsed = JSON.parse(extractJsonPayload(response));
    return {
      content: parsed.content || "Hello! I am Veda running offline.",
      metadata: parsed.metadata || {}
    };
  } catch (err) {
    return {
      content: response,
      metadata: {}
    };
  }
}

function msgContent(content: string | any[]): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(c => typeof c === "string" ? c : JSON.stringify(c)).join("\n");
  }
  return String(content);
}

/** Offline fallback for generating a quiz. */
async function generateQuiz(topic: string, targetRole: string): Promise<any[]> {
  const prompt = `Create a 3-question multiple choice quiz on the topic "${topic}" for an aspiring "${targetRole}".
  Return ONLY valid JSON matching this schema:
  [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation."
    }
  ]`;

  const response = await requestOllama([{ role: "user", content: prompt }]);
  try {
    return JSON.parse(extractJsonPayload(response));
  } catch (err) {
    return [
      {
        question: `Recall review for ${topic}`,
        options: ["Completed local study session", "Still working on it"],
        correctAnswer: 0,
        explanation: "Keep revising offline!"
      }
    ];
  }
}

/** Offline note analysis and concept extraction. */
async function analyzeNote(title: string, content: string, userContext: string): Promise<any> {
  const prompt = `Analyze this note titled "${title}" to extract concepts, flashcards, and relationship graph.
  NOTE CONTENT:
  ${content}

  Return ONLY valid JSON matching:
  {
    "topic": "Note Topic",
    "summary": "Note Summary",
    "concepts": ["Concept Name"],
    "difficulty": "beginner",
    "knowledgeLayer": "understanding",
    "conceptGraph": [],
    "executionTasks": [],
    "confusionSignals": [],
    "flashcards": [
      { "question": "Question?", "answer": "Answer" }
    ],
    "interviewRelevance": { "frequency": "medium", "importance": 50, "usageContext": "", "commonQuestions": [], "realWorldUsage": [] },
    "revisionStrategy": "conceptual",
    "tags": ["offline"]
  }`;

  const response = await requestOllama([{ role: "user", content: prompt }]);
  try {
    return JSON.parse(extractJsonPayload(response));
  } catch (err) {
    return {
      topic: title,
      summary: "Offline notes indexed locally.",
      concepts: [title],
      difficulty: "beginner",
      knowledgeLayer: "understanding",
      conceptGraph: [],
      executionTasks: [],
      confusionSignals: [],
      flashcards: [
        { question: `What is the core takeaway of ${title}?`, answer: content.substring(0, 100) }
      ],
      interviewRelevance: { frequency: "medium", importance: 50, usageContext: "", commonQuestions: [], realWorldUsage: [] },
      revisionStrategy: "conceptual",
      tags: ["offline"]
    };
  }
}

/** Offline fallback for roadmap generation. */
async function generateRoadmap(
  targetRole: string,
  timelineWeeks: number,
  skillGaps: Array<{ skill: string; gapScore: number }>,
  userNotes?: string,
  behaviorProfile?: any,
  intelligenceProfile?: any
): Promise<any> {
  const prompt = `Generate a 3-phase curriculum for "${targetRole}" over "${timelineWeeks}" weeks.
  Return ONLY valid JSON matching:
  {
    "title": "Offline Roadmap",
    "readinessScore": 10,
    "consistencyScore": 50,
    "currentPhaseId": "phase-1",
    "nextMilestone": "Foundations",
    "phases": [
      {
        "id": "phase-1",
        "title": "Phase 1",
        "description": "Foundational steps",
        "status": "unlocked",
        "estimatedWeeks": 2,
        "difficulty": "beginner",
        "checkpoints": ["Completed basic concepts"],
        "missions": [
          {
            "id": "mission-1",
            "weekNumber": 1,
            "title": "Getting Started",
            "description": "Start offline review",
            "whyItMatters": "Core foundational practice",
            "outcome": "Able to explain basic concepts",
            "commonMistakes": [],
            "status": "not_started",
            "tasks": [
              {
                "id": "t1",
                "title": "Review local offline notes",
                "type": "learn",
                "durationMinutes": 60,
                "difficulty": "easy",
                "aiHint": "Focus on main pillars."
              }
            ]
          }
        ]
      }
    ],
    "insights": []
  }`;

  const response = await requestOllama([{ role: "user", content: prompt }]);
  try {
    return JSON.parse(extractJsonPayload(response));
  } catch (err) {
    throw new Error("Local offline model failed to generate valid roadmap JSON.");
  }
}

/** Offline fallback for ATS resume tailoring. */
async function generateResumeTailoring(
  request: ResumeTailorRequest,
  userContext: string
): Promise<ResumeTailorResult> {
  const prompt = `Tailor this resume for the target role "${request.targetRole}".
  Return ONLY valid JSON matching:
  {
    "roleFitSummary": "Candidate has foundational skills for this role.",
    "targetHeadline": "Aspiring SDE",
    "tailoredSummary": "SDE candidate focused on software architectures.",
    "keywordAdditions": [],
    "bulletRewrites": [],
    "projectAnalysis": [],
    "atsIntelligence": { "score": 60, "missingKeywords": [], "formattingSafety": { "status": "safe", "issues": [] }, "recruiterScanOptimization": "" },
    "interviewAlignment": { "likelyQuestions": [], "weakDiscussionAreas": [], "projectExplanationGaps": [] },
    "missingProofPoints": [],
    "nextActions": []
  }`;

  const response = await requestOllama([{ role: "user", content: prompt }]);
  try {
    return JSON.parse(extractJsonPayload(response));
  } catch (err) {
    throw new Error("Local offline model failed to tailer resume.");
  }
}

/** Offline fallback for Skill Intelligence Report. */
async function generateSkillIntelligenceReport(targetRole: string, rawGaps: any[], userContext: string): Promise<any> {
  const prompt = `Generate a skill readiness report for "${targetRole}".
  Return ONLY valid JSON matching:
  {
    "targetRole": "${targetRole}",
    "overallScore": 50,
    "readiness": { "learningFoundation": "Medium", "problemSolving": "Medium", "projectDepth": "Medium", "interviewConfidence": "Medium" },
    "roleMatches": [],
    "gaps": [],
    "blockers": [],
    "careerTrajectory": "",
    "predictiveInsights": [],
    "recommendations": { "nextSkills": [], "recoveryPlan": "" },
    "provider": "ollama-local"
  }`;

  const response = await requestOllama([{ role: "user", content: prompt }]);
  try {
    return JSON.parse(extractJsonPayload(response));
  } catch (err) {
    throw new Error("Local offline model failed to generate skill report.");
  }
}

/** Simple wrapper for arbitrary local prompts. */
async function generateStructuredResponse(prompt: string): Promise<string> {
  const response = await requestOllama([{ role: "user", content: prompt }]);
  return extractJsonPayload(response);
}

export const ollamaService = {
  requestOllama,
  isHealthy,
  generateCopilotResponse,
  generateQuiz,
  analyzeNote,
  generateRoadmap,
  generateResumeTailoring,
  generateSkillIntelligenceReport,
  generateStructuredResponse
};
