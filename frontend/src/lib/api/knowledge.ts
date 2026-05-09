import { apiClient } from "./client";

export type KnowledgeNode = {
  id: string;
  type: "concept" | "note" | "skill" | "milestone";
  label: string;
  val: number;
  retentionState?: "strong" | "stable" | "weakening" | "critical";
  retentionScore?: number;
  category?: string;
  difficulty?: string;
  interviewFrequency?: string;
  noteCount?: number;
};

export type KnowledgeLink = {
  source: string;
  target: string;
  relationship?: string;
  strength?: number;
};

export type KnowledgeGraphData = {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    strongConcepts: number;
    criticalConcepts: number;
    isolatedConcepts: number;
    avgRetention: number;
  };
};

export type ConceptDetail = {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  retentionState: string;
  retentionScore: number;
  interviewFrequency: string;
  masteryValidated: boolean;
  executionEvidence: number;
  noteCount: number;
  relatedConceptCount: number;
  linkedNotes: Array<{ id: string; title: string; strength: number }>;
  relatedConcepts: Array<{ id: string; name: string; retentionState: string }>;
  lastReviewed?: string;
};

export type InterviewReadiness = {
  overallScore: number;
  criticalGaps: Array<{ name: string; retentionState: string; retentionScore: number }>;
  strongAreas: Array<{ name: string; retentionScore: number }>;
  topicBreakdown: Array<{ category: string; count: number; avgRetention: number }>;
};

export async function getKnowledgeGraph(): Promise<KnowledgeGraphData> {
  const response = await apiClient.get<KnowledgeGraphData>("/knowledge/graph");
  return response.data;
}

export async function getConceptDetail(conceptId: string): Promise<ConceptDetail> {
  const response = await apiClient.get<ConceptDetail>(`/knowledge/concepts/${conceptId}`);
  return response.data;
}

export async function getInterviewReadiness(): Promise<InterviewReadiness> {
  const response = await apiClient.get<InterviewReadiness>("/knowledge/interview-readiness");
  return response.data;
}
