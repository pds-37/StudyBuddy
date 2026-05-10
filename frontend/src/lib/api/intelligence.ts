import { apiClient } from "./client";
import type {
  KnowledgeHealthMetrics,
  RevisionPriority,
  ConceptNode,
  MemoryDecayState
} from "@studybuddy/shared";

/** Fetches the Knowledge Health Dashboard metrics. */
export async function getKnowledgeHealth(): Promise<KnowledgeHealthMetrics> {
  const response = await apiClient.get<KnowledgeHealthMetrics>("/intelligence/health");
  return response.data;
}

/** Fetches today's prioritized revision list. */
export async function getRevisionPriorities(limit: number = 8): Promise<RevisionPriority[]> {
  const response = await apiClient.get<{ priorities: RevisionPriority[] }>(
    "/intelligence/revision-priorities",
    { params: { limit } }
  );
  return response.data.priorities;
}

/** Fetches all concept nodes with retention states. */
export async function getConcepts(): Promise<ConceptNode[]> {
  const response = await apiClient.get<{ concepts: ConceptNode[] }>("/intelligence/concepts");
  return response.data.concepts;
}

/** Fetches memory decay states for all notes. */
export async function getDecayStates(): Promise<MemoryDecayState[]> {
  const response = await apiClient.get<{ states: MemoryDecayState[] }>("/intelligence/decay-states");
  return response.data.states;
}

/** Fetches learning momentum and today's focus. */
export async function getMomentum(): Promise<{
  state: string;
  streakDays: number;
  reviewedToday: number;
  dailyTarget: number;
  focusConcepts: string[];
  estimatedMinutes: number;
}> {
  const response = await apiClient.get("/intelligence/momentum");
  return response.data;
}

export type StudentIntelligenceProfile = {
  userId: string;
  targetRoles: string[];
  activeTracks: string[];
  roadmapState: Record<string, unknown>;
  roadmapProgress: number;
  skillConfidenceMap: Record<string, number>;
  skillGapMap: Record<string, number>;
  recallHealth: number;
  memoryRetention: number;
  knowledgeGraph: {
    nodes: Array<Record<string, unknown>>;
    edges: Array<Record<string, unknown>>;
    highLeverageSkills: Array<{ name: string; score: number }>;
  };
  projectDepth: number;
  executionStrength: "beginner" | "medium" | "advanced";
  interviewReadiness: number;
  resumeState: Record<string, unknown>;
  ATSReadiness: number;
  consistencyScore: number;
  learningVelocity: number;
  cognitiveLoad: number;
  burnoutRisk: number;
  emotionalState: string;
  confidenceLevel: number;
  jobReadiness: number;
  opportunityAlignment: number;
  preferredLearningStyle: string;
  weakConcepts: string[];
  strongConcepts: string[];
  behavioralPatterns: Record<string, unknown>;
  adaptiveDifficulty: "recovery" | "easy" | "balanced" | "stretch";
  dailyIntelligence: Record<string, unknown>;
  systemMemory: Record<string, unknown>;
};

export type StudentIntelligenceEvent = {
  id?: string;
  _id?: string;
  userId: string;
  type: string;
  source: string;
  entityId?: string;
  payload: Record<string, unknown>;
  impact: Record<string, unknown>;
  createdAt: string;
  processedAt?: string;
};

export type DailyIntelligence = {
  priorities: Array<{ type: string; title: string; reason: string; weight: number }>;
  adaptiveDifficulty: StudentIntelligenceProfile["adaptiveDifficulty"];
  mentorTone: string;
  cognitiveLoad: number;
  burnoutRisk: number;
  weakConcepts: string[];
  jobReadiness: number;
};

export type UnifiedSearchResult = {
  type: "note" | "concept" | "roadmap" | "project" | "resume";
  id: string;
  title: string;
  excerpt: string;
};

/** Fetches the central Student Intelligence Profile. */
export async function getStudentIntelligenceProfile(): Promise<StudentIntelligenceProfile> {
  const response = await apiClient.get<{ profile: StudentIntelligenceProfile }>("/intelligence/profile");
  return response.data.profile;
}

/** Forces a profile rebuild from all connected modules. */
export async function refreshStudentIntelligenceProfile(): Promise<StudentIntelligenceProfile> {
  const response = await apiClient.post<{ profile: StudentIntelligenceProfile }>("/intelligence/profile/refresh");
  return response.data.profile;
}

/** Fetches recent cross-system intelligence events. */
export async function getStudentIntelligenceTimeline(limit = 30): Promise<StudentIntelligenceEvent[]> {
  const response = await apiClient.get<{ events: StudentIntelligenceEvent[] }>("/intelligence/timeline", {
    params: { limit }
  });
  return response.data.events;
}

/** Fetches today's adaptive intelligence plan. */
export async function getDailyIntelligence(): Promise<DailyIntelligence> {
  const response = await apiClient.get<DailyIntelligence>("/intelligence/daily");
  return response.data;
}

/** Searches across notes, concepts, roadmap, projects, and resume memory. */
export async function searchUnifiedIntelligence(query: string): Promise<UnifiedSearchResult[]> {
  const response = await apiClient.get<{ results: UnifiedSearchResult[] }>("/intelligence/search", {
    params: { q: query }
  });
  return response.data.results;
}
