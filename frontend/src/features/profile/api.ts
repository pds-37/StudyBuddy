import { apiClient } from "../../lib/api/client";
import { type AuthUser } from "../auth/types";

export type ProfilePayload = {
  name: string;
  targetRoles: string[];
  currentSkills: string[];
  experienceLevel: AuthUser["experienceLevel"];
  dailyStudyHours?: number;
  targetTimeline?: string;
  learningStyle?: string;
  primaryStruggle?: string;
  careerInterests?: string[];
};

/** Loads the current user's career profile. */
async function getProfile() {
  const response = await apiClient.get<{ profile: AuthUser }>("/users/me/profile");
  return response.data.profile;
}

/** Saves onboarding and profile fields for the current user. */
async function updateProfile(payload: ProfilePayload) {
  const response = await apiClient.put<{ profile: AuthUser }>("/users/me/profile", payload);
  return response.data.profile;
}

/** Uploads resume during onboarding for automated processing. */
async function uploadOnboardingResume(file: File) {
  const formData = new FormData();
  formData.append("resume", file);
  const response = await apiClient.post<{ success: boolean; profile: any }>("/users/me/onboarding/upload", formData);
  return response.data;
}

export const profileApi = {
  getProfile,
  updateProfile,
  uploadOnboardingResume
};
