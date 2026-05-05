import { apiClient } from "./client";

export type KnowledgeNode = {
  id: string;
  type: "note" | "skill" | "milestone";
  label: string;
  val: number;
};

export type KnowledgeLink = {
  source: string;
  target: string;
};

export type KnowledgeGraphData = {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
};

export async function getKnowledgeGraph(): Promise<KnowledgeGraphData> {
  const response = await apiClient.get<KnowledgeGraphData>("/knowledge/graph");
  return response.data;
}
