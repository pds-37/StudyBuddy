import { Router } from "express";
import { authenticate as requireAuth } from "../../middlewares/authenticate.js";
import * as interviewController from "./interview.controller.js";

export const interviewRouter = Router();

interviewRouter.use(requireAuth);

interviewRouter.post("/", interviewController.startSession);
interviewRouter.get("/", interviewController.getUserSessions);
interviewRouter.get("/:id", interviewController.getSession);
interviewRouter.post("/:id/questions/:questionId/answer", interviewController.submitAnswer);
