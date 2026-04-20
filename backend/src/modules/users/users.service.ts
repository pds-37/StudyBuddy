import { ApiError } from "../../utils/api-error.js";
import { UserModel, type UserDocument } from "./user.model.js";
import { type UpdateProfileBody } from "./users.validation.js";

/** Converts a user document into the profile shape consumed by the web app. */
function toProfile(user: UserDocument) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    targetRole: user.targetRole,
    currentSkills: user.currentSkills,
    experienceLevel: user.experienceLevel,
    onboardingCompleted: user.onboardingCompleted
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
      targetRole: payload.targetRole,
      currentSkills: normalizedSkills,
      experienceLevel: payload.experienceLevel,
      onboardingCompleted: true
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return toProfile(user);
}

export const usersService = {
  getProfile,
  getUserById,
  updateProfile
};
