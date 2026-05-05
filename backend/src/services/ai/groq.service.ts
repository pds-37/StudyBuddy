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
async function requestGroq(messages: GroqMessage[], maxTokens: number) {
  if (!env.groqApiKey) {
    throw new Error("Groq API key is not configured.");
  }

  const response = await axios.post<GroqChatResponse>(
    GROQ_CHAT_COMPLETIONS_URL,
    {
      model: "llama-3.1-8b-instant",
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

/** Extracts a raw JSON block even when the model wraps it in markdown fences. */
function extractJsonPayload(content: string) {
  const fenced = content.match(/```json\s*([\s\S]*?)```/i) ?? content.match(/```\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? content.trim();
}

/** Generates a personalized career roadmap using Groq Llama3. */
async function generateRoadmap(
  targetRole: string,
  timelineWeeks: number,
  skillGaps: Array<{ skill: string; gapScore: number }>,
  userNotes?: string,
  behaviorProfile?: any
): Promise<{
  title: string;
  rationale: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    skillTags: string[];
    rationale: string;
    order: number;
    resources: Array<{
      title: string;
      type: "video" | "course" | "article" | "documentation";
      url: string;
      author: string;
    }>;
  }>;
}> {
  const skillGapsText = skillGaps
    .sort((a, b) => b.gapScore - a.gapScore)
    .slice(0, 10)
    .map(gap => `- ${gap.skill} (gap: ${gap.gapScore}%)`)
    .join("\n");

  const notesContext = userNotes ? `\n\nUser's learning notes and context:\n${userNotes}` : "";

  const prompt = `You are an expert career coach. Create a personalized learning roadmap for someone targeting the role of "${targetRole}" over ${timelineWeeks} weeks.

Key information:
- Current skill gaps (highest priority first):
${skillGapsText}${notesContext}

${behaviorProfile ? `Behavior Insights:
- Consistency Score: ${behaviorProfile.consistencyScore}%
- Skip Rate: ${behaviorProfile.skipRate}%
Adaptive Instruction: ${behaviorProfile.consistencyScore < 50 ? "The user is struggling with consistency. Create shorter, more manageable milestones with frequent 'easy wins' to build momentum." : "The user is highly consistent. Make milestones challenging and project-heavy to maximize growth."}` : ""}

Generate a structured roadmap with ${Math.min(8, Math.ceil(timelineWeeks / 4))} milestones that will help close these skill gaps and prepare for the target role.

Each milestone should include:
- A clear, actionable title
- Detailed description of what to learn and do
- Specific skills that will be developed
- Realistic timeline within the ${timelineWeeks}-week period
- 1-3 highly specific recommended resources (e.g., specific YouTube creators like "Striver", "NeetCode", "CodeWithHarry", "FreeCodeCamp", or specific documentation/articles). Provide a realistic search URL for them.

Format your response as JSON with this exact structure:
{
  "title": "Roadmap title",
  "rationale": "Overall explanation of why this pathway is the best fit for their skills",
  "milestones": [
    {
      "id": "milestone-1",
      "title": "Milestone title",
      "description": "Detailed description of activities and learning goals",
      "skillTags": ["skill1", "skill2"],
      "rationale": "Why this milestone is important for closing the specific gap",
      "order": 1,
      "resources": [
        {
          "title": "Data Structures Easy to Advanced",
          "type": "video",
          "url": "https://www.youtube.com/results?search_query=Data+Structures",
          "author": "CodeWithHarry"
        }
      ]
    }
  ]
}

Make the roadmap practical, specific, and achievable within the timeline. Focus on high-impact skills that will make the biggest difference for the target role. Crucially, act as a "full mentor" and recommend the absolute best internet tutors and resources.`;

  const response = await requestGroq([{ role: "user", content: prompt }], 2000);

  try {
    const parsed = JSON.parse(extractJsonPayload(response));
    return parsed;
  } catch (error) {
    console.error("Failed to parse Groq response:", response);
    throw new Error("Invalid response format from AI service");
  }
}

/** Generates an AI response for copilot chat using conversation history and user context. */
async function generateCopilotResponse(
  messages: CopilotMessage[],
  userContext: string
): Promise<string> {
  // Convert messages to Groq format
  const groqMessages: GroqMessage[] = messages.map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : msg.role === "system" ? "system" : "user",
    content: msg.content
  }));

  // Add user context to the system message or first user message
  const contextPrompt = `You are AI Dost, a memory-first personal developer mentor. Your first job is to use the student's own notes and learning history before general knowledge.

${userContext}

Rules:
- If MEMORY_MODE is notes-first, answer primarily from the supplied notes and mention when a detail comes from the student's memory.
- If MEMORY_MODE is fallback, answer from general knowledge and label it as new knowledge to review later.
- Keep the response practical, concise, and oriented toward retention.
- When useful, end with one active-recall question the student should answer next.

Be helpful, encouraging, and provide actionable advice. Reference skills, notes, roadmaps, and job recommendations only when relevant.`;

  // Update the system message with context
  if (groqMessages[0]?.role === "user") {
    groqMessages.unshift({
      role: "system",
      content: contextPrompt
    });
  } else if (groqMessages[0]?.role === "system") {
    groqMessages[0].content = contextPrompt;
  }

  return requestGroq(groqMessages, 1000);
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

export const groqService = {
  generateRoadmap,
  generateCopilotResponse,
  generateResumeTailoring,
  generateStructuredResponse,
  generateQuiz
};
