import { type RequestHandler } from "express";
import { usersService } from "./users.service.js";
import { updateProfileSchema } from "./users.validation.js";
import { AIOrchestrator } from "../../core/ai-orchestrator.js";
import { UserModel } from "./user.model.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

const uploadOnboardingResume: RequestHandler = async (request, response, next) => {
  try {
    const file = request.file;
    if (!file) {
      return response.status(400).json({ error: "No resume file uploaded" });
    }

    let resumeText = "";
    if (file.mimetype === "application/pdf") {
      const data = await pdfParse(file.buffer);
      resumeText = data.text;
    } else {
      resumeText = file.buffer.toString("utf-8");
    }

    const extractedProfile = await AIOrchestrator.extractUserProfile(resumeText);
    
    // Update user model with extracted info
    const userId = request.userId;
    const user = await UserModel.findById(userId);
    if (user) {
      if (extractedProfile.name && extractedProfile.name !== "Unknown") user.name = extractedProfile.name;
      if (extractedProfile.targetRoles?.length) user.targetRoles = extractedProfile.targetRoles;
      if (extractedProfile.experienceLevel) user.experienceLevel = extractedProfile.experienceLevel;
      if (extractedProfile.currentSkills?.length) user.currentSkills = extractedProfile.currentSkills;
      user.onboardingCompleted = true;
      await user.save();
    }

    response.json({ success: true, profile: extractedProfile });
  } catch (error) {
    next(error);
  }
};

/** Returns the authenticated user's profile and onboarding state. */
const getProfile: RequestHandler = async (request, response, next) => {
  try {
    const profile = await usersService.getProfile(request.userId ?? "");
    response.json({ profile });
  } catch (error) {
    next(error);
  }
};

/** Saves profile and skills from the onboarding flow. */
const updateProfile: RequestHandler = async (request, response, next) => {
  try {
    const body = updateProfileSchema.parse(request.body);
    const profile = await usersService.updateProfile(request.userId ?? "", body);
    response.json({ profile });
  } catch (error) {
    next(error);
  }
};

/** Returns the authenticated user's custom API keys. */
const getApiKeys: RequestHandler = async (request, response, next) => {
  try {
    const apiKeys = await usersService.getApiKeys(request.userId ?? "");
    response.json({ apiKeys });
  } catch (error) {
    next(error);
  }
};

/** Updates the authenticated user's custom API keys. */
const updateApiKeys: RequestHandler = async (request, response, next) => {
  try {
    const apiKeys = await usersService.updateApiKeys(request.userId ?? "", request.body || {});
    response.json({ apiKeys });
  } catch (error) {
    next(error);
  }
};

/** Returns the authenticated user's custom AI routing mappings. */
const getAiRoutes: RequestHandler = async (request, response, next) => {
  try {
    const aiRoutes = await usersService.getAiRoutes(request.userId ?? "");
    response.json({ aiRoutes });
  } catch (error) {
    next(error);
  }
};

/** Updates the authenticated user's custom AI routing mappings. */
const updateAiRoutes: RequestHandler = async (request, response, next) => {
  try {
    const aiRoutes = await usersService.updateAiRoutes(request.userId ?? "", request.body || {});
    response.json({ aiRoutes });
  } catch (error) {
    next(error);
  }
};

export const usersController = {
  uploadOnboardingResume,
  getProfile,
  updateProfile,
  getApiKeys,
  updateApiKeys,
  getAiRoutes,
  updateAiRoutes
};
