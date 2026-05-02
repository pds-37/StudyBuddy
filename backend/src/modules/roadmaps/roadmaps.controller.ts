import { type RequestHandler } from "express";
import { roadmapsService } from "./roadmaps.service.js";
import { generateRoadmapSchema, updateMilestoneSchema, milestoneIdParamSchema, generateFromGapsSchema } from "./roadmaps.validation.js";

/** Generates a new roadmap from skill gaps. */
const generateFromGaps: RequestHandler = async (request, response, next) => {
  try {
    const query = generateFromGapsSchema.parse(request.query);
    const roadmap = await roadmapsService.generateFromSkillGaps(request.userId ?? "", query.timelineWeeks);
    response.status(201).json({ roadmap });
  } catch (error) {
    next(error);
  }
};

/** Generates a custom roadmap with provided parameters. */
const generate: RequestHandler = async (request, response, next) => {
  try {
    const body = generateRoadmapSchema.parse(request.body);
    const roadmap = await roadmapsService.generateRoadmap(request.userId ?? "", body);
    response.status(201).json({ roadmap });
  } catch (error) {
    next(error);
  }
};

/** Retrieves the user's current roadmap. */
const get: RequestHandler = async (request, response, next) => {
  try {
    const roadmap = await roadmapsService.getRoadmap(request.userId ?? "");
    response.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

/** Updates a milestone's status. */
const updateMilestone: RequestHandler = async (request, response, next) => {
  try {
    const params = milestoneIdParamSchema.parse(request.params);
    const body = updateMilestoneSchema.parse(request.body);
    const roadmap = await roadmapsService.updateMilestoneStatus(request.userId ?? "", params.milestoneId, body.status);
    response.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

/** Generates a quiz for a milestone. */
const generateQuiz: RequestHandler = async (request, response, next) => {
  try {
    const params = milestoneIdParamSchema.parse(request.params);
    const quiz = await roadmapsService.generateQuizForMilestone(request.userId ?? "", params.milestoneId);
    response.json({ quiz });
  } catch (error) {
    next(error);
  }
};

export const roadmapsController = {
  generateFromGaps,
  generate,
  get,
  updateMilestone,
  generateQuiz
};
