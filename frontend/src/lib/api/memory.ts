import { apiClient } from "./client";

export async function registerConfidence(noteId: string, confidence: number) {
  const response = await apiClient.post("/memory/confidence", { noteId, confidence });
  return response.data;
}
