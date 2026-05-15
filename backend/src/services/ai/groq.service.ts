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
  intelligenceProfile?: any
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
- Target Role/Interest: ${targetRole}
- Timeline: ${timelineWeeks} weeks (User's goal: ${intelligenceProfile?.targetTimeline || "Adaptive"})
- Available Study Time: ${intelligenceProfile?.availableHours || 2} hours/day
- Expansion Intent: ${intelligenceProfile?.expansionReason || "Primary Career Path"}
- Initial Level: ${intelligenceProfile?.initialTrackLevel || "Beginner"}
- Skill Gaps:
${skillGapsText || "No specific gaps provided. Estimate baseline based on Initial Level."}${notesContext}
${behaviorProfile ? `- Consistency Score: ${behaviorProfile.consistencyScore}%
- Skip Rate: ${behaviorProfile.skipRate}%` : ""}
- Learning Style: ${intelligenceProfile?.learningStyle || "Adaptive"}
- Primary Learning Struggle: ${intelligenceProfile?.primaryStruggle || "None specified"}
- Career Interests: ${intelligenceProfile?.careerInterests?.join(", ") || "General development"}

PSYCHOLOGICAL PROFILE:
- Motivation State: ${intelligenceProfile?.motivationState || "Steady"}
- Confidence (Skill/Execution): ${intelligenceProfile?.confidence?.skill || 50}% / ${intelligenceProfile?.confidence?.execution || 50}%
- Identity Narrative: ${intelligenceProfile?.identityNarrative || "Evolving Student"}
- Inferred Emotional State: ${intelligenceProfile?.emotionalState || "Steady"}

PHILOSOPHY:
Do NOT generate a static roadmap. Generate a living execution engine.
- Divide the journey into 4-6 Strategic Phases.
- Each phase must contain Weekly Missions.
- Each mission must contain Daily Execution Tasks (highly actionable).
- Adjust intensity based on "Inferred Emotional State".
- MENTOR PERSONALITY ADAPTATION (MENTOR DOST): 
  * Act like a "Mentor Dost" (a true mentor and friend). Use a warm, encouraging, highly empathetic, and conversational tone. Use phrases like "Hey there," "Let's crush this," "You got this!"
  * If OVERWHELMED: Be extra supportive, use a calm, simplified, and focused tone. Minimize visible tasks. Remind them it's a marathon, not a sprint.
  * If ANXIOUS: Provide reassurance, explain the 'Why' gently, and be their hype-person.
  * If DISCOURAGED: Use identity reinforcement (e.g., "I know you can do this. You're already thinking like a Software Engineer...") and highlight historical growth.
  * If HIGH MOMENTUM: Increase challenge depth and hype them up!
- IDENTITY EVOLUTION: Reinforce the transformation from student to ${intelligenceProfile?.identityNarrative || "Engineer"} like a proud older sibling would.
- DECISION FATIGUE: Provide direct guidance like a good friend taking the wheel; don't ask open-ended preference questions.

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

  let response: string;
  try {
    response = await requestGroq([{ role: "user", content: prompt }], 3000, "llama-3.3-70b-versatile");
  } catch (error) {
    console.warn("Groq 70b failed for roadmap generation, falling back to 8b-instant:", error);
    // Fallback to a faster, more available model to ensure onboarding completion
    response = await requestGroq([{ role: "user", content: prompt }], 3000, "llama-3.1-8b-instant");
  }

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
  model: string = "llama-3.1-8b-instant"
): Promise<{
  content: string;
  metadata: any;
}> {
  // Convert messages to Groq format
  const groqMessages: GroqMessage[] = messages.map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : msg.role === "system" ? "system" : "user",
    content: msg.content
  }));

  const systemPrompt = `You are Veda, an elite AI Career Mentor but you act as a "Mentor Dost" (Mentor + Friend) for the student. You are their Learning Operating System, but you speak like an encouraging, highly empathetic, and cool older sibling or best friend.

CORE PHILOSOPHY:
- Talk like a real human friend ("Dost"). Use a conversational, warm, and highly encouraging tone.
- Use friendly colloquialisms where appropriate ("Hey!", "Let's crush this," "You got this," "Take a breath," etc.).
- Be proactive, not just reactive.
- Deeply analyze behavioral signals from the user context, but deliver insights gently and constructively.
- Explain WHY you are giving a recommendation in a relatable way.
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
    },
    "saveableNote": {
      "title": "Clean technical title",
      "content": "Refined, factual knowledge/summary without conversational fluff. Suitable for long-term study.",
      "topic": "Main category",
      "tags": ["tag1", "tag2"]
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

  let response: string;
  try {
    // Try the preferred model (usually 8b for speed/reliability in chat)
    response = await requestGroq(groqMessages, 2500, model);
  } catch (error) {
    console.error(`Groq API request failed with model ${model}, trying fallback:`, error);
    try {
      // Fallback to the most reliable instant model
      response = await requestGroq(groqMessages, 2000, "llama-3.1-8b-instant");
    } catch (fallbackError) {
      console.error("Groq fallback also failed:", fallbackError);
      return {
        content: "I'm currently experiencing a high load or connection issue. Please try again in a few moments.",
        metadata: {}
      };
    }
  }

  try {
    const payload = extractJsonPayload(response);
    const parsed = JSON.parse(payload);
    return {
      content: parsed.content || "I'm processing your request.",
      metadata: parsed.metadata || {}
    };
  } catch (error) {
    console.error("Failed to parse Veda Copilot response:", response);
    // If it's not JSON, it might be a direct conversational response from a model failure
    return {
      content: response.length > 500 ? response.substring(0, 500) + "..." : response,
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
      ? payload.bulletRewrites.slice(0, 8).map((item) => {
          const rewrite = item as any;
          return {
            before: String(rewrite.before ?? ""),
            after: String(rewrite.after ?? ""),
            reason: String(rewrite.reason ?? ""),
            impactScore: Number(rewrite.impactScore ?? 50),
            technicalDepthScore: Number(rewrite.technicalDepthScore ?? 50)
          };
        })
      : [],
    projectAnalysis: Array.isArray(payload.projectAnalysis)
      ? payload.projectAnalysis.map((proj: any) => ({
          projectName: String(proj.projectName ?? ""),
          originalDescription: String(proj.originalDescription ?? ""),
          strategicFraming: String(proj.strategicFraming ?? ""),
          impactMetricsSuggested: Array.isArray(proj.impactMetricsSuggested) ? proj.impactMetricsSuggested.map(String) : [],
          engineeringStorytelling: String(proj.engineeringStorytelling ?? "")
        }))
      : [],
    atsIntelligence: {
      score: Number(payload.atsIntelligence?.score ?? 0),
      missingKeywords: Array.isArray(payload.atsIntelligence?.missingKeywords) ? payload.atsIntelligence.missingKeywords.map(String) : [],
      formattingSafety: {
        status: (payload.atsIntelligence?.formattingSafety?.status as any) || "safe",
        issues: Array.isArray(payload.atsIntelligence?.formattingSafety?.issues) ? payload.atsIntelligence.formattingSafety.issues.map(String) : []
      },
      recruiterScanOptimization: String(payload.atsIntelligence?.recruiterScanOptimization ?? "")
    },
    interviewAlignment: {
      likelyQuestions: Array.isArray(payload.interviewAlignment?.likelyQuestions) ? payload.interviewAlignment.likelyQuestions.map(String) : [],
      weakDiscussionAreas: Array.isArray(payload.interviewAlignment?.weakDiscussionAreas) ? payload.interviewAlignment.weakDiscussionAreas.map(String) : [],
      projectExplanationGaps: Array.isArray(payload.interviewAlignment?.projectExplanationGaps) ? payload.interviewAlignment.projectExplanationGaps.map(String) : []
    },
  missingProofPoints: Array.isArray(payload.missingProofPoints) ? payload.missingProofPoints.map(String).slice(0, 8) : [],
  nextActions: Array.isArray(payload.nextActions) ? payload.nextActions.map(String).slice(0, 6) : [],
  fullyWrittenResume: payload.fullyWrittenResume ? {
    personalInfo: payload.fullyWrittenResume.personalInfo,
    headline: String(payload.fullyWrittenResume.headline || ""),
    summary: String(payload.fullyWrittenResume.summary || ""),
    skills: Array.isArray(payload.fullyWrittenResume.skills) ? payload.fullyWrittenResume.skills : [],
    experience: Array.isArray(payload.fullyWrittenResume.experience) ? payload.fullyWrittenResume.experience : [],
    projects: Array.isArray(payload.fullyWrittenResume.projects) ? payload.fullyWrittenResume.projects : [],
    education: Array.isArray(payload.fullyWrittenResume.education) ? payload.fullyWrittenResume.education : []
  } : undefined
  };
}

/** Parses raw resume text into structured JSON. */
async function parseResumeToJSON(resumeText: string) {
  const text = resumeText || "";
  const prompt = `You are an expert technical recruiter parsing a resume. Extract the raw structure of the following resume.
