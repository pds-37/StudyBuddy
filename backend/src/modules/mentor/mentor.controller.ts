import { type RequestHandler } from "express";
import { mentorService } from "./mentor.service.js";
import { mentorTaskParamSchema, mentorTaskStatusSchema } from "./mentor.validation.js";

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

export const mentorController = {
  today,
  updateTask
};
