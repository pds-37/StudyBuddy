import { env } from "../config/env";
import type { StoredMilestone, StoredNote } from "../data/store";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type AnalysisResult = {
  subject: string;
  category: string;
  keyConcepts: string[];
  summary: string;
  confidence: number;
  suggestedRoadmapTopic: string;
};

type RoadmapDraft = {
  goalTitle: string;
  subject: string;
  targetDate: string;
  milestones: StoredMilestone[];
};

function extractJson(payload: string) {
  const trimmed = payload.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error("Gemini did not return valid JSON.");
}

async function postGemini(systemInstruction: string, userPrompt: string) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  const response = await fetch(`${GEMINI_ENDPOINT}/${env.GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 1200
      }
    })
  });

  const payload = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Gemini request failed.");
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

export async function analyseStudyNote(content: string, subjectHint?: string) {
  const system = `You are Study Buddy for a serious college student.
Return only a JSON object with these exact keys:
subject, category, keyConcepts, summary, confidence, suggestedRoadmapTopic.
Infer the best subject and subtopic from the note itself.
Use clear academic English and keep category names specific.`;

  const prompt = subjectHint
    ? `Preferred subject hint: ${subjectHint}\n\nStudy note:\n${content}`
    : `Study note:\n${content}`;

  const raw = await postGemini(system, prompt);
  return JSON.parse(extractJson(raw)) as AnalysisResult;
}

export async function structureStudyNote(content: string, subject: string, category: string) {
  const system = `You are Study Buddy.
Rewrite the student's rough study note into a clean, detailed, revision-ready study sheet.
Return markdown only.
Use headings, bullet lists, short explanations, code fences when commands matter, and compact tables when comparison helps.

Rules:
- Keep it accurate to the student's note.
- Correct obvious factual mistakes only when you are highly confident, and mark them as a note.
- Group related ideas under meaningful sections instead of keeping the raw order.
- Expand shorthand into readable study notes without becoming wordy.
- Do not add extra commentary before or after the note.`;

  const prompt = `Subject: ${subject}\nCategory: ${category}\n\nOriginal note:\n${content}`;
  return (await postGemini(system, prompt)).trim();
}

export async function chatWithBuddy(message: string, history: Array<{ role: string; content: string }>, notes: StoredNote[]) {
  const context = notes
    .slice(0, 20)
    .map((note) => `${note.subject} > ${note.category}: ${note.summary}`)
    .join("\n");

  const conversation = history.map((entry) => `${entry.role === "assistant" ? "Buddy" : "User"}: ${entry.content}`).join("\n");

  const system = `You are Study Buddy, an opinionated AI study companion for a college student.
Answer from the student's saved notes when possible.
Be concise, clear, and academically useful.
Prefer direct action over generic advice.
When helpful, tell the student the next exact thing to study or revise.
Always end with one brief next step or check question.

NOTES CONTEXT:
${context || "No notes yet."}`;

  const raw = await postGemini(system, `${conversation}\nUser: ${message}\nBuddy:`);
  return raw.trim();
}

export async function generateRoadmap(goal: string) {
  const system = `You are Study Buddy.
Turn the student's natural-language goal into a practical academic roadmap.
Return only JSON with keys: goalTitle, subject, targetDate, milestones.
Milestones must be an array of objects with: topic, description, orderIndex, status, estimatedNotes, actualNotes.
Set status to "upcoming" and actualNotes to 0.`;

  const raw = await postGemini(system, `Goal: ${goal}`);
  return JSON.parse(extractJson(raw)) as RoadmapDraft;
}