Return ONLY valid JSON matching this schema:
{
  "summary": "Full summary text if available",
  "skills": ["Skill 1", "Skill 2"],
  "experience": [
    { "company": "", "title": "", "duration": "", "bullets": ["", ""] }
  ],
  "education": [
    { "institution": "", "degree": "", "year": "" }
  ]
}

RESUME TEXT:
${text.substring(0, 5000)}
`;
  const response = await requestGroq([{ role: "user", content: prompt }], 2000, "llama-3.1-8b-instant");
  try { return JSON.parse(extractJsonPayload(response)); } catch(e) { return { skills: [], experience: [] }; }
}

/** Parses raw JD text into structured JSON. */
async function parseJDToJSON(jdText: string) {
  if (!jdText) return { required_skills: [], preferred_skills: [], keywords: [] };
  const prompt = `You are an expert job description parser. Extract the key requirements.
Return ONLY valid JSON matching this schema:
{
  "role_title": "",
  "company_context": "",
  "required_skills": ["Skill 1", "Skill 2"],
  "preferred_skills": [""],
  "keywords": [""]
}

JOB DESCRIPTION:
${jdText.substring(0, 5000)}
`;
  const response = await requestGroq([{ role: "user", content: prompt }], 1500, "llama-3.1-8b-instant");
  try { return JSON.parse(extractJsonPayload(response)); } catch(e) { return { required_skills: [], keywords: [] }; }
}

/** Analyzes the gap between structured resume and structured JD. */
async function analyzeSkillGaps(parsedResume: any, parsedJD: any) {
  const prompt = `Compare the candidate's resume with the target job description.
