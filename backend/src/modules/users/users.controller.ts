import { type RequestHandler } from "express";
import { usersService } from "./users.service.js";
import { updateProfileSchema } from "./users.validation.js";

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

export const usersController = {
  getProfile,
  updateProfile,
  getApiKeys,
  updateApiKeys
};
