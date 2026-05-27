import { ApiError } from "../../utils/api-error.js";
import { UserModel, type UserDocument } from "./user.model.js";
import { type UpdateProfileBody } from "./users.validation.js";

/** Converts a user document into the profile shape consumed by the web app. */
function toProfile(user: UserDocument) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    targetRoles: user.targetRoles,
    currentSkills: user.currentSkills,
    experienceLevel: user.experienceLevel,
    subscription: user.subscription,
    usage: user.usage,
    onboardingCompleted: user.onboardingCompleted,
    dailyStudyHours: user.availableHours,
    targetTimeline: user.preferences?.targetTimeline,
    learningStyle: user.preferences?.learningStyle,
    primaryStruggle: user.preferences?.primaryStruggle,
    careerInterests: user.preferences?.careerInterests
  };
}

/** Returns the authenticated user's profile. */
async function getProfile(userId: string) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return toProfile(user);
}

/** Returns a user document by ID. */
async function getUserById(userId: string) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
}

/** Saves onboarding and profile fields for the authenticated user. */
async function updateProfile(userId: string, payload: UpdateProfileBody) {
  const normalizedSkills = Array.from(new Set(payload.currentSkills.map((skill) => skill.trim()).filter(Boolean)));
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      name: payload.name,
      targetRoles: payload.targetRoles,
      currentSkills: normalizedSkills,
      experienceLevel: payload.experienceLevel,
      availableHours: payload.dailyStudyHours,
      preferences: {
        targetTimeline: payload.targetTimeline,
        learningStyle: payload.learningStyle,
        primaryStruggle: payload.primaryStruggle,
        careerInterests: payload.careerInterests
      },
      onboardingCompleted: true
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return toProfile(user);
}

/** Returns custom API keys for the authenticated user. */
async function getApiKeys(userId: string) {
  const user = await UserModel.findById(userId).select("+apiKeys").lean();
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return user.apiKeys || {};
}

/** Updates custom API keys for the authenticated user. */
async function updateApiKeys(userId: string, apiKeys: { groq?: string; gemini?: string; openai?: string; huggingface?: string; }) {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        "apiKeys.groq": apiKeys.groq || "",
        "apiKeys.gemini": apiKeys.gemini || "",
        "apiKeys.openai": apiKeys.openai || "",
        "apiKeys.huggingface": apiKeys.huggingface || ""
      }
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user.apiKeys || {};
}

/** Returns custom AI routing preferences for the authenticated user. */
async function getAiRoutes(userId: string) {
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return user.aiRoutes || {};
}

/** Updates custom AI routing preferences for the authenticated user. */
async function updateAiRoutes(
  userId: string,
  aiRoutes: {
    mentor?: string;
    roadmap?: string;
    quiz?: string;
    resume?: string;
    skills?: string;
    note?: string;
    interview?: string;
    mentorship?: string;
    project?: string;
  }
) {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        "aiRoutes.mentor": aiRoutes.mentor || "groq",
        "aiRoutes.roadmap": aiRoutes.roadmap || "gemini",
        "aiRoutes.quiz": aiRoutes.quiz || "groq",
        "aiRoutes.resume": aiRoutes.resume || "gemini",
        "aiRoutes.skills": aiRoutes.skills || "gemini",
        "aiRoutes.note": aiRoutes.note || "gemini",
        "aiRoutes.interview": aiRoutes.interview || "groq",
        "aiRoutes.mentorship": aiRoutes.mentorship || "gemini",
        "aiRoutes.project": aiRoutes.project || "groq"
      }
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user.aiRoutes || {};
}

export const usersService = {
  getProfile,
  getUserById,
  updateProfile,
  getApiKeys,
  updateApiKeys,
  getAiRoutes,
  updateAiRoutes
};
