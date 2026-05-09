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
