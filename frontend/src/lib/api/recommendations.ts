import { apiClient } from "./client";
import type { MentorTask } from "@studybuddy/shared";

export type RecommendedTaskData = Omit<Partial<MentorTask>, "type"> & {
  _id?: string;
  roadmapId?: string;
  scheduledAt?: string;
  type?: MentorTask["type"] | "study" | "revision" | "quiz";
};

export type RecommendedMemoryData = {
  id?: string;
  _id?: string;
  topic?: string;
  title?: string;
  nextReview?: string;
};

export type NextBestAction =
  | {
      action: "task";
      reason: string;
      data: RecommendedTaskData | null;
    }
  | {
      action: "revision";
      reason: string;
      data: RecommendedMemoryData | null;
    }
  | {
      action: "generate" | "recalibrate";
      reason: string;
      data: null;
    };

export interface RawNextBestAction {
  action: "task" | "revision" | "generate" | "recalibrate";
  reason: string;
  data: unknown;
}

export const getNextBestAction = async (): Promise<NextBestAction> => {
  const response = await apiClient.get<RawNextBestAction>("/recommendations/next-best-action");

  if (response.data.action === "task") {
    return {
      action: "task",
      reason: response.data.reason,
      data: response.data.data && typeof response.data.data === "object"
        ? response.data.data as RecommendedTaskData
        : null
    };
  }

  if (response.data.action === "revision") {
    return {
      action: "revision",
      reason: response.data.reason,
      data: response.data.data && typeof response.data.data === "object"
        ? response.data.data as RecommendedMemoryData
        : null
    };
  }

  return {
    action: response.data.action,
    reason: response.data.reason,
    data: null
  };
};
