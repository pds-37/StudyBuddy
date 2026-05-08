import { type RequestHandler } from "express";
import { roadmapsService } from "./roadmaps.service.js";

/** Generates a roadmap for the user. */
const generate: RequestHandler = async (request, response, next) => {
  try {
    const roadmap = await roadmapsService.generateRoadmap(request.userId ?? "", request.body);
    response.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

/** Generates a roadmap from current skill gaps. */
const generateFromGaps: RequestHandler = async (request, response, next) => {
  try {
    const timelineWeeks = request.query.timelineWeeks ? Number(request.query.timelineWeeks) : undefined;
    const roadmap = await roadmapsService.generateFromSkillGaps(request.userId ?? "", timelineWeeks);
    response.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

/** Returns the user's current roadmap. */
const get: RequestHandler = async (request, response, next) => {
  try {
    const roadmap = await roadmapsService.getRoadmap(request.userId ?? "");
    response.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

/** Updates task status. */
const updateTaskStatus: RequestHandler = async (request, response, next) => {
  try {
    const { taskId } = request.params;
    const { status } = request.body;
    const roadmap = await roadmapsService.updateTaskStatus(request.userId as string ?? "", taskId as string, status);
    response.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

/** Generates a quiz for a topic. */
const generateQuiz: RequestHandler = async (request, response, next) => {
  try {
    const { taskId } = request.params;
    const quiz = await roadmapsService.generateQuizForTask(request.userId as string ?? "", taskId as string);
    response.json({ quiz });
  } catch (error) {
    next(error);
  }
};

/** Submits a rating for a roadmap. */
const rate: RequestHandler = async (request, response, next) => {
  try {
    const { roadmapId } = request.params;
    const { rating, feedback } = request.body;
    const roadmap = await roadmapsService.rateRoadmap(request.userId as string ?? "", roadmapId as string, rating, feedback);
    response.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

/** Returns all roadmaps for the user. */
const getAll: RequestHandler = async (request, response, next) => {
  try {
    const roadmaps = await roadmapsService.getUserRoadmaps(request.userId ?? "");
    response.json({ roadmaps });
  } catch (error) {
    next(error);
  }
};

/** Expands learning journey with a new track. */
const expand: RequestHandler = async (request, response, next) => {
  try {
    const roadmap = await roadmapsService.expandRoadmap(request.userId ?? "", request.body);
    response.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

/** Injects an externally learned skill into the roadmap. */
const injectSkill: RequestHandler = async (request, response, next) => {
  try {
    const roadmap = await roadmapsService.injectExternalSkill(request.userId ?? "", request.body.skill);
    response.json({ roadmap });
  } catch (error) {
    next(error);
  }
};

export const roadmapsController = {
  generate,
  generateFromGaps,
  getAll,
  expand,
  injectSkill,
  get,
  updateTaskStatus,
  generateQuiz,
  rate
};
