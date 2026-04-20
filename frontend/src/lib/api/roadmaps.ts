import { apiClient } from "./client";
import type { Roadmap, RoadmapMilestoneStatus } from "@studybuddy/shared";

type RoadmapResponse = {
  roadmap: Roadmap;
};

type GenerateRoadmapRequest = {
  targetRole: string;
  timelineWeeks: number;
  skillGaps: Array<{ skill: string; gapScore: number }>;
};

type UpdateMilestoneRequest = {
  status: RoadmapMilestoneStatus;
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

/** Updates a milestone's status. */
export async function updateMilestone(milestoneId: string, status: RoadmapMilestoneStatus): Promise<Roadmap> {
  const response = await apiClient.put<RoadmapResponse>(`/roadmaps/milestones/${milestoneId}`, { status });
  return response.data.roadmap;
}
