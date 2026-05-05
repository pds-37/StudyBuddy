import { apiClient } from "./client";

export interface BehaviorProfile {
  consistencyScore: number;
  skipRate: number;
  avgSessionTime: number;
  preferredStudyTime: string;
}

export async function logBehavior(action: string, metadata: Record<string, any> = {}) {
  const { data } = await apiClient.post("/behavior/log", { action, metadata });
  return data;
}

export async function getBehaviorProfile(): Promise<BehaviorProfile> {
  const { data } = await apiClient.get<BehaviorProfile>("/behavior/profile");
  return data;
}
