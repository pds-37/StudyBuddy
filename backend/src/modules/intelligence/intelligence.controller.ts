import { type RequestHandler } from "express";
import { intelligenceService } from "./intelligence.service.js";

/** Returns the Knowledge Health Dashboard metrics. */
const getHealth: RequestHandler = async (request, response, next) => {
  try {
    const health = await intelligenceService.getKnowledgeHealth(request.userId ?? "");
    response.json(health);
  } catch (error) {
    next(error);
  }
};

/** Returns today's prioritized revision list. */
const getRevisionPriorities: RequestHandler = async (request, response, next) => {
  try {
    const limit = parseInt(request.query.limit as string) || 8;
    const priorities = await intelligenceService.getRevisionPriorities(request.userId ?? "", limit);
    response.json({ priorities });
  } catch (error) {
    next(error);
  }
};

/** Returns all concept nodes with retention states. */
const getConcepts: RequestHandler = async (request, response, next) => {
  try {
    const concepts = await intelligenceService.getConcepts(request.userId ?? "");
    response.json({ concepts });
  } catch (error) {
    next(error);
  }
};

/** Returns memory decay states for all notes. */
const getDecayStates: RequestHandler = async (request, response, next) => {
  try {
    const states = await intelligenceService.getDecayStates(request.userId ?? "");
    response.json({ states });
  } catch (error) {
    next(error);
  }
};

/** Returns learning momentum and today's focus. */
const getMomentum: RequestHandler = async (request, response, next) => {
  try {
    const momentum = await intelligenceService.getMomentum(request.userId ?? "");
    response.json(momentum);
  } catch (error) {
    next(error);
  }
};

export const intelligenceController = {
  getHealth,
  getRevisionPriorities,
  getConcepts,
  getDecayStates,
  getMomentum
};
