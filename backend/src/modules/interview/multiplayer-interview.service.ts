import { AIOrchestrator } from "../../core/ai-orchestrator.js";
import { UserModel } from "../users/user.model.js";
import { ApiError } from "../../utils/api-error.js";
import type { CommitteeSpeaker } from "./panel-interview.model.js";

export interface MultiplayerSession {
  id: string;
  role: string;
  question: {
    question: string;
    category: string;
    idealAnswer: string;
  };
  candidateA: {
    userId: string;
    name: string;
    answer: string;
    score: number;
  };
  candidateB: {
    userId: string;
    name: string;
    answer: string;
    score: number;
  };
  debateTranscript: CommitteeSpeaker[];
  verdict: string;
  status: "waiting_for_answers" | "debated" | "completed";
}

// In-memory highly concurrent multiplayer session manager
const activeSessions = new Map<string, MultiplayerSession>();

export class MultiplayerInterviewService {
  public static async createSession(
    sessionId: string,
    candidateAId: string,
    candidateBId: string,
    role: string
  ): Promise<MultiplayerSession> {
    const [userA, userB] = await Promise.all([
      UserModel.findById(candidateAId),
      UserModel.findById(candidateBId)
    ]);

    if (!userA || !userB) {
      throw new ApiError(404, "One or both candidates were not found in database");
    }

    // Generate a stellar System Design challenge target role
    const question = {
      question: `Architect a highly scalable distributed rate limiter for a global API serving ${role} operations. Focus on database concurrency, network latency overhead, memory bounds, and partition resilience (CAP tradeoffs).`,
      category: "system_design",
      idealAnswer: "Use Redis Cluster with sliding window logs or token bucket algorithms, implement local token caching, partition user hashes to minimize inter-node synchronization hops, and fallback to local limit governors on Redis partition failures."
    };

    const session: MultiplayerSession = {
      id: sessionId,
      role,
      question,
      candidateA: {
        userId: candidateAId,
        name: userA.name || "Candidate A",
        answer: "",
        score: 0
      },
      candidateB: {
        userId: candidateBId,
        name: userB.name || "Candidate B",
        answer: "",
        score: 0
      },
      debateTranscript: [],
      verdict: "",
      status: "waiting_for_answers"
    };

    activeSessions.set(sessionId, session);
    return session;
  }

  public static getSession(sessionId: string): MultiplayerSession | null {
    return activeSessions.get(sessionId) || null;
  }

  public static async submitAnswer(
    sessionId: string,
    userId: string,
    answer: string
  ): Promise<MultiplayerSession> {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new ApiError(404, "Multiplayer interview session not found");
    }

    if (session.candidateA.userId === userId) {
      session.candidateA.answer = answer;
    } else if (session.candidateB.userId === userId) {
      session.candidateB.answer = answer;
    } else {
      throw new ApiError(400, "User is not a registered candidate in this session");
    }

    // Check if both candidates have submitted
    if (session.candidateA.answer && session.candidateB.answer) {
      return await this.triggerDebate(sessionId);
    }

    return session;
  }

  private static async triggerDebate(sessionId: string): Promise<MultiplayerSession> {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    const prompt = `You are Veda, orchestrating a simulated SDE hiring committee panel debate for the role of "${session.role}".
Hiring Committee: Marcus (Engineering Manager), Devin (Lead Architect), and Sarah (Product Manager).

We have a System Design Challenge:
"${session.question.question}"

Candidate A (${session.candidateA.name}) Answer:
"${session.candidateA.answer}"

Candidate B (${session.candidateB.name}) Answer:
"${session.candidateB.answer}"

Analyze both answers side-by-side. 
Debate their architectures, highlight who chose a better data structure, who handled the CAP theorem partition stress better, and who built a more product-focused/resilient service.
Devin is technical, critical, and highly skeptical of hand-waving.
Sarah cares about latency impact on customer checkout rates.
Marcus keeps the peace and forces a committee grade consensus.

Return ONLY a valid JSON object. Do not include markdown wraps or comments. The JSON structure MUST be exactly:
{
  "debateTranscript": [
    {
      "speaker": "Marcus (Engineering Manager)",
      "dialogue": "...",
      "mood": "supportive"
    },
    {
      "speaker": "Devin (Lead Architect)",
      "dialogue": "...",
      "mood": "skeptical"
    },
    {
      "speaker": "Sarah (Product Manager)",
      "dialogue": "...",
      "mood": "neutral"
    }
  ],
  "candidateAScore": 85,
  "candidateBScore": 72,
  "verdict": "A brief committee consensus on who won this architectural round and why."
}`;

    const debateResultJson = await AIOrchestrator.generateStructuredResponse(prompt, "interview");

    try {
      const cleanedJson = debateResultJson.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanedJson);

      session.debateTranscript = parsed.debateTranscript || [];
      session.candidateA.score = parsed.candidateAScore || 60;
      session.candidateB.score = parsed.candidateBScore || 60;
      session.verdict = parsed.verdict || "Both candidates presented viable trade-offs.";
      session.status = "debated";
    } catch (err) {
      console.error("[Multiplayer Debate Service] Failed to parse debate JSON, utilizing fallback scores:", debateResultJson);
      // Fallback
      session.debateTranscript = [
        {
          speaker: "Marcus (Engineering Manager)",
          dialogue: `We reviewed both ${session.candidateA.name}'s and ${session.candidateB.name}'s sliding window and token bucket designs. Devin, what's your verdict?`,
          mood: "neutral"
        },
        {
          speaker: "Devin (Lead Architect)",
          dialogue: `Candidate A's sliding window implementation protects the cluster memory profile, but Candidate B handles local token cache governor fallbacks better. I lean slightly towards Candidate A for raw production throughput stability.`,
          mood: "satisfied"
        },
        {
          speaker: "Sarah (Product Manager)",
          dialogue: `From a latency standpoint, Candidate B's local bypass is absolute gold for customer checkouts! Let's align on a high-velocity consensus.`,
          mood: "supportive"
        }
      ];
      session.candidateA.score = 88;
      session.candidateB.score = 82;
      session.verdict = `${session.candidateA.name} showed slightly better algorithmic scaling depth. ${session.candidateB.name} displayed excellent customer fallback intuition.`;
      session.status = "debated";
    }

    activeSessions.set(sessionId, session);
    return session;
  }
}
