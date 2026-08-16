import { apiClient } from "../../lib/api/client";
import { type AuthUser } from "../auth/types";
import { useAppStore } from "../../store/app-store";

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
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (isDemoMode) {
    return useAppStore.getState().user as AuthUser;
  }
  const response = await apiClient.get<{ profile: AuthUser }>("/users/me/profile");
  return response.data.profile;
}

/** Saves onboarding and profile fields for the current user. */
async function updateProfile(payload: ProfilePayload) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (isDemoMode) {
    const currentUser = useAppStore.getState().user;
    return { ...currentUser, ...payload } as AuthUser;
  }
  const response = await apiClient.put<{ profile: AuthUser }>("/users/me/profile", payload);
  return response.data.profile;
}

/** Uploads resume during onboarding for automated processing. */
async function uploadOnboardingResume(file: File) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (isDemoMode) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      profile: {
        name: "Test User",
        targetRoles: ["Senior Frontend Engineer"],
        experienceLevel: "intermediate",
        currentSkills: ["React", "TypeScript", "Node.js", "System Design"]
      }
    };
  }

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
