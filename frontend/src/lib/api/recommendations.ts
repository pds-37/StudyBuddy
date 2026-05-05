import { apiClient } from "./client";

export interface NextBestAction {
  action: "task" | "revision" | "generate" | "recalibrate";
  reason: string;
  data: any; // Type this more strictly based on your backend models later
}

export const getNextBestAction = async (): Promise<NextBestAction> => {
  const response = await apiClient.get<NextBestAction>("/recommendations/next-best-action");
  return response.data;
};
