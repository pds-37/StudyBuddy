import { apiClient } from "./client";
import type { Roadmap, RoadmapTaskStatus } from "@studybuddy/shared";

type RoadmapResponse = {
  roadmap: Roadmap;
};

type GenerateRoadmapRequest = {
  targetRole: string;
  timelineWeeks: number;
  skillGaps: Array<{ skill: string; gapScore: number }>;
  trackId?: string;
  category?: string;
  priorityWeight?: number;
};

/** Generates a roadmap from the user's current skill gaps. */
export async function generateRoadmapFromGaps(timelineWeeks?: number): Promise<Roadmap> {
  const params = timelineWeeks ? { timelineWeeks } : {};
  const response = await apiClient.get<RoadmapResponse>("/roadmaps/generate-from-gaps", { params });
  return response.data.roadmap;
}

/** Generates a custom roadmap with provided parameters. */
export async function generateRoadmap(data: GenerateRoadmapRequest): Promise<Roadmap> {
  const response = await apiClient.post<RoadmapResponse>("/roadmaps/generate", data);
  return response.data.roadmap;
}

/** Retrieves the user's current roadmap. */
export async function getRoadmap(): Promise<Roadmap | null> {
  try {
    const response = await apiClient.get<RoadmapResponse>("/roadmaps");
    return response.data.roadmap;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/** Retrieves all active roadmaps for the user. */
export async function getUserRoadmaps(): Promise<Roadmap[]> {
  const response = await apiClient.get<{ roadmaps: Roadmap[] }>("/roadmaps/all");
  return response.data.roadmaps;
}

/** Expands the user's learning journey with a new career track. */
export async function expandRoadmap(data: {
  newInterest: string;
  expansionReason: string;
  priorityWeight: number;
  initialTrackLevel: string;
}): Promise<Roadmap> {
  const response = await apiClient.post<RoadmapResponse>("/roadmaps/expand", data);
  return response.data.roadmap;
}

/** Updates a task's status. */
export async function updateTaskStatus(taskId: string, status: RoadmapTaskStatus): Promise<Roadmap> {
  const response = await apiClient.patch<RoadmapResponse>(`/roadmaps/tasks/${taskId}`, { status });
  return response.data.roadmap;
}

/** Submits a rating and feedback for a roadmap. */
export async function rateRoadmap(roadmapId: string, rating: number, feedback?: string) {
  const { data } = await apiClient.patch<{ roadmap: Roadmap }>(`/roadmaps/${roadmapId}/rate`, {
    rating,
    feedback
  });
  return data.roadmap;
}

/** Injects an externally learned skill. */
export async function injectSkill(data: { skill: string }): Promise<Roadmap> {
  const response = await apiClient.post<RoadmapResponse>("/roadmaps/inject-skill", data);
  return response.data.roadmap;
}