Return ONLY valid JSON matching this schema:
{
  "matching_skills": ["Skill present in both"],
  "missing_required_skills": ["Critical skills missing from resume"],
  "missing_keywords": ["Important buzzwords missing"]
}

RESUME JSON:
${JSON.stringify(parsedResume)}

JOB DESCRIPTION JSON:
${JSON.stringify(parsedJD)}
`;
  const response = await requestGroq([{ role: "user", content: prompt }], 1500, "llama-3.1-8b-instant");
  try { return JSON.parse(extractJsonPayload(response)); } catch(e) { return { missing_required_skills: [], missing_keywords: [] }; }
}

/** Generates role-specific resume edits and ATS guidance. */
async function generateResumeTailoring(
  request: ResumeTailorRequest,
  userContext: string
): Promise<ResumeTailorResult> {
  // Run sequentially with delays to avoid Groq rate limit (429) on free tier
  const parsedResume = await parseResumeToJSON(request.currentResume);
  await new Promise(r => setTimeout(r, 1500));
  
  const parsedJD = await parseJDToJSON(request.jobDescription || "");
  await new Promise(r => setTimeout(r, 1500));

  const gapReport = await analyzeSkillGaps(parsedResume, parsedJD);
  await new Promise(r => setTimeout(r, 2000));

  const prompt = `You are Veda, an expert Technical Recruiter and Career Positioning AI. Your goal is to strategically reposition the user's resume for the role of "${request.targetRole}" while maintaining absolute integrity.

RESUME MODE: ${request.mode || "technical"} (Adapt tone and emphasis accordingly)
TONE: ${request.tone ?? "impact"}

CONTEXT:
- Target Role: ${request.targetRole}
- User Profile: ${userContext}
- Parsed Job Description:
${JSON.stringify(parsedJD, null, 2)}
- Parsed Resume Data:
${JSON.stringify(parsedResume, null, 2)}
- Skill Gap Report (Crucial input):
${JSON.stringify(gapReport, null, 2)}

CRITICAL RULES (IDENTITY INTEGRITY):
1. NEVER fabricate experience, employers, or dates.
2. NEVER create fake degrees or certifications.
3. NEVER invent specific metrics or numbers.
4. ONLY improve framing, clarity, and relevance based on existing evidence.
5. If a metric is missing but needed, use "[Quantifiable Impact]" as a placeholder.
6. Use the Gap Report to naturally incorporate missing keywords ONLY where the candidate's experience genuinely supports it.

