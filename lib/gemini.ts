import Constants from "expo-constants";

import type { GeminiAnalysis, GeminiRoadmap, Note } from "@/lib/types";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL_NAME = "gemini-2.5-flash-lite";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    message?: string;
  };
};

const getGeminiApiKey = () =>
  (Constants.expoConfig?.extra?.geminiApiKey as string | undefined)?.trim() ?? "";

const extractJson = (payload: string) => {
  const trimmed = payload.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error("Gemini response did not contain a JSON object.");
};

const postGemini = async (
  systemInstruction: string,
  userPrompt: string,
  responseSchema?: Record<string, unknown>
) => {
  const apiKey = getGeminiApiKey();
  if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
    throw new Error("Gemini API key is missing from app.config.js.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}/${MODEL_NAME}:generateContent`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: systemInstruction
            }
          ]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: userPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
          ...(responseSchema
            ? {
                responseMimeType: "application/json",
                responseJsonSchema: responseSchema
              }
            : {})
        }
      })
    });

    const json = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      throw new Error(json.error?.message ?? "Gemini request failed.");
    }

    if (json.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the prompt: ${json.promptFeedback.blockReason}`);
    }

    const candidate = json.candidates?.[0];
    const text = candidate?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!text) {
      throw new Error(candidate?.finishReason ?? "Gemini returned an empty response.");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
};

const analysisSchema = {
  type: "object",
  properties: {
    subject: {
      type: "string",
      description: "High-level B.Tech CSE subject like DSA, DBMS, Operating Systems, or Computer Networks."
    },
    category: {
      type: "string",
      description: "Specific CSE topic studied, like binary search trees or deadlock prevention."
    },
    key_concepts: {
      type: "array",
      description: "Up to five important concepts from the note.",
      items: {
        type: "string"
      }
    },
    summary: {
      type: "string",
      description: "One sentence summary of what was studied."
    },
    confidence: {
      type: "integer",
      description: "Confidence score from 0 to 100."
    },
    suggested_roadmap_topic: {
      type: "string",
      description: "Roadmap milestone topic if the note matches one."
    }
  },
  required: [
    "subject",
    "category",
    "key_concepts",
    "summary",
    "confidence",
    "suggested_roadmap_topic"
  ]
} as const;

const roadmapSchema = {
  type: "object",
  properties: {
    goal_title: {
      type: "string"
    },
    target_date: {
      type: "string"
    },
    subject: {
      type: "string"
    },
    milestones: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          topic: { type: "string" },
          description: { type: "string" },
          order: { type: "integer" },
          estimated_notes_needed: { type: "integer" }
        },
        required: ["id", "topic", "description", "order", "estimated_notes_needed"]
      }
    }
  },
  required: ["goal_title", "target_date", "subject", "milestones"]
} as const;

export const analyseNote = async (noteText: string, subjectHint?: string | null): Promise<GeminiAnalysis> => {
  const system = `You are a study assistant for a B.Tech Computer Science student. Analyse the user's study note carefully and return structured study metadata.
Keep the response factual, compact, and aligned with the note.
Prefer B.Tech CSE subjects and topics such as Data Structures and Algorithms, DBMS, Operating Systems, Computer Networks, OOP, Software Engineering, Theory of Computation, Compiler Design, AI/ML, Cloud, Web Development, and Mathematics for CSE.
If the user gave a preferred subject hint, use it when it matches the note.
Never include markdown or extra text outside the JSON object.`;

  const prompt = subjectHint
    ? `Preferred subject hint: ${subjectHint}\n\nStudy note:\n${noteText}`
    : `Study note:\n${noteText}`;

  const rawText = await postGemini(system, prompt, analysisSchema);
  return JSON.parse(extractJson(rawText)) as GeminiAnalysis;
};

export const generateRoadmap = async (goalInput: string): Promise<GeminiRoadmap> => {
  const system = `You are Study Buddy for a B.Tech Computer Science student. Turn the user's study goal into a practical learning roadmap.
Use a clear sequence of milestones, each with one sentence of description and a realistic notes estimate.
Bias the roadmap toward B.Tech CSE coursework, interview prep, projects, and semester study plans when relevant.
Return only JSON matching the schema.`;

  const prompt = `The user has set this study goal: "${goalInput}"`;

  const rawText = await postGemini(system, prompt, roadmapSchema);
  return JSON.parse(extractJson(rawText)) as GeminiRoadmap;
};

export const askBuddyQuestion = async (
  question: string,
  notes: Note[],
  conversation: Array<{ role: "user" | "assistant"; content: string }>
) => {
  const contextNotes = notes
    .slice(0, 20)
    .map((note) => `${note.subject} > ${note.category}: ${note.summary}`)
    .join("\n");

  const system = `You are Study Buddy, a friendly and encouraging AI study companion. You have access to the user's study notes below.
Answer questions based on their notes when relevant.
Keep responses concise, using at most 4 sentences unless a detailed explanation is specifically requested.
Be warm, use simple language, and always end with a short follow-up question or encouragement.

USER'S NOTES CONTEXT:
${contextNotes || "No saved notes yet."}`;

  const conversationText = conversation
    .map((message) => `${message.role === "assistant" ? "Buddy" : "User"}: ${message.content}`)
    .join("\n");

  return postGemini(
    system,
    `${conversationText ? `${conversationText}\n` : ""}User: ${question}\nBuddy:`
  );
};
