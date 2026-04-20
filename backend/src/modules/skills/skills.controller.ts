import { type RequestHandler } from "express";
import { skillsService } from "./skills.service.js";
import { skillSearchQuerySchema } from "./skills.validation.js";

/** Searches the skill taxonomy for onboarding autocomplete. */
const search: RequestHandler = async (request, response, next) => {
  try {
    const query = skillSearchQuerySchema.parse(request.query);
    const skills = await skillsService.searchSkills(query.q, query.limit);
    response.json({ skills });
  } catch (error) {
    next(error);
  }
};

/** Returns skill gap analysis for the authenticated user's target role. */
const gap: RequestHandler = async (request, response, next) => {
  try {
    const analysis = await skillsService.analyzeSkillGap(request.userId ?? "");
    response.json({ analysis });
  } catch (error) {
    next(error);
  }
};

export const skillsController = {
  search,
  gap
};