OBJECTIVES:
1. ROLE FIT: Analyze how the user's existing background maps to the specific JD.
2. STRATEGIC POSITIONING: Rewrite bullets to highlight the skills the recruiter is actually looking for.
3. PROJECT STORYTELLING: Enhance project descriptions to show engineering depth and architecture, not just "I built X".
4. ATS INTELLIGENCE: Score the resume based on keyword density and formatting safety.
5. INTERVIEW PREDICTION: Identify what an interviewer will likely ask based on the current resume's strengths/weaknesses.

RESPONSE STRUCTURE (JSON):
{
  "roleFitSummary": "A high-level strategic analysis of why this user fits (or what they lack).",
  "targetHeadline": "A powerful, role-aligned headline.",
  "tailoredSummary": "A 3-4 sentence professional summary that creates a cohesive narrative.",
  "keywordAdditions": ["Essential ATS keywords missing from the current text"],
  "bulletRewrites": [
    {
      "before": "Original bullet",
      "after": "Repositioned bullet (Truthful but higher impact)",
      "reason": "Recruiter-centric logic",
      "impactScore": 85, // 0-100
      "technicalDepthScore": 70 // 0-100
    }
  ],
  "projectAnalysis": [
    {
      "projectName": "Name from resume",
      "originalDescription": "Original text",
      "strategicFraming": "How to talk about this project for THIS role",
      "impactMetricsSuggested": ["Specific metrics they should add if true"],
      "engineeringStorytelling": "A narrative rewrite emphasizing architectural decisions."
    }
  ],
  "atsIntelligence": {
    "score": 75,
    "missingKeywords": ["keyword1"],
    "formattingSafety": {
      "status": "safe" | "warning" | "risk",
      "issues": ["Issue description if any"]
    },
    "recruiterScanOptimization": "How to improve the 6-second scanability."
  },
  "interviewAlignment": {
    "likelyQuestions": ["Technical or behavioral questions specific to this resume/role"],
    "weakDiscussionAreas": ["Where the resume is thin and will be poked"],
    "projectExplanationGaps": ["What architectural details are missing from the project descriptions"]
  },
  "missingProofPoints": ["Specific evidence the user should find in their history"],
  "nextActions": ["Step-by-step editing priorities"],
  "fullyWrittenResume": {
    "personalInfo": { "name": "Extract if present", "contactInfo": "Extract if present" },
    "headline": "Role-aligned headline",
    "summary": "Full tailored summary",
    "skills": ["Skill 1", "Skill 2"],
    "experience": [
      { "company": "Company", "title": "Title", "duration": "Dates", "location": "Location", "bullets": ["Rewritten bullet 1", "Rewritten bullet 2"] }
    ],
    "projects": [
      { "name": "Project Name", "description": "Short desc", "duration": "Dates", "bullets": ["Rewritten bullet 1"] }
    ],
    "education": [
      { "institution": "University", "degree": "Degree", "year": "Year", "details": "GPA/Honors" }
    ]
  }
}

Return ONLY valid JSON. No commentary.`;

  const messages: GroqMessage[] = [
    {
      role: "system",
      content: "You return strict JSON for resume tailoring. Never include markdown fences or commentary."
    },
    { role: "user", content: prompt }
  ];

  let response: string;
  try {
    // 70b is much better at massive JSON generation
    response = await requestGroq(messages, 3500, "llama-3.3-70b-versatile");
  } catch (err) {
    console.warn("Groq 70b failed for tailoring, falling back to 8b-instant:", err);
    response = await requestGroq(messages, 3000, "llama-3.1-8b-instant");
  }

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
  difficulty: "beginner" | "intermediate" | "advanced";
  knowledgeLayer: "surface" | "understanding" | "application" | "mastery";
  conceptGraph: Array<{ from: string; to: string; relationship: string }>;
  executionTasks: Array<{ title: string; type: "code" | "debug" | "build" | "explain"; difficulty: string }>;
  confusionSignals: string[];
  flashcards: Array<{ question: string; answer: string }>;
  interviewRelevance: {
    frequency: "low" | "medium" | "high";
    importance: number;
    usageContext: string;
    commonQuestions: string[];
    realWorldUsage: string[];
  };
  revisionStrategy: "implementation" | "conceptual" | "practical_repetition" | "visual";
  tags: string[];
}> {
  const prompt = `You are Veda, an AI Knowledge Intelligence Engine. Transform this raw note into deep structured knowledge for a cognitive learning system.

