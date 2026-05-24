import { type RequestHandler } from "express";
import { recallService } from "./recall.service.js";
import { recallQuerySchema, recallReviewSchema } from "./recall.validation.js";

const due: RequestHandler = async (request, response, next) => {
  try {
    const query = recallQuerySchema.parse(request.query);
    const prompts = await recallService.getDuePrompts(request.userId ?? "", query.limit, query.noteId);
    response.json({ prompts });
  } catch (error) {
    next(error);
  }
};

const review: RequestHandler = async (request, response, next) => {
  try {
    const body = recallReviewSchema.parse(request.body);
    const result = await recallService.reviewNote(request.userId ?? "", body.noteId, body.answer, body.grade);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

const stats: RequestHandler = async (request, response, next) => {
  try {
    const result = await recallService.getStats(request.userId ?? "");
    response.json(result);
  } catch (error) {
    next(error);
  }
};

export const recallController = {
  due,
  review,
  stats
};
