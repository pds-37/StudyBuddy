import { apiClient } from "./client";
import type { ResumeTailorRequest, ResumeTailorResult } from "@studybuddy/shared";

type TailorResumeResponse = {
  result: ResumeTailorResult;
};

/** Sends resume content and target role details to the AI resume tailoring endpoint. */
export async function tailorResume(payload: ResumeTailorRequest): Promise<ResumeTailorResult> {
  const response = await apiClient.post<TailorResumeResponse>("/resume/tailor", payload);
  return response.data.result;
}

