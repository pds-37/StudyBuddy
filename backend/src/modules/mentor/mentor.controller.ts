import { type RequestHandler } from "express";
import { mentorService } from "./mentor.service.js";
import { mentorStrategySchema, mentorTaskFeedbackSchema, mentorTaskParamSchema, mentorTaskStatusSchema } from "./mentor.validation.js";

const today: RequestHandler = async (request, response, next) => {
  try {
    const plan = await mentorService.getTodayPlan(request.userId ?? "");
    response.json({ plan });
  } catch (error) {
    next(error);
  }
};

const updateTask: RequestHandler = async (request, response, next) => {
  try {
    const params = mentorTaskParamSchema.parse(request.params);
    const body = mentorTaskStatusSchema.parse(request.body);
    const plan = await mentorService.updateTaskStatus(request.userId ?? "", params.taskId, body.status);
    response.json({ plan });
  } catch (error) {
    next(error);
  }
};

const recordTaskFeedback: RequestHandler = async (request, response, next) => {
  try {
    const params = mentorTaskParamSchema.parse(request.params);
    const body = mentorTaskFeedbackSchema.parse(request.body);
    const plan = await mentorService.recordTaskFeedback(request.userId ?? "", params.taskId, body);
    response.json({ plan });
  } catch (error) {
    next(error);
  }
};

const adoptStrategy: RequestHandler = async (request, response, next) => {
  try {
    const body = mentorStrategySchema.parse(request.body);
    const plan = await mentorService.adoptStrategy(request.userId ?? "", body);
    response.json({ plan });
  } catch (error) {
    next(error);
  }
};

export const mentorController = {
  today,
  updateTask,
  recordTaskFeedback,
  adoptStrategy
};