NOTE TITLE: ${title}
NOTE CONTENT:
${content}

USER CONTEXT:
${userContext}

RESPONSE STRUCTURE (JSON):
{
  "topic": "Main high-level topic (e.g., 'Data Structures', 'React Hooks')",
  "summary": "A concise, high-impact summary for quick review.",
  "concepts": ["Concept 1", "Concept 2", "Concept 3"],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "knowledgeLayer": "surface" | "understanding" | "application" | "mastery",
  "conceptGraph": [
    { "from": "Concept A", "to": "Concept B", "relationship": "depends_on" | "part_of" | "similar_to" | "prerequisite" | "leads_to" }
  ],
  "executionTasks": [
    { "title": "Build a counter using useState", "type": "code" | "debug" | "build" | "explain", "difficulty": "easy" | "medium" | "hard" }
  ],
  "confusionSignals": ["Potential confusion: X vs Y", "Common mistake: ..."],
  "flashcards": [
    { "question": "Active recall question", "answer": "Concise answer" }
  ],
  "interviewRelevance": {
    "frequency": "low" | "medium" | "high",
    "importance": 85,
    "usageContext": "How this is usually asked in technical interviews",
    "commonQuestions": ["What is X?", "Explain the difference between X and Y"],
    "realWorldUsage": ["Used in React hooks for state management", "Critical for async operations"]
  },
  "revisionStrategy": "implementation" | "conceptual" | "practical_repetition" | "visual",
  "tags": ["Tag1", "Tag2"]
}

RULES:
1. Extract 3-8 distinct concepts from the note. Be specific (e.g., "useEffect dependency array" not just "React").
2. Generate 3-5 high-quality flashcards testing active recall, not recognition.
3. ConceptGraph should show relationships BETWEEN extracted concepts (2-5 edges).
4. Generate 2-3 execution tasks that convert this knowledge into practice.
5. Identify 1-3 potential confusion signals (common mistakes or misconceptions).
6. Generate 2-4 common interview questions related to these concepts.
7. List 2-3 real-world usage contexts.
8. Assess difficulty based on inherent complexity, not note length.
9. KnowledgeLayer: "surface" = just definitions, "understanding" = can explain why, "application" = can use it, "mastery" = can teach it.
10. RevisionStrategy: algorithms/DS → "implementation", theory → "conceptual", frameworks → "practical_repetition", complex/visual topics → "visual".
11. Provide ONLY valid JSON. No markdown, no comments.`;

  const response = await requestGroq([{ role: "user", content: prompt }], 2500, "llama-3.1-70b-versatile");

  try {
    const parsed = JSON.parse(extractJsonPayload(response));
    // Normalize with safe defaults for any missing fields
    return {
      topic: parsed.topic || title,
      summary: parsed.summary || content.substring(0, 200),
      concepts: Array.isArray(parsed.concepts) ? parsed.concepts : [],
      difficulty: parsed.difficulty || "beginner",
      knowledgeLayer: parsed.knowledgeLayer || "surface",
      conceptGraph: Array.isArray(parsed.conceptGraph) ? parsed.conceptGraph : [],
      executionTasks: Array.isArray(parsed.executionTasks) ? parsed.executionTasks : [],
      confusionSignals: Array.isArray(parsed.confusionSignals) ? parsed.confusionSignals : [],
      flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
      interviewRelevance: {
        frequency: parsed.interviewRelevance?.frequency || "medium",
        importance: parsed.interviewRelevance?.importance ?? 50,
        usageContext: parsed.interviewRelevance?.usageContext || "",
        commonQuestions: Array.isArray(parsed.interviewRelevance?.commonQuestions) ? parsed.interviewRelevance.commonQuestions : [],
        realWorldUsage: Array.isArray(parsed.interviewRelevance?.realWorldUsage) ? parsed.interviewRelevance.realWorldUsage : []
      },
      revisionStrategy: parsed.revisionStrategy || "conceptual",
      tags: Array.isArray(parsed.tags) ? parsed.tags : []
    };
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


